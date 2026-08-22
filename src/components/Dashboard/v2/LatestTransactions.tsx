import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { Account } from '@/hooks/useAccountsData';

interface Props {
  accounts: Account[];
}

const formatDay = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const LatestTransactions: React.FC<Props> = ({ accounts }) => {
  const navigate = useNavigate();

  const rows = useMemo(() => {
    return [...(accounts || [])]
      .filter((a) => a.dueDate && a.description !== 'Saldo Anterior')
      .sort((a, b) => (a.dueDate < b.dueDate ? 1 : -1))
      .slice(0, 6);
  }, [accounts]);

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Últimas movimentações
        </h2>
        <button onClick={() => navigate('/contas')} className="text-xs font-medium text-brand hover:underline">
          Ver todas
        </button>
      </div>

      <ul className="mt-3 divide-y divide-border flex-1">
        {rows.length === 0 && <li className="py-3 text-sm text-muted-foreground">Nenhuma movimentação.</li>}
        {rows.map((t) => {
          const receita = t.type === 'receita';
          return (
            <li key={t.id} className="py-2.5 flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-10 tabular-nums">{formatDay(t.dueDate)}</span>
              <span
                className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center ${
                  receita ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                }`}
              >
                {receita ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                <p className="text-xs text-muted-foreground truncate">{t.category}</p>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${receita ? 'text-success' : 'text-danger'}`}>
                {receita ? '' : '-'}
                {formatCurrency(Math.abs(t.amount || 0))}
              </span>
            </li>
          );
        })}
      </ul>

      <button
        onClick={() => navigate('/contas')}
        className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm font-medium text-brand hover:underline"
      >
        Ver todas as movimentações
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
