import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Delete, X, Calculator as CalcIcon, ChevronUp, ChevronDown } from 'lucide-react';

interface FloatingCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

type Theme = {
  bg: string;
  header: string;
  display: string;
  btn: string;
  btnOp: string;
  btnEq: string;
  btnClear: string;
};

const THEMES: Theme[] = [
  {
    bg: 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700',
    header: 'bg-gradient-to-r from-fuchsia-700 to-indigo-800',
    display: 'bg-slate-900 text-white',
    btn: 'bg-white hover:bg-slate-100 text-slate-800',
    btnOp: 'bg-orange-400 hover:bg-orange-500 text-white',
    btnEq: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    btnClear: 'bg-red-500 hover:bg-red-600 text-white',
  },
  {
    bg: 'bg-gradient-to-br from-slate-800 to-slate-900',
    header: 'bg-gradient-to-r from-slate-900 to-slate-700',
    display: 'bg-slate-950 text-emerald-300',
    btn: 'bg-slate-700 hover:bg-slate-600 text-white',
    btnOp: 'bg-amber-500 hover:bg-amber-600 text-white',
    btnEq: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    btnClear: 'bg-red-500 hover:bg-red-600 text-white',
  },
  {
    bg: 'bg-gradient-to-br from-rose-500 to-orange-500',
    header: 'bg-gradient-to-r from-rose-600 to-orange-600',
    display: 'bg-slate-900 text-white',
    btn: 'bg-white hover:bg-rose-50 text-slate-800',
    btnOp: 'bg-slate-900 hover:bg-slate-800 text-white',
    btnEq: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    btnClear: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    bg: 'bg-gradient-to-br from-emerald-500 to-teal-700',
    header: 'bg-gradient-to-r from-emerald-700 to-teal-800',
    display: 'bg-slate-900 text-yellow-200',
    btn: 'bg-white hover:bg-emerald-50 text-slate-800',
    btnOp: 'bg-orange-400 hover:bg-orange-500 text-white',
    btnEq: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900',
    btnClear: 'bg-red-500 hover:bg-red-600 text-white',
  },
  {
    bg: 'bg-gradient-to-br from-fuchsia-600 to-cyan-500',
    header: 'bg-gradient-to-r from-fuchsia-700 to-cyan-600',
    display: 'bg-slate-900 text-cyan-200',
    btn: 'bg-white hover:bg-cyan-50 text-slate-800',
    btnOp: 'bg-yellow-400 hover:bg-yellow-500 text-slate-900',
    btnEq: 'bg-emerald-400 hover:bg-emerald-500 text-slate-900',
    btnClear: 'bg-red-500 hover:bg-red-600 text-white',
  },
];

const safeEval = (expr: string): number => {
  const clean = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/,/g, '.');
  if (!/^[0-9+\-*/.() %]+$/.test(clean)) throw new Error('inv');
  // eslint-disable-next-line no-new-func
  const result = Function(`"use strict"; return (${clean})`)();
  if (typeof result !== 'number' || !isFinite(result)) throw new Error('inv');
  return result;
};

const formatNum = (n: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 8 }).format(n);

const CALC_W = 320;
const CALC_H = 460;
const HIST_W = 240;

