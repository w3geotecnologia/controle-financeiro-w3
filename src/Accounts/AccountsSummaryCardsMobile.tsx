import React from 'react';
import { TrendingUp, TrendingDown, ArrowLeft, Hourglass } from 'lucide-react';
import { Account } from '@/contexts/AccountsContext';

interface AccountsSummaryCardsMobileProps {
  accounts: Account[];
  previousBalance?: number;
}

export const AccountsSummaryCardsMobile: React.FC<AccountsSummaryCardsMobileProps> = ({ 
  accounts, 
  previousBalance = 0
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotalPago = () => {
    return accounts
      .filter(account => account.type === 'despesa' && account.status === 'pago')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  const calculateTotalRecebido = () => {
    return accounts
      .filter(account => account.type === 'receita' && account.status === 'recebido')
      .reduce((sum, account) => sum + account.amount, 0);
  };

  const calculateDespesasPendentes = () => {
    return accounts
      .filter(account => account.type === 'despesa' && account.status === 'pendente')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);
  };

  const calculateDaysUntilNextDue = () => {
    const pendingAccounts = accounts.filter(account => account.status === 'pendente');
    
    if (pendingAccounts.length === 0) {
      return { daysUntilNextDue: null, nextDueCount: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Encontrar a conta com a data de vencimento mais próxima
    const nextDueAccount = pendingAccounts.reduce((closest, current) => {
      if (!current.dueDate) return closest;
      if (!closest || !closest.dueDate) return current;
      return current.dueDate < closest.dueDate ? current : closest;
    }, pendingAccounts[0]);

    if (!nextDueAccount?.dueDate) {
      return { daysUntilNextDue: null, nextDueCount: 0 };
    }

    // Calcular dias até vencer comparando strings de data
    const todayDate = today;
    const dueDate = nextDueAccount.dueDate;
    
    const todayTime = new Date(todayDate).getTime();
    const dueTime = new Date(dueDate).getTime();
    const diffTime = dueTime - todayTime;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Contar quantas contas vencem na mesma data
    const nextDueCount = pendingAccounts.filter(acc => acc.dueDate === nextDueAccount.dueDate).length;

    return { 
      daysUntilNextDue: diffDays >= 0 ? diffDays : null, 
      nextDueCount 
    };
  };

  const { daysUntilNextDue, nextDueCount } = calculateDaysUntilNextDue();

  return (
    <div className="space-y-3">
      {/* Saldo Anterior */}
      <div className="bg-card border rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
            <ArrowLeft size={18} className="text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Saldo Anterior</p>
            <p className={`text-sm font-bold ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(previousBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Recebido */}
      <div className="bg-card border rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Total Recebido</p>
            <p className="text-sm font-bold text-green-600">
              {formatCurrency(calculateTotalRecebido())}
            </p>
          </div>
        </div>
      </div>

      {/* Total Pago */}
      <div className="bg-card border rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
            <TrendingDown size={18} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Total Pago</p>
            <p className="text-sm font-bold text-red-600">
              {formatCurrency(calculateTotalPago())}
            </p>
          </div>
        </div>
      </div>

      {/* Despesas Pendentes */}
      <div className="bg-card border rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
            <Hourglass size={18} className="text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Despesas Pendentes</p>
            <p className="text-sm font-bold text-red-600">
              {formatCurrency(calculateDespesasPendentes())}
            </p>
            {daysUntilNextDue !== null && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Vence em {daysUntilNextDue} dia{daysUntilNextDue !== 1 ? 's' : ''} ({nextDueCount} conta{nextDueCount !== 1 ? 's' : ''})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
