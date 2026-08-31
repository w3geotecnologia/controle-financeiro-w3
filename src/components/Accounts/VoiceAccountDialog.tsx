import React from 'react';
import { Mic, MicOff, Save, RotateCcw, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBanksOptions } from '@/hooks/useBanksOptions';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';
import type { AccountFormData } from '@/components/Accounts/AccountModal';

interface VoiceAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => void;
  isLoading?: boolean;
}

interface ParsedVoiceAccount {
  description: string;
  type: 'receita' | 'despesa';
  bankId: string;
  amount: number;
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const RECEITA_WORDS = ['receita', 'recebimento', 'recebido', 'entrada', 'ganho', 'salario', 'deposito', 'renda'];
const DESPESA_WORDS = ['despesa', 'gasto', 'gastei', 'pagamento', 'paguei', 'saida', 'conta a pagar', 'compra', 'debito'];

// Comandos de ação reconhecidos por voz
const SAVE_COMMANDS = ['salvar', 'salva', 'confirmar', 'confirma', 'gravar', 'cadastrar', 'cadastra', 'enviar', 'envia', 'ok salvar', 'pode salvar'];
const CLEAR_COMMANDS = ['limpar', 'limpa', 'apagar', 'apaga', 'resetar', 'reseta', 'recomecar', 'recomeça', 'limpar tudo', 'apagar tudo', 'novo'];

/** Detecta comando de ação na fala (salvar / limpar) */
const detectActionCommand = (text: string): 'save' | 'clear' | null => {
  const t = normalize(text);
  if (SAVE_COMMANDS.some((cmd) => t.includes(cmd))) return 'save';
  if (CLEAR_COMMANDS.some((cmd) => t.includes(cmd))) return 'clear';
  return null;
};

/** Extrai o valor monetário falado (ex.: "150 reais e 50 centavos", "R$ 1.250,90", "mil e duzentos"). */
const extractAmount = (text: string): { amount: number; matched: string } => {
  const t = normalize(text);

  // Mil por extenso: "mil", "dois mil", "tres mil e quinhentos"
  const wordMillMatch = t.match(/(\w+\s+)?mil(\s+e\s+\w+)?/);
  if (wordMillMatch) {
    const HUNDREDS: Record<string, number> = {
      cem: 100, cento: 100, duzentos: 200, trezentos: 300, quatrocentos: 400,
      quinhentos: 500, seiscentos: 600, setecentos: 700, oitocentos: 800, novecentos: 900,
    };
    const WORD_NUMS: Record<string, number> = {
      um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6,
      sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13,
      quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18,
      dezenove: 19, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
      sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, ...HUNDREDS,
    };
    const milPrefix = wordMillMatch[1]?.trim();
    let thousands = milPrefix && WORD_NUMS[milPrefix] ? WORD_NUMS[milPrefix] * 1000 : 1000;
    const milSuffix = wordMillMatch[2]?.replace(/\se\s/, '').trim();
    if (milSuffix && WORD_NUMS[milSuffix]) thousands += WORD_NUMS[milSuffix];
    if (thousands > 0) return { amount: thousands, matched: wordMillMatch[0] };
  }

  // Números digitados / falados com reais
  const numberMatches = [...t.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+)(?:[,.](\d{1,2}))?/g)];
  if (numberMatches.length > 0) {
    const preferred =
      numberMatches.find((m) => {
        const after = t.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 12);
        const before = t.slice(Math.max(0, (m.index ?? 0) - 4), m.index ?? 0);
        return /reais|real/.test(after) || /r\$/.test(before);
      }) ?? numberMatches[numberMatches.length - 1];

    const inteiro = parseInt(preferred[1].replace(/\./g, ''), 10) || 0;
    let centavos = preferred[2] ? parseInt(preferred[2].padEnd(2, '0'), 10) : 0;

    if (!preferred[2]) {
      const rest = t.slice((preferred.index ?? 0) + preferred[0].length);
      const cent = rest.match(/(\d{1,2})\s*centavos?/);
      if (cent) centavos = parseInt(cent[1], 10);
    }

    return { amount: inteiro + centavos / 100, matched: preferred[0] };
  }

  return { amount: 0, matched: '' };
};

