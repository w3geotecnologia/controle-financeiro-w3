import React from 'react';
import { CreditCard, CheckCircle, Clock, Calendar } from 'lucide-react';
import { CardAccount } from '@/hooks/useCardAccounts';
import { formatCurrency } from '@/utils/formatters';

interface CardAccountsSummaryCardsMobileProps {
  cardAccounts: CardAccount[];
  totalFound: number;
}

export const CardAccountsSummaryCardsMobile: React.FC<CardAccountsSummaryCardsMobileProps> = ({
  cardAccounts,
  totalFound,
}) => {
  // Cálculos dos totais
  const totalAmount = cardAccounts.reduce((sum, account) => sum + account.amount, 0);
  const paidAmount = cardAccounts
    .filter(account => account.status === 'pago')
    .reduce((sum, account) => sum + account.amount, 0);
  const pendingAmount = cardAccounts
    .filter(account => account.status === 'pendente')
    .reduce((sum, account) => sum + account.amount, 0);

  // Calcular dias até o próximo vencimento
  const pendingAccounts = cardAccounts.filter(account => account.status === 'pendente');
  
  let daysUntilNextDue: number | null = null;
  let nextDueCount = 0;
  
  if (pendingAccounts.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    
    const nextDueAccount = pendingAccounts.reduce((closest, current) => {
      if (!current.due_date) return closest;
      if (!closest || !closest.due_date) return current;
      return current.due_date < closest.due_date ? current : closest;
    }, pendingAccounts[0]);

    if (nextDueAccount?.due_date) {
      const todayTime = new Date(today).getTime();
      const dueTime = new Date(nextDueAccount.due_date).getTime();
      const diffTime = dueTime - todayTime;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      daysUntilNextDue = diffDays >= 0 ? diffDays : null;
      nextDueCount = pendingAccounts.filter(acc => acc.due_date === nextDueAccount.due_date).length;
    }
  }

  return (
    <div className="space-y-3">
      {/* Total Geral */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <CreditCard size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Geral</p>
              <p className="text-sm font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Pago */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pago</p>
              <p className="text-sm font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Pendente */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <Clock size={18} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pendente</p>
              <p className="text-sm font-bold text-yellow-600">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cartões vencendo em X dias */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <Calendar size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cartões vencendo em</p>
              {daysUntilNextDue !== null ? (
                <>
                  <p className="text-sm font-bold text-red-600">
                    {daysUntilNextDue} {daysUntilNextDue === 1 ? 'dia' : 'dias'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {nextDueCount} {nextDueCount === 1 ? 'conta' : 'contas'}
                  </p>
                </>
              ) : (
                <p className="text-sm font-bold text-slate-600">
                  Nenhuma pendente
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
