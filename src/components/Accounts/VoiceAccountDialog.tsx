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

const RECEITA_WORDS = ['receita', 'recebimento', 'recebido', 'entrada', 'ganho', 'salario', 'deposito'];
const DESPESA_WORDS = ['despesa', 'gasto', 'gastei', 'pagamento', 'paguei', 'saida', 'conta a pagar', 'compra'];

/** Extrai o valor monetário falado (ex.: "150 reais e 50 centavos", "R$ 1.250,90", "mil e duzentos"). */
const extractAmount = (text: string): { amount: number; matched: string } => {
  const t = normalize(text);

  // 1) Números com "reais"/"R$" ou números soltos
  const numberMatches = [...t.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+)(?:[,.](\d{1,2}))?/g)];
  if (numberMatches.length > 0) {
    // Prefere o número que aparece junto de "reais" / "r$"
    const preferred =
      numberMatches.find((m) => {
        const after = t.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 12);
        const before = t.slice(Math.max(0, (m.index ?? 0) - 4), m.index ?? 0);
        return /reais|real/.test(after) || /r\$/.test(before);
      }) ?? numberMatches[numberMatches.length - 1];

    const inteiro = parseInt(preferred[1].replace(/\./g, ''), 10) || 0;
    let centavos = preferred[2] ? parseInt(preferred[2].padEnd(2, '0'), 10) : 0;

    // "e 50 centavos" após o número principal
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

  // Tipo
  let type: 'receita' | 'despesa' = 'despesa';
  if (RECEITA_WORDS.some((w) => t.includes(w))) type = 'receita';
  else if (DESPESA_WORDS.some((w) => t.includes(w))) type = 'despesa';

  // Banco: escolhe o nome mais longo encontrado na fala
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
    .replace(/\breais?\b|\bcentavos?\b|\bbanco\b|\bcartao\b|\bno\b|\bna\b|\bde\b|\bdo\b|\bda\b|\bcom\b|\bem\b|\bpara\b|\bvalor\b|\bconta\b/g, ' ')
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

  const recognitionRef = React.useRef<any>(null);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : undefined;
  const isSupported = Boolean(SpeechRecognition);

  const stopListening = React.useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setIsListening(false);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setInterim('');
      setForm({ description: '', type: 'despesa', bankId: '', amount: 0 });
    }
  }, [isOpen, stopListening]);

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: 'Recurso indisponível',
        description: 'Este navegador não suporta reconhecimento de voz. Use o Chrome no Android.',
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = '';

    recognition.onresult = (event: any) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += `${result[0].transcript} `;
        else interimText += result[0].transcript;
      }
      setInterim(interimText);
      if (finalText.trim()) {
        setTranscript(finalText.trim());
        setForm(parseTranscript(finalText.trim(), banks));
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      const msg =
        event?.error === 'not-allowed'
          ? 'Permissão de microfone negada.'
          : event?.error === 'no-speech'
          ? 'Não consegui ouvir nada. Tente novamente.'
          : 'Erro no reconhecimento de voz.';
      toast({ title: 'Cadastro por voz', description: msg, variant: 'destructive' });
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    setInterim('');
    setIsListening(true);
    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const selectedBank = banks.find((b) => b.id === form.bankId);
  const dueDate = todayISO();

  const canSave = Boolean(form.description.trim()) && form.amount > 0 && Boolean(form.bankId);

  const handleSave = () => {
    if (!canSave) {
      toast({
        title: 'Dados incompletos',
        description: 'Informe descrição, banco e valor antes de salvar.',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      description: form.description.trim(),
      amount: form.amount,
      dueDate,
      type: form.type,
      category: 'Outros',
      status: form.type === 'receita' ? 'recebido' : 'pago',
      payment_source: 'bank',
      payment_source_id: parseInt(form.bankId, 10),
      payment_source_name: selectedBank?.name || '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[95vw] sm:max-w-[420px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-600" />
            Cadastro por voz
          </DialogTitle>
          <DialogDescription className="text-xs">
            Fale, por exemplo: “Supermercado despesa Nubank 150 reais e 50 centavos”.
          </DialogDescription>
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
              {isListening ? 'Ouvindo... toque para parar' : 'Toque no microfone e fale'}
            </span>
          </div>

          {(transcript || interim) && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-medium uppercase text-slate-400">Reconhecido</p>
              <p className="text-sm text-slate-700">
                {transcript} <span className="text-slate-400">{interim}</span>
              </p>
            </div>
          )}

          {/* Campos revisáveis */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="voice-description">Descrição da conta *</Label>
              <Input
                id="voice-description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Descrição"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((p) => ({ ...p, type: v as 'receita' | 'despesa' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="despesa">Despesa</SelectItem>
                    <SelectItem value="receita">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Banco *</Label>
                <Select value={form.bankId} onValueChange={(v) => setForm((p) => ({ ...p, bankId: v }))}>
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
                placeholder="0,00"
              />
              {form.amount > 0 && (
                <p className="mt-1 text-xs text-slate-500">{formatCurrency(form.amount)}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setTranscript('');
                setInterim('');
                setForm({ description: '', type: 'despesa', bankId: '', amount: 0 });
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
            <Button
              type="button"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
