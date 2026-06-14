import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Delete, Palette } from 'lucide-react';

interface FloatingCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

type Theme = {
  bg: string;
  display: string;
  btn: string;
  btnOp: string;
  btnEq: string;
  text: string;
};

const THEMES: Theme[] = [
  {
    bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
    display: 'bg-slate-950/60 text-emerald-300',
    btn: 'bg-slate-700 hover:bg-slate-600 text-white',
    btnOp: 'bg-amber-500 hover:bg-amber-600 text-white',
    btnEq: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    text: 'text-white',
  },
  {
    bg: 'bg-gradient-to-br from-indigo-600 to-purple-700',
    display: 'bg-white/10 text-white',
    btn: 'bg-white/20 hover:bg-white/30 text-white',
    btnOp: 'bg-pink-500 hover:bg-pink-600 text-white',
    btnEq: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900',
    text: 'text-white',
  },
  {
    bg: 'bg-gradient-to-br from-rose-500 to-orange-500',
    display: 'bg-white/20 text-white',
    btn: 'bg-white/25 hover:bg-white/40 text-white',
    btnOp: 'bg-slate-900 hover:bg-slate-800 text-white',
    btnEq: 'bg-emerald-400 hover:bg-emerald-500 text-slate-900',
    text: 'text-white',
  },
  {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
    display: 'bg-black/30 text-yellow-200',
    btn: 'bg-white/20 hover:bg-white/30 text-white',
    btnOp: 'bg-orange-400 hover:bg-orange-500 text-white',
    btnEq: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900',
    text: 'text-white',
  },
  {
    bg: 'bg-gradient-to-br from-zinc-100 to-zinc-300',
    display: 'bg-white text-slate-900 border border-slate-200',
    btn: 'bg-white hover:bg-zinc-50 text-slate-800 border border-slate-200',
    btnOp: 'bg-blue-500 hover:bg-blue-600 text-white',
    btnEq: 'bg-green-500 hover:bg-green-600 text-white',
    text: 'text-slate-900',
  },
  {
    bg: 'bg-gradient-to-br from-fuchsia-600 to-cyan-500',
    display: 'bg-black/40 text-cyan-200',
    btn: 'bg-white/20 hover:bg-white/30 text-white',
    btnOp: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900',
    btnEq: 'bg-emerald-400 hover:bg-emerald-500 text-slate-900',
    text: 'text-white',
  },
];

