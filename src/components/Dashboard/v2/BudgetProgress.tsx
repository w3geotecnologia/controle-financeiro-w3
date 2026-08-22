import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';

interface Props {
  spent: number;
  budget: number;
}

export const BudgetProgress: React.FC<Props> = ({ spent, budget }) => {
  const navigate = useNavigate();
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const over = budget > 0 && spent > budget;

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
      <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase sm:w-56 shrink-0">
        Evolução do orçamento
      </h2>
      <span className={`text-sm font-semibold ${over ? 'text-danger' : 'text-brand'}`}>
        {pct.toFixed(0)}% utilizado
      </span>
      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${over ? 'bg-danger' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
        {formatCurrency(spent)} de {formatCurrency(budget)}
      </span>
      <button onClick={() => navigate('/contas')} className="text-muted-foreground hover:text-brand">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
