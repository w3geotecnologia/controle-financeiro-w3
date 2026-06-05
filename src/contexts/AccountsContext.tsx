import React, { createContext, useContext } from 'react';
import { useAccountsData, Account, CreateAccountData, Transaction } from '@/hooks/useAccountsData';

export type { Account, CreateAccountData, Transaction };

interface AccountsContextValue extends ReturnType<typeof useAccountsData> {
  getTotalReceitas: () => number;
  getTotalDespesas: () => number;
  getSaldo: () => number;
  getTransactions: () => Transaction[];
}

const AccountsContext = createContext<AccountsContextValue | undefined>(undefined);

export const AccountsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const data = useAccountsData();

  const getTotalReceitas = () =>
    data.accounts
      .filter((a) => a.type === 'receita' && a.status === 'recebido')
      .reduce((s, a) => s + (a.amount || 0), 0);

  const getTotalDespesas = () =>
    data.accounts
      .filter((a) => a.type === 'despesa' && a.status === 'pago')
      .reduce((s, a) => s + Math.abs(a.amount || 0), 0);

  const getSaldo = () => getTotalReceitas() - getTotalDespesas();

  const getTransactions = (): Transaction[] => data.accounts as Transaction[];

  return (
    <AccountsContext.Provider
      value={{ ...data, getTotalReceitas, getTotalDespesas, getSaldo, getTransactions }}
    >
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => {
  const ctx = useContext(AccountsContext);
  if (!ctx) throw new Error('useAccounts must be used within AccountsProvider');
  return ctx;
};
