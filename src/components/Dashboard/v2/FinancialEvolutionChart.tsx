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
import { Info } from 'lucide-react';
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
    <div className="rounded-2xl bg-card border border-border shadow-sm p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center gap-2">
        <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Evolução financeira
        </h2>
        <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === t.key
                ? 'bg-brand text-brand-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="evoFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
              width={70}
              tickFormatter={(v: number) =>
                Math.abs(v) >= 1000 ? `R$ ${Math.round(v / 1000)} mil` : `R$ ${v}`
              }
            />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey={mode}
              stroke="hsl(var(--brand))"
              strokeWidth={2.5}
              fill="url(#evoFill)"
              dot={{ r: 3, fill: 'hsl(var(--brand))', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {TABS.find((t) => t.key === mode)?.label} em {MONTHS[Math.min(monthIndex, 11)]}/{year}
        </span>
        <span className={`font-bold ${currentValue >= 0 ? 'text-brand' : 'text-danger'}`}>
          {formatCurrency(currentValue)}
        </span>
      </div>
    </div>
  );
};
