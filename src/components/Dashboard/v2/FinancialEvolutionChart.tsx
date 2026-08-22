import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Info, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { Account } from '@/hooks/useAccountsData';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

type Mode = 'patrimonio' | 'saldo' | 'receitas' | 'despesas';

const TABS: { key: Mode; label: string }[] = [
  { key: 'patrimonio', label: 'Patrimônio' },
  { key: 'saldo', label: 'Saldo' },
  { key: 'receitas', label: 'Receitas' },
  { key: 'despesas', label: 'Despesas' },
];

interface Props {
  accounts: Account[];
  year: number;
  monthIndex: number;
  extraPatrimony?: number;
}

export const FinancialEvolutionChart: React.FC<Props> = ({ accounts, year, monthIndex, extraPatrimony = 0 }) => {
  const [mode, setMode] = useState<Mode>('patrimonio');

  const data = useMemo(() => {
    const rows = MONTHS.map((m) => ({ month: m, receitas: 0, despesas: 0, saldo: 0, patrimonio: 0 }));

    accounts.forEach((acc) => {
      if (!acc.dueDate || acc.description === 'Saldo Anterior') return;
      const d = new Date(acc.dueDate + 'T00:00:00');
      if (d.getFullYear() !== year) return;
      const i = d.getMonth();
      if (acc.type === 'receita' && acc.status?.toLowerCase() === 'recebido') {
        rows[i].receitas += acc.amount || 0;
      }
      if (acc.type === 'despesa' && acc.status?.toLowerCase() === 'pago') {
        rows[i].despesas += Math.abs(acc.amount || 0);
      }
    });

    let acumulado = 0;
    rows.forEach((r) => {
      r.saldo = r.receitas - r.despesas;
      acumulado += r.saldo;
      r.patrimonio = acumulado + extraPatrimony;
    });

    return rows.slice(0, Math.max(monthIndex + 1, 1));
  }, [accounts, year, monthIndex, extraPatrimony]);

  const last = data[data.length - 1];
  const currentValue = last ? (last[mode] as number) : 0;

  return (
    <section className="rounded-lg bg-card border border-border shadow-sm p-4 h-full flex flex-col min-h-[340px]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-bold text-foreground">Evolução financeira</h2>
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Acompanhamento mensal em {year}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">{TABS.find((t) => t.key === mode)?.label} atual</p>
          <p className={`text-base font-bold tabular-nums ${currentValue >= 0 ? 'text-foreground' : 'text-danger'}`}>{formatCurrency(currentValue)}</p>
        </div>
      </div>

      <div className="mt-3 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            className={`relative px-2.5 pb-2 pt-1 text-[11px] font-medium transition-colors ${
              mode === t.key
                ? 'text-brand after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brand'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex-1 min-h-[225px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="evoFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={64}
              tickFormatter={(v: number) =>
                Math.abs(v) >= 1000 ? `R$ ${Math.round(v / 1000)} mil` : `R$ ${v}`
              }
            />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{
                borderRadius: 6,
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey={mode}
              stroke="hsl(var(--brand))"
              strokeWidth={2}
              fill="url(#evoFill)"
              dot={{ r: 3, fill: 'hsl(var(--card))', stroke: 'hsl(var(--brand))', strokeWidth: 2 }}
              activeDot={{ r: 4, fill: 'hsl(var(--brand))' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5 text-brand" />
        Série acumulada até {MONTHS[Math.min(monthIndex, 11)]}/{year}
      </div>
    </section>
  );
};
