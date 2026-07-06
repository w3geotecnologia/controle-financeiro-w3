// Edge function: parse-receipt
// Recebe uma imagem de recibo em base64 e usa a Lovable AI Gateway (Gemini)
// para extrair descrição, valor, data e tipo.
//
// Variáveis de ambiente esperadas (configurar no Supabase):
//   LOVABLE_API_KEY  -> chave da Lovable AI Gateway
//
// Payload: { imageBase64: string, mimeType?: string }
// Resposta: { description, amount, dueDate, type, raw }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ParseReceiptRequest {
  imageBase64: string;
  mimeType?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY não configurada no servidor.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { imageBase64, mimeType = 'image/jpeg' } = (await req.json()) as ParseReceiptRequest;
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'imageBase64 é obrigatório.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const dataUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:${mimeType};base64,${imageBase64}`;

    const systemPrompt = `Você é um assistente que extrai dados de recibos/notas fiscais brasileiras.
Retorne SEMPRE um JSON válido com os campos:
{
  "description": string (breve descrição do gasto ou estabelecimento, máx. 60 chars),
  "amount": number (valor total em reais, use ponto decimal),
  "dueDate": string (data no formato YYYY-MM-DD; use a data da compra/emissão. Se não achar, use hoje),
  "type": "despesa" | "receita" (padrão: "despesa")
}
Não inclua texto fora do JSON.`;

    const gwResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extraia os dados deste recibo.' },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!gwResp.ok) {
      const errBody = await gwResp.text();
      console.error('AI Gateway error', gwResp.status, errBody);
      return new Response(
        JSON.stringify({ error: 'Falha ao processar recibo', status: gwResp.status, details: errBody }),
        { status: gwResp.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const data = await gwResp.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '{}';

    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    const today = new Date().toISOString().split('T')[0];
    const result = {
      description: String(parsed.description ?? '').slice(0, 60),
      amount: Number(parsed.amount ?? 0) || 0,
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(parsed.dueDate) ? parsed.dueDate : today,
      type: parsed.type === 'receita' ? 'receita' : 'despesa',
      raw: parsed,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('parse-receipt error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno', details: error?.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