const parseTranscript = (
  transcript: string,
  banks: { id: string; name: string }[]
): ParsedVoiceAccount => {
  const t = normalize(transcript);

  // Tipo — detectado por palavras-chave na fala
  let type: 'receita' | 'despesa' = 'despesa';
  if (RECEITA_WORDS.some((w) => t.includes(w))) type = 'receita';
  else if (DESPESA_WORDS.some((w) => t.includes(w))) type = 'despesa';

  // Banco — escolhe o nome mais longo encontrado na fala
  let bankId = '';
  let bankMatch = '';
  for (const bank of banks) {
    const name = normalize(bank.name);
    if (!name) continue;
    if (t.includes(name) && name.length > bankMatch.length) {
      bankMatch = name;
      bankId = bank.id;
    }
  }

  const { amount, matched } = extractAmount(transcript);

  // Descrição: remove palavras de tipo, banco, valor e conectores
  let desc = t;
  [...RECEITA_WORDS, ...DESPESA_WORDS].forEach((w) => {
    desc = desc.replace(new RegExp(`\\b${w}\\b`, 'g'), ' ');
  });
  if (bankMatch) desc = desc.replace(bankMatch, ' ');
  if (matched) desc = desc.replace(normalize(matched), ' ');
  desc = desc
    .replace(/r\$/g, ' ')
    .replace(
      /\breais?\b|\bcentavos?\b|\bbanco\b|\bcartao\b|\bno\b|\bna\b|\bde\b|\bdo\b|\bda\b|\bcom\b|\bem\b|\bpara\b|\bvalor\b|\bconta\b|\bmil\b/g,
      ' '
    )
    .replace(/\d+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const description = desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : '';

  return { description, type, bankId, amount };
};

const todayISO = () => {
  const d = new Date();
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

/** Intervalo de silêncio (ms) após a última fala antes de reiniciar automaticamente */
const SILENCE_RESTART_MS = 1800;

export const VoiceAccountDialog: React.FC<VoiceAccountDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { banks } = useBanksOptions();
  const { toast } = useToast();

  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [interim, setInterim] = React.useState('');
  const [form, setForm] = React.useState<ParsedVoiceAccount>({
    description: '',
    type: 'despesa',
    bankId: '',
    amount: 0,
  });

  // Refs para controle contínuo
  const recognitionRef = React.useRef<any>(null);
  const shouldKeepListeningRef = React.useRef(false);
  const silenceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = React.useRef(form);
  const canSaveRef = React.useRef(false);

  // Mantém refs sincronizados com o estado
  React.useEffect(() => { formRef.current = form; }, [form]);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : undefined;
  const isSupported = Boolean(SpeechRecognition);

  const canSave =
    Boolean(form.description.trim()) && form.amount > 0 && Boolean(form.bankId);
  React.useEffect(() => { canSaveRef.current = canSave; }, [canSave]);

  const selectedBank = banks.find((b) => b.id === form.bankId);
  const dueDate = todayISO();

  // ─── Ação: Salvar ────────────────────────────────────────────────
  const handleSave = React.useCallback(
    (currentForm?: ParsedVoiceAccount) => {
      const f = currentForm ?? formRef.current;
      const ok = Boolean(f.description.trim()) && f.amount > 0 && Boolean(f.bankId);
      if (!ok) {
        toast({
          title: 'Dados incompletos',
          description: 'Informe descrição, banco e valor antes de salvar.',
          variant: 'destructive',
        });
        return;
      }
      const bank = banks.find((b) => b.id === f.bankId);
      onSubmit({
        description: f.description.trim(),
        amount: f.amount,
        dueDate: todayISO(),
        type: f.type,
        category: 'Outros',
        status: f.type === 'receita' ? 'recebido' : 'pago',
        payment_source: 'bank',
        payment_source_id: parseInt(f.bankId, 10),
        payment_source_name: bank?.name || '',
      });
      onClose();
    },
    [banks, onClose, onSubmit, toast]
  );

  // ─── Ação: Limpar ─────────────────────────────────────────────────
  const handleClear = React.useCallback(() => {
    setTranscript('');
    setInterim('');
    setForm({ description: '', type: 'despesa', bankId: '', amount: 0 });
  }, []);

  // ─── Parar gravação ───────────────────────────────────────────────
  const stopListening = React.useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setIsListening(false);
    setInterim('');
  }, []);

  // ─── Iniciar (ou reiniciar) reconhecimento contínuo ───────────────
  const startRecognition = React.useCallback(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;      // evita problemas de timeout no Android
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let sessionFinalText = '';

    recognition.onresult = (event: any) => {
      // Reinicia o timer de silêncio a cada resultado
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          sessionFinalText += `${result[0].transcript} `;
        } else {
          interimText += result[0].transcript;
        }
      }
      setInterim(interimText);

      if (sessionFinalText.trim()) {
        setTranscript(sessionFinalText.trim());

        // Detecta comandos de ação antes de tentar parsear dados
        const action = detectActionCommand(sessionFinalText.trim());
        if (action === 'save') {
          toast({ title: '🎤 Comando reconhecido', description: 'Salvando…' });
          // Pequeno delay para feedback de toast aparecer
          setTimeout(() => handleSave(), 300);
          return;
        }
        if (action === 'clear') {
          toast({ title: '🎤 Comando reconhecido', description: 'Limpando formulário.' });
          handleClear();
          sessionFinalText = '';
          return;
        }

        // Parseia os dados normalmente
        const parsed = parseTranscript(sessionFinalText.trim(), banks);
        setForm(parsed);
      }

      // Timer: se ficar 1.8 s sem fala, reinicia automaticamente
      if (shouldKeepListeningRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          if (shouldKeepListeningRef.current) {
            try { recognitionRef.current?.stop(); } catch { /* ignore */ }
          }
        }, SILENCE_RESTART_MS);
      }
    };

    recognition.onerror = (event: any) => {
      // "no-speech" é normal — apenas reinicia silenciosamente
      if (event?.error === 'no-speech') return;
      if (event?.error === 'not-allowed') {
        shouldKeepListeningRef.current = false;
        setIsListening(false);
        toast({
          title: 'Cadastro por voz',
          description: 'Permissão de microfone negada.',
          variant: 'destructive',
        });
        return;
      }
      // Outros erros: reinicia se ainda deve continuar
    };

    recognition.onend = () => {
      setInterim('');
      if (shouldKeepListeningRef.current) {
        // Reinicia imediatamente para manter escuta contínua
        try { startRecognition(); } catch { /* ignore */ }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
      shouldKeepListeningRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banks, handleClear, handleSave, isSupported, toast]);

  // ─── Botão: Iniciar gravação ──────────────────────────────────────
  const startListening = React.useCallback(() => {
    if (!isSupported) {
      toast({
        title: 'Recurso indisponível',
        description: 'Este navegador não suporta reconhecimento de voz. Use o Chrome no Android.',
        variant: 'destructive',
      });
      return;
    }
    shouldKeepListeningRef.current = true;
    setIsListening(true);
    setInterim('');
    startRecognition();
  }, [isSupported, startRecognition, toast]);

  // ─── Limpa ao fechar ──────────────────────────────────────────────
  React.useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setInterim('');
      setForm({ description: '', type: 'despesa', bankId: '', amount: 0 });
    }
  }, [isOpen, stopListening]);

  // ─── Dica de comandos de voz disponíveis ─────────────────────────
  const voiceHint =
    'Fale: "Supermercado despesa Nubank 150 reais" · Comandos: "salvar" ou "limpar"';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[95vw] sm:max-w-[420px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-600" />
            Cadastro por voz
          </DialogTitle>
          <DialogDescription className="text-xs">{voiceHint}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Botão de gravação */}
          <div className="flex flex-col items-center gap-2">
            <Button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`h-20 w-20 rounded-full p-0 text-white shadow-lg transition-all ${
                isListening
                  ? 'bg-gradient-to-b from-red-400 to-red-600 animate-pulse'
                  : 'bg-gradient-to-b from-blue-500 to-blue-700'
              }`}
              aria-label={isListening ? 'Parar gravação' : 'Iniciar gravação'}
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
            <span className="text-xs text-slate-500">
              {isListening
                ? '🔴 Ouvindo continuamente… toque para parar'
                : 'Toque no microfone e fale'}
            </span>
          </div>

          {/* Transcrição ao vivo */}
          {(transcript || interim) && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium uppercase text-slate-400">Reconhecido</p>
              <p className="text-sm text-slate-700">
                {transcript} <span className="text-slate-400 italic">{interim}</span>
              </p>
            </div>
          )}

          {/* Campos revisáveis — preenchidos automaticamente pela voz */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="voice-description">Descrição da conta *</Label>
              <Input
                id="voice-description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Diga o nome da conta"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, type: v as 'receita' | 'despesa' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="despesa">Despesa</SelectItem>
                    <SelectItem value="receita">Receita</SelectItem>
                  </SelectContent>
                </Select>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Auto: diga "despesa" ou "receita"
                </p>
              </div>
              <div>
                <Label>Banco *</Label>
                <Select
                  value={form.bankId}
                  onValueChange={(v) => setForm((p) => ({ ...p, bankId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  Auto: diga o nome do banco
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vencimento</Label>
                <div className="flex h-10 items-center rounded-md border border-input bg-slate-50 px-3 text-sm text-slate-700">
                  {formatDateBR(dueDate)}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex h-10 items-center rounded-md border border-input bg-slate-50 px-3 text-sm text-slate-700">
                  {form.type === 'receita' ? 'Recebido' : 'Pago'}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="voice-amount">Valor *</Label>
              <Input
                id="voice-amount"
                inputMode="decimal"
                value={form.amount ? form.amount.toFixed(2).replace('.', ',') : ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  setForm((p) => ({ ...p, amount: digits ? parseInt(digits, 10) / 100 : 0 }));
                }}
                placeholder="Diga o valor em reais"
              />
              {form.amount > 0 && (
                <p className="mt-1 text-xs text-slate-500">{formatCurrency(form.amount)}</p>
              )}
              <p className="mt-0.5 text-[10px] text-slate-400">
                Auto: diga "150 reais" ou "1 mil e 500"
              </p>
            </div>
          </div>

          {/* Dica de comandos por voz */}
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
            <p className="text-[11px] text-blue-600 font-medium">💬 Comandos por voz</p>
            <p className="text-[11px] text-blue-500">
              Diga <strong>"salvar"</strong> para confirmar · <strong>"limpar"</strong> para recomeçar
            </p>
          </div>

          {/* Ações manuais */}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClear}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
            <Button
              type="button"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleSave()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
