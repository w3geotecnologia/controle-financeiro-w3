import React, { useMemo } from 'react';
import { useAccounts } from '@/contexts/AccountsContext';
import { formatCurrency } from '@/utils/formatters';

interface SpendingByCategoryCardProps {
  month: number;
  year: number;
}

const parseDate = (value: string) => {
  if (!value) return null;
  const iso = value.split('T')[0];
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const SpendingByCategoryCard: React.FC<SpendingByCategoryCardProps> = ({ month, year }) => {
  const { accounts } = useAccounts();

  const { rows, total } = useMemo(() => {
    const map = new Map<string, number>();

    accounts.forEach((account) => {
      if (account.type !== 'despesa') return;
      const date = parseDate(account.dueDate);
      if (!date || date.getMonth() !== month || date.getFullYear() !== year) return;

      const key = account.category?.trim() || 'Outros';
      map.set(key, (map.get(key) || 0) + Number(account.amount || 0));
    });

    const all = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const sum = all.reduce((acc, [, value]) => acc + value, 0);

    return { rows: all, total: sum };
  }, [accounts, month, year]);

  const max = rows.length ? rows[0][1] : 0;

  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 flex flex-col"
      style={{ height: '420px' }}
    >
      <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide shrink-0">
        Para onde vai meu dinheiro?
      </h3>
      <p className="text-xs text-slate-500 mt-1 shrink-0">Despesas por categoria no mês</p>

      <div
        className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
      >
        {rows.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">
            Nenhuma despesa registrada neste mês.
          </p>
        ) : (
          <div className="space-y-3">
            {rows.map(([category, value]) => {
              const percent = total > 0 ? (value / total) * 100 : 0;
              const width = max > 0 ? (value / max) * 100 : 0;

              return (
                <div key={category} className="border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-700 truncate">{category}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-slate-800">
                        {formatCurrency(value)}
                      </span>
                      <span className="text-xs text-slate-500 w-12 text-right">
                        {percent.toFixed(1).replace('.', ',')}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-1.5 w-1/2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
