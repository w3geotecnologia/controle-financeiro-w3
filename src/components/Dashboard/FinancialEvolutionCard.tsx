import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useInvestmentsData } from '@/hooks/useInvestmentsData';
import { useBanksData } from '@/hooks/useBanksData';
import { formatCurrency } from '@/utils/formatters';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

type Mode = 'patrimonio' | 'investido';

export const FinancialEvolutionCard: React.FC = () => {
  const { investments, loading } = useInvestmentsData();
  const { banks } = useBanksData();
  const [mode, setMode] = useState<Mode>('patrimonio');

  const banksTotal = useMemo(
    () => banks.reduce((acc, b) => acc + Number(b.balance || 0), 0),
    [banks]
  );

  const today = new Date();
  const currentMonth = today.getMonth();
  const year = today.getFullYear();

  const data = useMemo(() => {
    return Array.from({ length: currentMonth + 1 }, (_, monthIndex) => {
      const limit = new Date(year, monthIndex + 1, 0, 23, 59, 59);

      const invested = investments.reduce((acc, inv) => {
        const purchase = inv.purchase_date ? new Date(inv.purchase_date) : null;
        if (!purchase || purchase > limit) return acc;
        return acc + Number(inv.invested_amount || 0);
      }, 0);

      const current = investments.reduce((acc, inv) => {
        const purchase = inv.purchase_date ? new Date(inv.purchase_date) : null;
        if (!purchase || purchase > limit) return acc;
        // Rendimento proporcional ao tempo decorrido até o mês analisado
        const value = Number(inv.current_value || 0);
        const base = Number(inv.invested_amount || 0);
        const totalMonths = Math.max(
          1,
          (today.getFullYear() - purchase.getFullYear()) * 12 + (today.getMonth() - purchase.getMonth())
        );
        const elapsed = Math.max(
          0,
          (year - purchase.getFullYear()) * 12 + (monthIndex - purchase.getMonth())
        );
        const ratio = Math.min(1, elapsed / totalMonths);
        return acc + base + (value - base) * ratio;
      }, 0);

      return {
        month: MONTHS[monthIndex],
        patrimonio: current + (monthIndex === currentMonth ? banksTotal : 0),
        investido: invested,
      };
    });
  }, [investments, banksTotal, currentMonth, year]);

  const lastValue = data.length ? data[data.length - 1][mode] : 0;

  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 flex flex-col"
      style={{ height: '420px' }}
    >
      <div className="flex items-center gap-2 shrink-0">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
          Evolução financeira
        </h3>
        <Info className="h-3.5 w-3.5 text-slate-400" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 shrink-0">
        {([
          { key: 'patrimonio', label: 'Patrimônio' },
          { key: 'investido', label: 'Investido' },
        ] as { key: Mode; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              mode === tab.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex-1 min-h-0">
        {loading ? (
          <p className="text-sm text-slate-400 py-6 text-center">Carregando...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="evolFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef2f7" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={78}
                tickFormatter={(v: number) =>
                  `R$ ${v >= 1000 ? `${Math.round(v / 1000)} mil` : Math.round(v)}`
                }
              />
              <Tooltip
                formatter={(v: number) => formatCurrency(Number(v))}
                labelFormatter={(l) => `${l}/${year}`}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey={mode}
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#evolFill)"
                dot={{ r: 3.5, fill: '#2563eb', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
        <span className="text-xs sm:text-sm text-slate-600">
          {mode === 'patrimonio' ? 'Patrimônio' : 'Total investido'} em{' '}
          {today.toLocaleDateString('pt-BR')}
        </span>
        <span className="text-sm sm:text-base font-bold text-blue-600">
          {formatCurrency(lastValue)}
        </span>
      </div>
    </div>
  );
};
