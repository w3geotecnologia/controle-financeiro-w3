import React from 'react';
import { Mic, MicOff, Save, RotateCcw, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBanksOptions } from '@/hooks/useBanksOptions';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/formatters';
import type { AccountFormData } from '@/components/Accounts/AccountModal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface VoiceAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => void;
  isLoading?: boolean;
}

type Step = 'description' | 'type' | 'bank' | 'amount' | 'confirm';

interface FormState {
  description: string;
  type: 'receita' | 'despesa';
  bankId: string;
  bankName: string;
  amount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalize = (v: string) =>
  v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/** Palavras que avançam para o próximo campo */
const NEXT_WORDS = ['ok', 'proximo', 'próximo', 'avançar', 'avancar', 'continuar', 'confirmar', 'confirma', 'pronto'];

/** Palavras que salvam o formulário */
const SAVE_WORDS = ['salvar', 'salva', 'gravar', 'cadastrar', 'cadastra', 'enviar', 'envia', 'concluir', 'conclui', 'finalizar', 'finaliza'];

/** Palavras que limpam/reiniciam */
const CLEAR_WORDS = ['limpar', 'limpa', 'apagar', 'apaga', 'resetar', 'reseta', 'recomecar', 'recomeça', 'novo', 'cancelar'];

const isNext  = (t: string) => NEXT_WORDS.some((w) => normalize(t).includes(w));
const isSave  = (t: string) => SAVE_WORDS.some((w) => normalize(t).includes(w));
const isClear = (t: string) => CLEAR_WORDS.some((w) => normalize(t).includes(w));

/** Detecta "receita" ou "despesa" na fala */
const extractType = (t: string): 'receita' | 'despesa' | null => {
  const n = normalize(t);
  const RECEITA = ['receita', 'recebimento', 'recebido', 'entrada', 'ganho', 'salario', 'deposito', 'renda', 'credito'];
  const DESPESA = ['despesa', 'gasto', 'gastei', 'pagamento', 'paguei', 'saida', 'debito', 'compra', 'custo'];
  if (RECEITA.some((w) => n.includes(w))) return 'receita';
  if (DESPESA.some((w) => n.includes(w))) return 'despesa';
  return null;
};

/** Encontra o banco pelo nome na fala */
const extractBank = (
  t: string,
  banks: { id: string; name: string }[]
): { id: string; name: string } | null => {
  const n = normalize(t);
  let best: { id: string; name: string } | null = null;
  let bestLen = 0;
  for (const b of banks) {
    const bn = normalize(b.name);
    if (!bn) continue;
    // Verifica palavra a palavra para lidar com nomes compostos
    const words = bn.split(/\s+/);
    const allMatch = words.every((w) => n.includes(w));
    if (allMatch && bn.length > bestLen) {
      best = b;
      bestLen = bn.length;
    }
  }
  return best;
};

/** Extrai valor monetário falado */
const extractAmount = (text: string): number => {
  const t = normalize(text);

  // Números por extenso com "mil"
  const WORD_NUMS: Record<string, number> = {
    um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6,
    sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13,
    quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18,
    dezenove: 19, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50,
    sessenta: 60, setenta: 70, oitenta: 80, noventa: 90,
    cem: 100, cento: 100, duzentos: 200, trezentos: 300, quatrocentos: 400,
    quinhentos: 500, seiscentos: 600, setecentos: 700, oitocentos: 800, novecentos: 900,
  };

  const milMatch = t.match(/(?:(\w+)\s+)?mil(?:\s+e\s+(\w+(?:\s+e\s+\w+)?))?/);
  if (milMatch) {
    const prefix = milMatch[1]?.trim();
    const suffix = milMatch[2]?.trim();
    let total = prefix && WORD_NUMS[prefix] ? WORD_NUMS[prefix] * 1000 : 1000;
    if (suffix) {
      const parts = suffix.split(/\s+e\s+/);
      parts.forEach((p) => { if (WORD_NUMS[p.trim()]) total += WORD_NUMS[p.trim()]; });
    }
    // Centavos após "mil..."
    const centMatch = t.slice(t.indexOf('mil') + 3).match(/(\d{1,2})\s*centavos?/);
    if (centMatch) total += parseInt(centMatch[1], 10) / 100;
    return total;
  }

  // Números digitados / falados com dígitos
  const numMatches = [...t.matchAll(/(\d{1,3}(?:\.\d{3})+|\d+)(?:[,.](\d{1,2}))?/g)];
  if (numMatches.length > 0) {
    const preferred =
      numMatches.find((m) => {
        const after  = t.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 12);
        const before = t.slice(Math.max(0, (m.index ?? 0) - 4), m.index ?? 0);
        return /reais?|real/.test(after) || /r\$/.test(before);
      }) ?? numMatches[numMatches.length - 1];

    const inteiro = parseInt(preferred[1].replace(/\./g, ''), 10) || 0;
    let centavos  = preferred[2] ? parseInt(preferred[2].padEnd(2, '0'), 10) : 0;
    if (!preferred[2]) {
      const rest = t.slice((preferred.index ?? 0) + preferred[0].length);
      const cent = rest.match(/(\d{1,2})\s*centavos?/);
      if (cent) centavos = parseInt(cent[1], 10);
    }
    return inteiro + centavos / 100;
  }

