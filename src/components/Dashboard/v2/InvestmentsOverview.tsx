import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { useInvestmentsData } from '@/hooks/useInvestmentsData';

const COLORS = [
  'hsl(var(--brand))',
  'hsl(var(--success))',
  '262 83% 62%',
  '38 92% 50%',
  '199 89% 48%',
];

const resolve = (c: string) => (c.startsWith('hsl(') ? c : `hsl(${c})`);

export const InvestmentsOverview: React.FC = () => {
  const navigate = useNavigate();
  const { investments } = useInvestmentsData();

  const { total, invested, slices, rentabilidade } = useMemo(() => {
    const map = new Map<string, number>();
    let cur = 0;
    let inv = 0;
    (investments || []).forEach((i) => {
      const value = i.current_value || i.invested_amount || 0;
      cur += value;
      inv += i.invested_amount || 0;
      const key = i.type?.name || i.type?.category || 'Outros';
      map.set(key, (map.get(key) || 0) + value);
    });
    const arr = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
    return {
      total: cur,
      invested: inv,
      slices: arr,
      rentabilidade: inv > 0 ? ((cur - inv) / inv) * 100 : 0,
    };
  }, [investments]);

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Investimentos</h2>
        <button onClick={() => navigate('/investimentos')} className="text-xs font-medium text-brand hover:underline">
          Ver carteira
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div>
          <p className="text-xs text-muted-foreground">Valor total</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">{formatCurrency(total)}</p>

          <p className="mt-3 text-xs text-muted-foreground">Rentabilidade</p>
          <p className={`text-lg font-bold ${rentabilidade >= 0 ? 'text-success' : 'text-danger'}`}>
            {rentabilidade >= 0 ? '+' : ''}
            {rentabilidade.toFixed(2).replace('.', ',')}%
            <span className="text-xs font-normal text-muted-foreground ml-1">no ano</span>
          </p>

          <ul className="mt-3 space-y-1.5">
            {slices.map((s, idx) => {
              const pct = total > 0 ? (s.value / total) * 100 : 0;
              return (
                <li key={s.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: resolve(COLORS[idx % COLORS.length]) }}
                  />
                  <span className="text-foreground truncate flex-1">{s.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatCurrency(s.value)} ({pct.toFixed(1).replace('.', ',')}%)
                  </span>
                </li>
              );
            })}
            {slices.length === 0 && <li className="text-xs text-muted-foreground">Nenhum investimento.</li>}
          </ul>
        </div>

        <div className="h-[180px]">
          {slices.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {slices.map((_, idx) => (
                    <Cell key={idx} fill={resolve(COLORS[idx % COLORS.length])} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
