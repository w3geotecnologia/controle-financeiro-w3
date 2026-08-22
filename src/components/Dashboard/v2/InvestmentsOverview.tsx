import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/utils/formatters';
import { useInvestmentsData } from '@/hooks/useInvestmentsData';

const COLORS = [
  'hsl(var(--brand))',
  'hsl(var(--success))',
  'hsl(var(--violet))',
  'hsl(var(--warning))',
  'hsl(var(--cyan))',
];

const resolve = (c: string) => c;

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
    <section className="rounded-lg bg-card border border-border shadow-sm p-4 h-full flex flex-col min-h-[340px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Investimentos</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Posição consolidada da carteira</p>
        </div>
        <button onClick={() => navigate('/investimentos')} className="text-xs font-medium text-brand hover:underline">
          Ver carteira
        </button>
      </div>

      <div className="mt-3 grid flex-1 grid-cols-[minmax(0,1fr)_150px] gap-3 items-center">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">Patrimônio investido</p>
          <p className="mt-0.5 text-xl font-bold text-foreground tabular-nums">{formatCurrency(total)}</p>

          <p className="mt-3 text-[11px] font-medium text-muted-foreground">Rentabilidade acumulada</p>
          <p className={`text-base font-bold ${rentabilidade >= 0 ? 'text-success' : 'text-danger'}`}>
            {rentabilidade >= 0 ? '+' : ''}
            {rentabilidade.toFixed(2).replace('.', ',')}%
            <span className="text-[10px] font-normal text-muted-foreground ml-1">sobre o valor aplicado</span>
          </p>

          <ul className="mt-4 space-y-2.5">
            {slices.map((s, idx) => {
              const pct = total > 0 ? (s.value / total) * 100 : 0;
              return (
                <li key={s.name} className="text-[11px]">
                  <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-sm shrink-0"
                    style={{ background: resolve(COLORS[idx % COLORS.length]) }}
                  />
                  <span className="text-foreground truncate flex-1">{s.name}</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {pct.toFixed(0).replace('.', ',')}%
                  </span>
                  </div>
                  <div className="mt-1 ml-4 h-1.5 overflow-hidden rounded-sm bg-muted">
                    <div className="h-full rounded-sm" style={{ width: `${pct}%`, background: resolve(COLORS[idx % COLORS.length]) }} />
                  </div>
                </li>
              );
            })}
            {slices.length === 0 && <li className="text-xs text-muted-foreground">Nenhum investimento.</li>}
          </ul>
        </div>

        <div className="relative h-[170px]">
          {slices.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} cornerRadius={3}>
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
          {slices.length > 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-muted-foreground">Aplicado</span>
              <span className="text-xs font-bold text-foreground tabular-nums">{formatCurrency(invested)}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
