import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useInvestmentsData } from '@/hooks/useInvestmentsData';
import { formatCurrency, formatNumber } from '@/utils/formatters';

const COLORS = ['#2563eb', '#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9'];

export const InvestmentsOverviewCard: React.FC = () => {
  const { investments, loading } = useInvestmentsData();
  const navigate = useNavigate();

  const { total, invested, slices } = useMemo(() => {
    const totalCurrent = investments.reduce((acc, i) => acc + Number(i.current_value || 0), 0);
    const totalInvested = investments.reduce((acc, i) => acc + Number(i.invested_amount || 0), 0);

    const map = new Map<string, number>();
    investments.forEach((inv) => {
      const key = inv.type?.name || inv.type?.category || 'Outros';
      map.set(key, (map.get(key) || 0) + Number(inv.current_value || 0));
    });

    const list = [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { total: totalCurrent, invested: totalInvested, slices: list };
  }, [investments]);

  const profitability = invested > 0 ? ((total - invested) / invested) * 100 : 0;

  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 flex flex-col"
      style={{ height: '420px' }}
    >
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
          Investimentos
        </h3>
        <button
          onClick={() => navigate('/investimentos')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver carteira
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400 py-6 text-center">Carregando...</p>
      ) : (
        <div className="mt-4 flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
          <div className="min-w-0 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Valor total</p>
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {formatCurrency(total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rentabilidade</p>
                <p className="mt-1 flex items-baseline gap-1">
                  <span
                    className={`text-xl sm:text-2xl font-bold ${
                      profitability >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {profitability >= 0 ? '+' : ''}
                    {formatNumber(profitability)}%
                  </span>
                  <span className="text-xs text-slate-500">no ano</span>
                </p>
              </div>
            </div>

            <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1 space-y-2.5">
              {slices.length === 0 && (
                <p className="text-sm text-slate-400 py-4">Nenhum investimento cadastrado.</p>
              )}
              {slices.map((slice, index) => (
                <div key={slice.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-slate-700 truncate">{slice.name}</span>
                  </div>
                  <span className="text-xs text-slate-700 shrink-0 whitespace-nowrap">
                    {formatCurrency(slice.value)}{' '}
                    <span className="text-slate-400">
                      ({total > 0 ? formatNumber((slice.value / total) * 100, 1) : '0,0'}%)
                    </span>
                  </span>
                </div>
              ))}

            </div>
          </div>

          <div className="min-h-[160px]">
            {slices.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="92%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {slices.map((slice, index) => (
                      <Cell key={slice.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatCurrency(Number(v))}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