const safeEval = (expr: string): number => {
  // Sanitize: only numbers, operators, dot, parens
  const clean = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
  if (!/^[0-9+\-*/.() ]+$/.test(clean)) throw new Error('inv');
  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${clean})`)();
  if (typeof result !== 'number' || !isFinite(result)) throw new Error('inv');
  return result;
};

const formatNum = (n: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 }).format(n);

export const FloatingCalculator: React.FC<FloatingCalculatorProps> = ({ isOpen, onClose }) => {
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [themeIdx, setThemeIdx] = useState(0);
  const lastThemeRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setThemeIdx(Math.floor(Math.random() * THEMES.length));
    }
  }, [isOpen]);

  const theme = THEMES[themeIdx];

  const livePreview = (() => {
    if (!expr) return '';
    try {
      const r = safeEval(expr);
      return formatNum(r);
    } catch {
      return '';
    }
  })();

  const press = (v: string) => setExpr((p) => p + v);
  const clearAll = () => setExpr('');
  const backspace = () => setExpr((p) => p.slice(0, -1));
  const equals = () => {
    if (!expr) return;
    try {
      const r = safeEval(expr);
      const formatted = formatNum(r);
      setHistory((h) => [{ expr, result: formatted }, ...h].slice(0, 50));
      setExpr(formatted.replace(/\./g, '').replace(',', '.'));
    } catch {
      /* noop */
    }
  };

  const randomizeTheme = () => {
    let next = lastThemeRef.current;
    while (next === lastThemeRef.current && THEMES.length > 1) {
      next = Math.floor(Math.random() * THEMES.length);
    }
    lastThemeRef.current = next;
    setThemeIdx(next);
  };

  const Btn = ({
    label,
    onClick,
    variant = 'num',
    className = '',
  }: {
    label: React.ReactNode;
    onClick: () => void;
    variant?: 'num' | 'op' | 'eq';
    className?: string;
  }) => (
    <button
      onClick={onClick}
      className={`h-12 rounded-lg font-semibold text-base transition-transform active:scale-95 shadow ${
        variant === 'op' ? theme.btnOp : variant === 'eq' ? theme.btnEq : theme.btn
      } ${className}`}
    >
      {label}
    </button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-0">
        <DialogTitle className="sr-only">Calculadora</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Calculadora */}
          <div className={`p-5 ${theme.bg}`}>
            {/* Topo: 3 botões de cor */}
            <div className="flex items-center gap-2 mb-4">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={randomizeTheme}
                  title="Mudar cor"
                  className="h-8 w-8 rounded-full border-2 border-white/40 shadow flex items-center justify-center bg-gradient-to-br from-white/30 to-white/10 hover:scale-110 transition"
                >
                  <Palette size={14} className={theme.text} />
                </button>
              ))}
              <span className={`ml-auto text-xs ${theme.text} opacity-80`}>Calculadora</span>
            </div>

            {/* Display */}
            <div className={`rounded-lg p-3 mb-3 ${theme.display}`}>
              <div className="text-right text-sm opacity-70 min-h-[20px] break-all">
                {expr || '0'}
              </div>
              <div className="text-right text-2xl font-bold min-h-[32px] break-all">
                {livePreview || (expr ? '' : '0')}
              </div>
            </div>

            {/* Teclado */}
            <div className="grid grid-cols-4 gap-2">
              <Btn label="C" onClick={clearAll} variant="op" />
              <Btn label={<Delete size={18} className="mx-auto" />} onClick={backspace} variant="op" />
              <Btn label="(" onClick={() => press('(')} variant="op" />
              <Btn label=")" onClick={() => press(')')} variant="op" />

              <Btn label="7" onClick={() => press('7')} />
              <Btn label="8" onClick={() => press('8')} />
              <Btn label="9" onClick={() => press('9')} />
              <Btn label="÷" onClick={() => press('/')} variant="op" />

              <Btn label="4" onClick={() => press('4')} />
              <Btn label="5" onClick={() => press('5')} />
              <Btn label="6" onClick={() => press('6')} />
              <Btn label="×" onClick={() => press('*')} variant="op" />

              <Btn label="1" onClick={() => press('1')} />
              <Btn label="2" onClick={() => press('2')} />
              <Btn label="3" onClick={() => press('3')} />
              <Btn label="-" onClick={() => press('-')} variant="op" />

              <Btn label="0" onClick={() => press('0')} />
              <Btn label="." onClick={() => press('.')} />
              <Btn label="=" onClick={equals} variant="eq" />
              <Btn label="+" onClick={() => press('+')} variant="op" />
            </div>
          </div>

          {/* Histórico */}
          <div className="bg-white p-5 flex flex-col max-h-[520px]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">Histórico</h3>
              {history.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistory([])}
                  className="h-7 px-2 text-xs text-slate-500"
                >
                  Limpar
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {/* Linha em tempo real */}
              {expr && (
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
                  <div className="text-xs text-slate-500">Digitando</div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-slate-700 break-all">
                      {expr.replace(/\*/g, '×').replace(/\//g, '÷')}
                    </span>
                    <span className="text-sm font-semibold text-blue-700 whitespace-nowrap">
                      = {livePreview || '…'}
                    </span>
                  </div>
                </div>
              )}

              {history.length === 0 && !expr && (
                <p className="text-xs text-slate-400 italic">
                  Nenhum cálculo ainda. Comece a digitar para ver o resultado em tempo real.
                </p>
              )}

              {history.map((h, i) => (
                <div
                  key={i}
                  className="rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setExpr(h.result.replace(/\./g, '').replace(',', '.'))}
                  title="Clique para reutilizar"
                >
                  <div className="text-xs text-slate-500 break-all">
                    {h.expr.replace(/\*/g, '×').replace(/\//g, '÷')}
                  </div>
                  <div className="text-right text-sm font-semibold text-slate-800">
                    = {h.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FloatingCalculator;
