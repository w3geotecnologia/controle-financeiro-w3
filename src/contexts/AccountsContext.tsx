
import React, { createContext, useContext, ReactNode } from 'react';
import { useAccountsData, Account, CreateAccountData } from '@/hooks/useAccountsData';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  date: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  payment_source_name?: string;
}

interface AccountsContextType {
  accounts: Account[];
  loading: boolean;
  addAccount: (account: CreateAccountData) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  updateAccountStatus: (id: number, status: 'pendente' | 'pago' | 'recebido') => Promise<void>;
  getTransactions: () => Transaction[];
  getTotalReceitas: () => number;
  getTotalDespesas: () => number;
  getSaldo: () => number;
  getContasPendentes: () => number;
  refreshAccounts: () => Promise<void>;
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountsProvider');
  }
  return context;
};

interface AccountsProviderProps {
  children: ReactNode;
}

export const AccountsProvider: React.FC<AccountsProviderProps> = ({ children }) => {
  const {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
    refreshAccounts
  } = useAccountsData();

  const getTransactions = (): Transaction[] => {
    return accounts.map(account => {
      // Debug log para verificar a data original
      console.log('Data original do banco:', account.dueDate);
      
      // Criar data sem problemas de fuso horário
      const dueDateStr = account.dueDate;
      const [year, month, day] = dueDateStr.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const formattedDate = localDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      console.log('Data formatada:', formattedDate);
      
      return {
        id: account.id,
        description: account.description,
        amount: account.amount,
        category: account.category,
        dueDate: account.dueDate,
        date: formattedDate,
        type: account.type,
        status: account.status,
        payment_source_name: account.payment_source_name
      };
    });
  };

  const getTotalReceitas = () => {
    return accounts
      .filter(t => t.type === 'receita' && t.status === 'recebido')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalDespesas = () => {
    return accounts
      .filter(t => t.type === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getSaldo = () => {
    return getTotalReceitas() - getTotalDespesas();
  };

  const getContasPendentes = () => {
    return accounts.filter(t => t.status === 'pendente').length;
  };

  return (
    <AccountsContext.Provider value={{
      accounts,
      loading,
      addAccount,
      updateAccount,
      deleteAccount,
      updateAccountStatus,
      getTransactions,
      getTotalReceitas,
      getTotalDespesas,
      getSaldo,
      getContasPendentes,
      refreshAccounts
    }}>
      {children}
    </AccountsContext.Provider>
  );
};

// Exportar tipos para compatibilidade
export type { Account, CreateAccountData };
