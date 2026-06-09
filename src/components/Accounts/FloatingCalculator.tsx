import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

interface FloatingCalculatorProps {
  open: boolean;
  onClose: () => void;
}

type HistoryItem = { expression: string; result: string; kind?: 'key' | 'result' };

const GRADIENTS = [
  'from-indigo-600 via-purple-600 to-pink-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-orange-500 via-red-500 to-pink-600',
  'from-sky-500 via-blue-600 to-indigo-700',
  'from-fuchsia-500 via-pink-500 to-rose-500',
  'from-lime-400 via-green-500 to-emerald-600',
  'from-yellow-400 via-orange-500 to-red-500',
  'from-violet-600 via-purple-500 to-blue-500',
];

export const FloatingCalculator: React.FC<FloatingCalculatorProps> = ({ open, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [position, setPosition] = useState({ x: 120, y: 100 });
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const draggingRef = useRef<{ dx: number; dy: number } | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      setPosition({
        x: e.clientX - draggingRef.current.dx,
        y: e.clientY - draggingRef.current.dy,
      });
    };
    const onUp = () => { draggingRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  if (!open) return null;

  const randomizeColor = () => {
    let next = gradient;
    while (next === gradient) next = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
    setGradient(next);
  };

  const startDrag = (e: React.MouseEvent) => {
    draggingRef.current = { dx: e.clientX - position.x, dy: e.clientY - position.y };
  };

  const append = (v: string) => {
    setExpression((prev) => (prev === '' && '+-*/.'.includes(v) && v !== '-' ? v : prev + v));
    setDisplay((prev) => (prev === '0' && !'+-*/.'.includes(v) ? v : prev + v));
    setHistory((h) => [...h, { expression: 'tecla', result: v, kind: 'key' }]);
  };

  const clearAll = () => { setDisplay('0'); setExpression(''); };

  const backspace = () => {
    setExpression((p) => p.slice(0, -1));
    setDisplay((p) => (p.length <= 1 ? '0' : p.slice(0, -1)));
  };

  const equals = () => {
    try {
      const safe = expression.replace(/[^0-9+\-*/.()%]/g, '');
      if (!safe) return;
      // eslint-disable-next-line no-new-func
      const r = Function(`"use strict"; return (${safe.replace(/%/g, '/100')})`)();
      const result = String(Number.isFinite(r) ? +Number(r).toFixed(8) : 'Erro');
      setHistory((h) => [...h, { expression, result, kind: 'result' }]);
      setDisplay(result);
      setExpression(result === 'Erro' ? '' : result);
    } catch {
      setDisplay('Erro');
      setExpression('');
    }
  };

  const scroll = (dir: 'up' | 'down') => {
    if (historyRef.current) {
      historyRef.current.scrollBy({ top: dir === 'up' ? -60 : 60, behavior: 'smooth' });
    }
  };

  const btn = (label: string, onClick: () => void, cls: string) => (
    <button
      onClick={onClick}
      className={`h-12 rounded-xl font-bold text-lg shadow-md active:scale-95 transition ${cls}`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed z-[100] flex gap-3 select-none"
      style={{ left: position.x, top: position.y }}
    >
      {/* Calculator */}
      <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-3 w-72">
        <div
          className="flex items-center justify-between cursor-move text-white px-1 pb-2"
          onMouseDown={startDrag}
        >
          <span className="font-bold text-sm">🧮 Calculadora</span>
          <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
            <X size={16} />
          </button>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-3 mb-3 text-right">
          <div className="text-white/60 text-xs h-4 truncate">{expression || ' '}</div>
          <div className="text-white text-3xl font-bold truncate">{display}</div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {btn('C', clearAll, 'bg-red-500 text-white hover:bg-red-600')}
          {btn('⌫', backspace, 'bg-orange-400 text-white hover:bg-orange-500')}
          {btn('%', () => append('%'), 'bg-orange-400 text-white hover:bg-orange-500')}
          {btn('÷', () => append('/'), 'bg-amber-400 text-white hover:bg-amber-500')}

          {btn('7', () => append('7'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('8', () => append('8'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('9', () => append('9'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('×', () => append('*'), 'bg-amber-400 text-white hover:bg-amber-500')}

          {btn('4', () => append('4'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('5', () => append('5'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('6', () => append('6'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('−', () => append('-'), 'bg-amber-400 text-white hover:bg-amber-500')}

          {btn('1', () => append('1'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('2', () => append('2'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('3', () => append('3'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('+', () => append('+'), 'bg-amber-400 text-white hover:bg-amber-500')}

          {btn('0', () => append('0'), 'bg-white text-slate-800 hover:bg-slate-100 col-span-2')}
          {btn(',', () => append('.'), 'bg-white text-slate-800 hover:bg-slate-100')}
          {btn('=', equals, 'bg-green-500 text-white hover:bg-green-600')}
        </div>
      </div>

      {/* History */}
      <div className="rounded-2xl shadow-2xl bg-white w-56 flex flex-col border border-slate-200">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200">
          <span className="font-bold text-sm text-slate-700">Histórico</span>
          <div className="flex items-center gap-1">
            <button onClick={() => scroll('up')} className="p-1 rounded hover:bg-slate-100 text-slate-600">
              <ChevronUp size={16} />
            </button>
            <button onClick={() => scroll('down')} className="p-1 rounded hover:bg-slate-100 text-slate-600">
              <ChevronDown size={16} />
            </button>
            <button onClick={() => setHistory([])} className="p-1 rounded hover:bg-red-50 text-red-500" title="Limpar histórico">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div ref={historyRef} className="flex-1 overflow-y-auto p-2 max-h-[380px] min-h-[200px]">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 text-center mt-4">Nenhum cálculo ainda</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h, i) => (
                <li
                  key={i}
                  onClick={() => { setDisplay(h.result); setExpression(h.result); }}
                  className="px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-100"
                >
                  <div className="text-[11px] text-slate-500 truncate">{h.expression}</div>
                  <div className="text-sm font-bold text-slate-800 text-right">= {h.result}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