  return 0;
};

// ─── Configuração de etapas ───────────────────────────────────────────────────

const STEPS: Step[] = ['description', 'type', 'bank', 'amount', 'confirm'];

const STEP_CONFIG: Record<Step, { label: string; prompt: string; hint: string }> = {
  description: {
    label: 'Descrição',
    prompt: 'Qual é a descrição da conta?',
    hint: 'Ex: "Supermercado" → depois diga "ok" para avançar',
  },
  type: {
    label: 'Tipo',
    prompt: 'É uma receita ou despesa?',
    hint: 'Diga "receita" ou "despesa" → depois "ok"',
  },
  bank: {
    label: 'Banco',
    prompt: 'Qual banco ou cartão?',
    hint: 'Diga o nome do banco → depois "ok"',
  },
  amount: {
    label: 'Valor',
    prompt: 'Qual o valor?',
    hint: 'Ex: "150 reais" ou "1 mil e 500" → depois "ok"',
  },
  confirm: {
    label: 'Confirmar',
    prompt: 'Pronto! Revise e salve.',
    hint: 'Diga "salvar" ou toque no botão',
  },
};

// ─── Utilitários de data ──────────────────────────────────────────────────────

const todayISO = () => {
  const d  = new Date();
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

// ─── Componente ───────────────────────────────────────────────────────────────

const EMPTY_FORM: FormState = {
  description: '',
  type: 'despesa',
  bankId: '',
  bankName: '',
  amount: 0,
};

export const VoiceAccountDialog: React.FC<VoiceAccountDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { banks } = useBanksOptions();
  const { toast } = useToast();

  const [step, setStep]           = React.useState<Step>('description');
  const [form, setForm]           = React.useState<FormState>(EMPTY_FORM);
  const [isListening, setIsListening] = React.useState(false);
  const [interim, setInterim]     = React.useState('');
  const [lastHeard, setLastHeard] = React.useState('');  // última fala reconhecida

  // Refs para evitar closures velhas nos callbacks do recognition
  const stepRef  = React.useRef<Step>('description');
  const formRef  = React.useRef<FormState>(EMPTY_FORM);
  const banksRef = React.useRef(banks);
  const recognitionRef         = React.useRef<any>(null);
  const shouldKeepListeningRef = React.useRef(false);
  const processingRef          = React.useRef(false); // evita duplo-disparo

  React.useEffect(() => { stepRef.current  = step;  }, [step]);
  React.useEffect(() => { formRef.current  = form;  }, [form]);
  React.useEffect(() => { banksRef.current = banks; }, [banks]);

  const SpeechRecognition =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : undefined;
  const isSupported = Boolean(SpeechRecognition);

  // ─── Reset ──────────────────────────────────────────────────────────────────
  const resetAll = React.useCallback(() => {
    setStep('description');
    setForm(EMPTY_FORM);
    setLastHeard('');
    setInterim('');
    processingRef.current = false;
  }, []);

  // ─── Salvar ─────────────────────────────────────────────────────────────────
  const handleSave = React.useCallback(
    (f?: FormState) => {
      const data = f ?? formRef.current;
      if (!data.description.trim() || data.amount <= 0 || !data.bankId) {
        toast({
          title: 'Dados incompletos',
          description: 'Verifique descrição, banco e valor.',
          variant: 'destructive',
        });
        return;
      }
      onSubmit({
        description:          data.description.trim(),
        amount:               data.amount,
        dueDate:              todayISO(),
        type:                 data.type,
        category:             'Outros',
        status:               data.type === 'receita' ? 'recebido' : 'pago',
        payment_source:       'bank',
        payment_source_id:    parseInt(data.bankId, 10),
        payment_source_name:  data.bankName,
      });
      onClose();
    },
    [onClose, onSubmit, toast]
  );

  // ─── Parar escuta ───────────────────────────────────────────────────────────
  const stopListening = React.useCallback(() => {
    shouldKeepListeningRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setIsListening(false);
    setInterim('');
  }, []);

  // ─── Processar fala por etapa ───────────────────────────────────────────────
  const processUtterance = React.useCallback(
    (utterance: string) => {
      if (processingRef.current) return;
      processingRef.current = true;

      const currentStep = stepRef.current;
      const currentForm = formRef.current;
      const currentBanks = banksRef.current;

      setLastHeard(utterance);

      // Comandos globais (qualquer etapa)
      if (isClear(utterance)) {
        resetAll();
        toast({ title: '🎤 Formulário limpo', description: 'Comece novamente.' });
        processingRef.current = false;
        return;
      }

      if (isSave(utterance)) {
        handleSave();
        processingRef.current = false;
        return;
      }

      // Lógica por etapa
      let nextStep: Step | null = null;
      let updatedForm = currentForm;

      switch (currentStep) {
        case 'description': {
          // Qualquer fala não-comando vira descrição
          const clean = utterance
            .replace(/\b(ok|próximo|proximo|avançar|avancar|continuar|confirmar|pronto)\b/gi, '')
            .trim();
          if (clean) {
            updatedForm = {
              ...currentForm,
              description: clean.charAt(0).toUpperCase() + clean.slice(1),
            };
            setForm(updatedForm);
          }
          if (isNext(utterance) && updatedForm.description) nextStep = 'type';
          break;
        }

        case 'type': {
          const detectedType = extractType(utterance);
          if (detectedType) {
            updatedForm = { ...currentForm, type: detectedType };
            setForm(updatedForm);
            // Avança automaticamente ao detectar tipo (não precisa de "ok")
            nextStep = 'bank';
          } else if (isNext(utterance)) {
            nextStep = 'bank'; // Mantém o tipo padrão (despesa)
          }
          break;
        }

        case 'bank': {
          const detectedBank = extractBank(utterance, currentBanks);
          if (detectedBank) {
            updatedForm = { ...currentForm, bankId: detectedBank.id, bankName: detectedBank.name };
            setForm(updatedForm);
            // Avança automaticamente ao reconhecer o banco
            nextStep = 'amount';
          } else if (isNext(utterance)) {
            if (updatedForm.bankId) nextStep = 'amount';
            else {
              toast({
                title: 'Banco não reconhecido',
                description: 'Diga o nome do banco cadastrado.',
                variant: 'destructive',
              });
            }
          }
          break;
        }

        case 'amount': {
          const detectedAmount = extractAmount(utterance);
          if (detectedAmount > 0) {
            updatedForm = { ...currentForm, amount: detectedAmount };
            setForm(updatedForm);
            // Avança automaticamente ao reconhecer o valor
            nextStep = 'confirm';
          } else if (isNext(utterance) && currentForm.amount > 0) {
            nextStep = 'confirm';
          }
          break;
        }

        case 'confirm': {
          if (isSave(utterance) || isNext(utterance)) {
            handleSave(updatedForm);
          }
          break;
        }
      }

      if (nextStep) setStep(nextStep);
      processingRef.current = false;
    },
    [handleSave, resetAll, toast]
  );

  // ─── Motor de reconhecimento (reinicio automático) ──────────────────────────
  const startRecognition = React.useCallback(() => {
    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let sessionText = '';

    recognition.onresult = (event: any) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) sessionText += `${r[0].transcript} `;
        else interimText += r[0].transcript;
      }
      setInterim(interimText);

      if (sessionText.trim()) {
        processUtterance(sessionText.trim());
        sessionText = ''; // reseta para próxima sessão
      }
    };

    recognition.onerror = (event: any) => {
      if (event?.error === 'no-speech') return; // silencioso
      if (event?.error === 'not-allowed') {
        shouldKeepListeningRef.current = false;
        setIsListening(false);
        toast({ title: 'Microfone negado', description: 'Permita o acesso ao microfone.', variant: 'destructive' });
      }
    };

    recognition.onend = () => {
      setInterim('');
      if (shouldKeepListeningRef.current) {
        // Aguarda 200 ms e reinicia para escuta contínua
        setTimeout(() => {
          if (shouldKeepListeningRef.current) startRecognition();
        }, 200);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch { setIsListening(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, processUtterance, toast]);

  const startListening = React.useCallback(() => {
    if (!isSupported) {
      toast({
        title: 'Não suportado',
        description: 'Use o Chrome no Android para reconhecimento de voz.',
        variant: 'destructive',
      });
      return;
    }
    shouldKeepListeningRef.current = true;
    setIsListening(true);
    startRecognition();
  }, [isSupported, startRecognition, toast]);

  // ─── Limpa ao fechar ────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!isOpen) {
      stopListening();
      resetAll();
    }
  }, [isOpen, stopListening, resetAll]);

  // ─── UI helpers ─────────────────────────────────────────────────────────────
  const canSave = form.description.trim().length > 0 && form.amount > 0 && Boolean(form.bankId);
  const dueDate = todayISO();
  const stepIndex = STEPS.indexOf(step);
  const cfg = STEP_CONFIG[step];

  const stepColor = (s: Step) => {
    const si = STEPS.indexOf(s);
    if (si < stepIndex) return 'bg-green-500 text-white';
    if (si === stepIndex) return 'bg-blue-600 text-white';
    return 'bg-slate-200 text-slate-400';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[95vw] sm:max-w-[420px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-600" />
            Cadastro por voz
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {cfg.prompt} — {cfg.hint}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* Progresso das etapas */}
          <div className="flex items-center gap-1">
            {STEPS.filter((s) => s !== 'confirm').map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${stepColor(s)}`}
                >
                  {STEPS.indexOf(s) < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < 3 && <div className={`h-0.5 flex-1 transition-colors ${STEPS.indexOf(s) < stepIndex ? 'bg-green-400' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* Botão microfone */}
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
            <span className="text-xs text-slate-500 text-center">
              {isListening ? '🔴 Ouvindo… toque para parar' : 'Toque para falar'}
            </span>
          </div>

          {/* Último reconhecido + interim */}
          {(lastHeard || interim) && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">Reconhecido</p>
              {lastHeard && <p className="text-sm text-slate-700">{lastHeard}</p>}
              {interim  && <p className="text-sm text-slate-400 italic">{interim}</p>}
            </div>
          )}

          {/* ── Campos do formulário ─────────────────────────────── */}
          <div className="space-y-3">

            {/* Descrição */}
            <div className={`rounded-lg border p-3 transition-colors ${step === 'description' ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
              <Label htmlFor="v-desc" className="mb-1 block text-xs font-semibold text-slate-500">
                1. Descrição *
              </Label>
              <Input
                id="v-desc"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder={step === 'description' ? '🎤 Aguardando sua fala…' : 'Descrição'}
                className="bg-white"
              />
              {step === 'description' && (
                <p className="mt-1 text-[11px] text-blue-500">Fale a descrição → diga <strong>"ok"</strong> para avançar</p>
              )}
            </div>

            {/* Tipo */}
            <div className={`rounded-lg border p-3 transition-colors ${step === 'type' ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
              <Label className="mb-1 block text-xs font-semibold text-slate-500">2. Tipo *</Label>
              <div className="flex gap-2">
                {(['despesa', 'receita'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setForm((p) => ({ ...p, type: t }));
                      if (step === 'type') setStep('bank');
                    }}
                    className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                      form.type === t
                        ? t === 'despesa'
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-green-400 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-white text-slate-500'
                    }`}
                  >
                    {t === 'despesa' ? '↓ Despesa' : '↑ Receita'}
                  </button>
                ))}
              </div>
              {step === 'type' && (
                <p className="mt-1 text-[11px] text-blue-500">Diga <strong>"despesa"</strong> ou <strong>"receita"</strong> → avança automaticamente</p>
              )}
            </div>

            {/* Banco */}
            <div className={`rounded-lg border p-3 transition-colors ${step === 'bank' ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
              <Label className="mb-1 block text-xs font-semibold text-slate-500">3. Banco *</Label>
              {/* Valor atual reconhecido */}
              {form.bankId ? (
                <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700">{form.bankName}</span>
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400">
                  {step === 'bank' ? '🎤 Diga o nome do banco…' : '—'}
                </div>
              )}
              {/* Bancos disponíveis (chips clicáveis) */}
              <div className="mt-2 flex flex-wrap gap-1">
                {banks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setForm((p) => ({ ...p, bankId: b.id, bankName: b.name }));
                      if (step === 'bank') setStep('amount');
                    }}
                    className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors ${
                      form.bankId === b.id
                        ? 'border-blue-400 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
              {step === 'bank' && (
                <p className="mt-1 text-[11px] text-blue-500">Diga o nome do banco → avança automaticamente</p>
              )}
            </div>

            {/* Valor */}
            <div className={`rounded-lg border p-3 transition-colors ${step === 'amount' ? 'border-blue-400 bg-blue-50' : 'border-slate-200'}`}>
              <Label htmlFor="v-amount" className="mb-1 block text-xs font-semibold text-slate-500">4. Valor *</Label>
              <Input
                id="v-amount"
                inputMode="decimal"
                value={form.amount ? form.amount.toFixed(2).replace('.', ',') : ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  setForm((p) => ({ ...p, amount: digits ? parseInt(digits, 10) / 100 : 0 }));
                }}
                placeholder={step === 'amount' ? '🎤 Diga o valor…' : '0,00'}
                className="bg-white"
              />
              {form.amount > 0 && (
                <p className="mt-1 text-xs font-semibold text-green-600">{formatCurrency(form.amount)}</p>
              )}
              {step === 'amount' && (
                <p className="mt-1 text-[11px] text-blue-500">Ex: <strong>"150 reais"</strong> ou <strong>"1 mil e 500"</strong> → avança automaticamente</p>
              )}
            </div>

            {/* Vencimento / Status (fixos) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500">Vencimento</Label>
                <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  {formatDateBR(dueDate)}
                </div>
              </div>
              <div>
                <Label className="text-xs text-slate-500">Status</Label>
                <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  {form.type === 'receita' ? 'Recebido' : 'Pago'}
                </div>
              </div>
            </div>
          </div>

          {/* Dica de comandos globais */}
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
            <p className="text-[11px] text-blue-600">
              💬 A qualquer momento: <strong>"salvar"</strong> para confirmar · <strong>"limpar"</strong> para recomeçar
            </p>
          </div>

          {/* Botões manuais */}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={resetAll}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
            {step !== 'confirm' && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  const next = STEPS[stepIndex + 1];
                  if (next) setStep(next);
                }}
              >
                Próximo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleSave()}
              disabled={isLoading || !canSave}
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
