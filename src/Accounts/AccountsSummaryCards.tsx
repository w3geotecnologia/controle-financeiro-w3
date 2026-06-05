// components/Accounts/AccountsSummaryCards.tsx
import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ArrowLeft, Hourglass } from 'lucide-react';
import { Account } from '@/contexts/AccountsContext';

interface AccountsSummaryCardsProps {
  accounts: Account[];
  previousBalance?: number;
  isJanuary?: boolean;
}

export const AccountsSummaryCards: React.FC<AccountsSummaryCardsProps> = ({ 
  accounts, 
  previousBalance = 0,
  isJanuary = false
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

  const calculateSaldoFinal = () => {
    return previousBalance + calculateTotalRecebido() - calculateTotalPago();
  };

  const calculateDespesasPendentes = () => {
    const contasDespesasPendentes = accounts.filter(account => account.type === 'despesa' && account.status === 'pendente');
    const despesasPendentes = contasDespesasPendentes.reduce((sum, account) => sum + Math.abs(account.amount), 0);
    
    return despesasPendentes;
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
    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Saldo Anterior */}
      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 flex flex-col justify-between min-h-[100px]">
        <div className="flex justify-start">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ArrowLeft size={20} className="text-purple-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-600 mb-1">Saldo Anterior</p>
          <p className={`text-lg font-bold ${previousBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(previousBalance)}
          </p>
        </div>
      </div>

      {/* Total Recebido */}
      <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex flex-col justify-between min-h-[100px]">
        <div className="flex justify-start">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp size={20} className="text-green-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-600 mb-1">Total Recebido</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(calculateTotalRecebido())}
          </p>
        </div>
      </div>

      {/* Total Pago */}
      <div className="p-4 bg-red-50 rounded-xl border border-red-200 flex flex-col justify-between min-h-[100px]">
        <div className="flex justify-start">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown size={20} className="text-red-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-600 mb-1">Total Pago</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(calculateTotalPago())}
          </p>
        </div>
      </div>

      {/* Saldo Final */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex flex-col justify-between min-h-[100px]">
        <div className="flex justify-start">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign size={20} className="text-blue-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-600 mb-1">Saldo Final</p>
          <p className={`text-lg font-bold ${calculateSaldoFinal() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(calculateSaldoFinal())}
          </p>
        </div>
      </div>

      {/* Despesas Pendentes */}
      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex flex-col justify-between min-h-[100px]">
        <div className="flex justify-start">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Hourglass size={20} className="text-yellow-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-600 mb-1">Pendentes</p>
          <p className="text-lg font-bold text-red-600">
            {formatCurrency(calculateDespesasPendentes())}
          </p>
          {daysUntilNextDue !== null && (
            <p className="text-sm font-normal text-slate-600 mt-1">
              Vence em {daysUntilNextDue} dia{daysUntilNextDue !== 1 ? 's' : ''} ({nextDueCount} conta{nextDueCount !== 1 ? 's' : ''})
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