export const FloatingCalculator: React.FC<FloatingCalculatorProps> = ({ isOpen, onClose }) => {
  const [expr, setExpr] = useState('');
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [themeIdx, setThemeIdx] = useState(0);
  const lastThemeRef = useRef(0);
  const [historyOpen, setHistoryOpen] = useState(true);

  // Posição flutuante
  const [pos, setPos] = useState({ x: 80, y: 80 });
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setThemeIdx(Math.floor(Math.random() * THEMES.length));
      // posiciona centralizado na primeira abertura
      const w = window.innerWidth;
      const h = window.innerHeight;
      setPos({
        x: Math.max(20, Math.min(w - CALC_W - HIST_W - 40, w / 2 - (CALC_W + HIST_W) / 2)),
        y: Math.max(20, h / 2 - CALC_H / 2),
      });
    }
  }, [isOpen]);

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.preventDefault();
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current) return;
    const totalW = CALC_W + (historyOpen ? HIST_W : 0);
    const maxX = window.innerWidth - totalW;
    const maxY = window.innerHeight - 60;
    setPos({
      x: Math.max(0, Math.min(maxX, e.clientX - dragRef.current.dx)),
      y: Math.max(0, Math.min(maxY, e.clientY - dragRef.current.dy)),
    });
  }, [historyOpen]);

  const onMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const theme = THEMES[themeIdx];

  const livePreview = (() => {
    if (!expr) return '';
    try {
      return formatNum(safeEval(expr));
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
      setExpr(String(r));
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

  const COLOR_DOTS = [
    { name: 'red', cls: 'bg-red-500' },
    { name: 'green', cls: 'bg-green-500' },
    { name: 'blue', cls: 'bg-blue-500' },
  ];

  const Btn = ({
    label,
    onClick,
    variant = 'num',
    span = 1,
  }: {
    label: React.ReactNode;
    onClick: () => void;
    variant?: 'num' | 'op' | 'eq' | 'clear';
    span?: number;
  }) => (
    <button
      onClick={onClick}
      className={`h-12 rounded-xl font-semibold text-base transition-transform active:scale-95 shadow-md ${
        variant === 'op'
          ? theme.btnOp
          : variant === 'eq'
          ? theme.btnEq
          : variant === 'clear'
          ? theme.btnClear
          : theme.btn
      } ${span === 2 ? 'col-span-2' : ''}`}
    >
      {label}
    </button>
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-50 flex items-start gap-2 select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Calculadora */}
      <div
        className={`rounded-2xl shadow-2xl overflow-hidden ${theme.bg}`}
        style={{ width: CALC_W }}
      >
        {/* Header / drag handle (estilo macOS) */}
        <div
          onMouseDown={onMouseDown}
          className={`cursor-move flex items-center gap-2 px-3 py-2 ${theme.header}`}
        >
          {COLOR_DOTS.map((c) => (
            <button
              key={c.name}
              onClick={randomizeTheme}
              title="Mudar cor"
              className={`h-3 w-3 rounded-full ring-1 ring-black/20 hover:scale-110 transition ${c.cls}`}
            />
          ))}
          <div className="flex items-center gap-1.5 mx-auto text-white text-sm font-medium">
            <CalcIcon size={14} />
            Calculadora
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded p-0.5"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Display */}
        <div className="p-3">
          <div className={`rounded-xl p-3 mb-3 ${theme.display}`}>
            <div className="text-right text-xs opacity-70 min-h-[16px] break-all">
              {expr ? expr.replace(/\*/g, '×').replace(/\//g, '÷') : ''}
            </div>
            <div className="text-right text-3xl font-bold min-h-[40px] break-all">
              {livePreview || (expr ? expr : '0')}
            </div>
          </div>

          {/* Teclado */}
          <div className="grid grid-cols-4 gap-2">
            <Btn label="C" onClick={clearAll} variant="clear" />
            <Btn label={<Delete size={18} className="mx-auto" />} onClick={backspace} variant="op" />
            <Btn label="%" onClick={() => press('%')} variant="op" />
            <Btn label="÷" onClick={() => press('/')} variant="op" />

            <Btn label="7" onClick={() => press('7')} />
            <Btn label="8" onClick={() => press('8')} />
            <Btn label="9" onClick={() => press('9')} />
            <Btn label="×" onClick={() => press('*')} variant="op" />

            <Btn label="4" onClick={() => press('4')} />
            <Btn label="5" onClick={() => press('5')} />
            <Btn label="6" onClick={() => press('6')} />
            <Btn label="-" onClick={() => press('-')} variant="op" />

            <Btn label="1" onClick={() => press('1')} />
            <Btn label="2" onClick={() => press('2')} />
            <Btn label="3" onClick={() => press('3')} />
            <Btn label="+" onClick={() => press('+')} variant="op" />

            <Btn label="0" onClick={() => press('0')} span={2} />
            <Btn label="," onClick={() => press('.')} />
            <Btn label="=" onClick={equals} variant="eq" />
          </div>
        </div>
      </div>

      {/* Histórico ao lado */}
      <div
        className="rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col"
        style={{ width: historyOpen ? HIST_W : 44, height: CALC_H }}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
          {historyOpen && (
            <h3 className="text-sm font-semibold text-slate-700">Histórico</h3>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {historyOpen && history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistory([])}
                className="h-6 px-2 text-[11px] text-slate-500 hover:bg-slate-100"
              >
                Limpar
              </Button>
            )}
            <button
              onClick={() => setHistoryOpen((o) => !o)}
              className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
              title={historyOpen ? 'Recolher' : 'Expandir'}
            >
              {historyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {historyOpen && (
          <div className="flex-1 overflow-y-auto p-3">
            {expr && (
              <div className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1.5 mb-2 text-xs">
                <span className="text-slate-600 break-all">
                  {expr.replace(/\*/g, '×').replace(/\//g, '÷')}
                </span>
                <span className="ml-1 font-semibold text-sky-700">
                  = {livePreview || '…'}
                </span>
              </div>
            )}

            {history.length === 0 && !expr && (
              <p className="text-xs text-slate-400 italic text-center mt-4">
                Nenhum cálculo ainda
              </p>
            )}

            <div className="flex flex-col gap-1">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setExpr(h.result.replace(/\./g, '').replace(',', '.'))}
                  className="text-left rounded-md border border-slate-200 hover:bg-slate-50 px-2 py-1 text-xs"
                >
                  <div className="text-slate-500 break-all">
                    {h.expr.replace(/\*/g, '×').replace(/\//g, '÷')}
                  </div>
                  <div className="font-semibold text-slate-800">= {h.result}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingCalculator;
