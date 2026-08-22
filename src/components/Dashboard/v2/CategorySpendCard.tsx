import React, { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import type { Account } from '@/hooks/useAccountsData';

interface Props {
  accounts: Account[];
  month: number;
  year: number;
}

export const CategorySpendCard: React.FC<Props> = ({ accounts, month, year }) => {
  const navigate = useNavigate();

  const { rows, total } = useMemo(() => {
    const map = new Map<string, number>();
    accounts.forEach((acc) => {
      if (acc.type !== 'despesa' || !acc.dueDate || acc.description === 'Saldo Anterior') return;
      const d = new Date(acc.dueDate + 'T00:00:00');
      if (d.getMonth() !== month || d.getFullYear() !== year) return;
      const key = acc.category || 'Outros';
      map.set(key, (map.get(key) || 0) + Math.abs(acc.amount || 0));
    });
    const all = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const sum = all.reduce((s, [, v]) => s + v, 0);
    const top = all.slice(0, 5);
    const rest = all.slice(5).reduce((s, [, v]) => s + v, 0);
    const list = rest > 0 ? [...top, ['Outros', rest] as [string, number]] : top;
    return { rows: list, total: sum };
  }, [accounts, month, year]);

  const max = rows.length ? rows[0][1] : 1;

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm p-4 sm:p-5 h-full flex flex-col">
      <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Para onde vai meu dinheiro?
      </h2>
      <p className="text-xs text-muted-foreground mt-0.5">Despesas por categoria no mês</p>

      <div className="mt-4 space-y-3 flex-1">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma despesa no mês selecionado.</p>
        )}
        {rows.map(([name, value]) => {
          const pct = total > 0 ? (value / total) * 100 : 0;
          return (
            <div key={name}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-foreground truncate">{name}</span>
                <span className="text-sm text-foreground tabular-nums">{formatCurrency(value)}</span>
                <span className="text-xs text-muted-foreground w-12 text-right tabular-nums">
                  {pct.toFixed(1).replace('.', ',')}%
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.max((value / max) * 100, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/categorias')}
        className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm font-medium text-brand hover:underline"
      >
        Ver todas as categorias
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
