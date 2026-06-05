
import React from 'react';
import { CreditCard, CheckCircle, Clock, Calendar } from 'lucide-react';
import { CardAccount } from '@/hooks/useCardAccounts';
import { formatCurrency } from '@/utils/formatters';

interface CardAccountsSummaryCardsProps {
  cardAccounts: CardAccount[];
  totalFound: number;
}

export const CardAccountsSummaryCards: React.FC<CardAccountsSummaryCardsProps> = ({
  cardAccounts,
  totalFound,
}) => {
  // Cálculos dos totais
  const totalAmount = cardAccounts.reduce((sum, account) => sum + account.amount, 0);
  const paidAccounts = cardAccounts.filter(account => account.status === 'pago').length;
  
  // Total pago (despesas pagas)
  const paidAmount = cardAccounts
    .filter(account => account.status === 'pago')
    .reduce((sum, account) => sum + account.amount, 0);
  
  // Total recebido (receitas recebidas)
  const receivedAmount = cardAccounts
    .filter(account => account.status === 'recebido')
    .reduce((sum, account) => sum + account.amount, 0);
  
  // Total pago líquido = pago - recebido
  const netPaidAmount = paidAmount - receivedAmount;
  
  const pendingAmount = cardAccounts
    .filter(account => account.status === 'pendente')
    .reduce((sum, account) => sum + account.amount, 0);

  // Calcular dias até o próximo vencimento
  const pendingAccounts = cardAccounts.filter(account => account.status === 'pendente');
  
  let daysUntilNextDue: number | null = null;
  let nextDueCount = 0;
  
  if (pendingAccounts.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    
    // Encontrar a conta com a data de vencimento mais próxima
    const nextDueAccount = pendingAccounts.reduce((closest, current) => {
      if (!current.due_date) return closest;
      if (!closest || !closest.due_date) return current;
      return current.due_date < closest.due_date ? current : closest;
    }, pendingAccounts[0]);

    if (nextDueAccount?.due_date) {
      // Calcular dias até vencer comparando strings de data
      const todayTime = new Date(today).getTime();
      const dueTime = new Date(nextDueAccount.due_date).getTime();
      const diffTime = dueTime - todayTime;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      daysUntilNextDue = diffDays >= 0 ? diffDays : null;
      
      // Contar quantas contas vencem na mesma data
      nextDueCount = pendingAccounts.filter(acc => acc.due_date === nextDueAccount.due_date).length;
    }
  }

  return (
    <div className="mb-6">
      {/* Total de contas encontradas */}
      <div className="mb-4">
        <p className="text-sm text-slate-600">
          {totalFound} {totalFound === 1 ? 'conta encontrada' : 'contas encontradas'}
        </p>
      </div>

      {/* Cards dos resumos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Contas */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Total Geral</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Contas Pagas */}
        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Total Pago</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(netPaidAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Contas Pendentes */}
        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Total Pendente</p>
               <p className="text-xl font-bold text-green-600">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>

       {/* Cartões vencendo em X dias */}
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar size={20} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600">Cartões vencendo em</p>
              {daysUntilNextDue !== null ? (
                <>
                  <p className="text-xl font-bold text-red-600">
                    {daysUntilNextDue} {daysUntilNextDue === 1 ? 'dia' : 'dias'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {nextDueCount} {nextDueCount === 1 ? 'conta' : 'contas'}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold text-slate-600">
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
