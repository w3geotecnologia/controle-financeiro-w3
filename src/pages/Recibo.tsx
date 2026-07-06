import React, { useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Camera, Upload, Loader2, ImageIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DRAFT_KEY = 'account-modal-draft-new';

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [meta, b64] = result.split(',');
      const mimeMatch = meta.match(/data:(.*?);base64/);
      resolve({ base64: b64, mimeType: mimeMatch?.[1] || file.type || 'image/jpeg' });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Recibo: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Arquivo inválido', description: 'Envie uma imagem.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { base64, mimeType } = await fileToBase64(file);
      setPreview(`data:${mimeType};base64,${base64}`);

      const { data, error } = await supabase.functions.invoke('parse-receipt', {
        body: { imageBase64: base64, mimeType },
      });

      if (error) throw error;
      if (!data || data.error) throw new Error(data?.error || 'Erro ao processar recibo');

      const draft = {
        form: {
          description: data.description || '',
          amount: Number(data.amount) || 0,
          dueDate: data.dueDate || new Date().toISOString().split('T')[0],
          type: data.type || 'despesa',
          category: '',
          status: 'pendente',
          payment_source: 'bank',
          payment_source_id: null,
          payment_source_name: '',
        },
        display: new Intl.NumberFormat('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(data.amount) || 0),
      };

      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

      toast({
        title: 'Recibo processado',
        description: 'Confira os dados e complete a categoria e o banco.',
      });

      navigate('/contas');
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Falha ao ler o recibo',
        description: err?.message || 'Tente novamente com uma imagem mais nítida.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Recibo por Foto
            </h1>
            <p className="text-sm text-slate-500">
              Tire ou envie a foto do recibo — extraímos descrição, valor e data.
            </p>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={loading}
              className="h-24 flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-green-500"
            >
              <Camera className="h-6 w-6" />
              Tirar foto
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="h-24 flex flex-col gap-2"
            >
              <Upload className="h-6 w-6" />
              Enviar imagem
            </Button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 min-h-[220px] flex items-center justify-center bg-slate-50">
            {loading ? (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm">Analisando recibo com IA…</span>
              </div>
            ) : preview ? (
              <img src={preview} alt="Prévia do recibo" className="max-h-72 rounded-lg object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Prévia da imagem aparecerá aqui</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500">
            Ao finalizar, você será levado à página de Contas com o formulário pré-preenchido para confirmar categoria e banco.
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default Recibo;
