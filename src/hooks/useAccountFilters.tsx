import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Account } from '@/contexts/AccountsContext';

function parseDateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function buildDateSearchTokens(iso: string): string[] {
  const [y, m, d] = iso.split('-');
  return [
    iso,
    `${d}/${m}/${y}`,
    `${d}/${m}`,
    `${m}/${y}`,
    y,
    m,
    d,
  ];
}

export const useAccountFilters = (accounts: Account[]) => {
  const location = useLocation();

  const today = new Date();

  const [searchTerm,    setSearchTerm]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('todos');
  const [typeFilter,    setTypeFilter]    = useState('todos');
  const [bankFilter,    setBankFilter]    = useState('todos');
  const [monthFilter,   setMonthFilter]   = useState(today.getMonth().toString());
  const [yearFilter,    setYearFilter]    = useState(today.getFullYear().toString());
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined);
  const [endDateFilter,   setEndDateFilter]   = useState<Date | undefined>(undefined);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const type   = params.get('type');

    if (status === 'pendente') setStatusFilter('pendente');
    if (type === 'receita' || type === 'despesa') setTypeFilter(type);
  }, [location.search]);

  const filteredAccounts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return accounts
      .filter((account) => {
        const matchesSearch =
          q === '' ||
          account.description.toLowerCase().includes(q) ||
          account.category.toLowerCase().includes(q) ||
          (account.payment_source_name ?? '').toLowerCase().includes(q) ||
          buildDateSearchTokens(account.dueDate).some((token) =>
            token.toLowerCase().includes(q)
          );

        if (!matchesSearch) return false;

        const matchesStatus =
          statusFilter === 'todos' || account.status === statusFilter;

        if (!matchesStatus) return false;

        const matchesType =
          typeFilter === 'todos' || account.type === typeFilter;

        if (!matchesType) return false;

        const matchesBank =
          bankFilter === 'todos' ||
          account.payment_source_id?.toString() === bankFilter ||
          account.bank_id?.toString()            === bankFilter;

        if (!matchesBank) return false;

        const date         = parseDateLocal(account.dueDate);
        const accountMonth = date.getMonth();
        const accountYear  = date.getFullYear();

        const matchesYear =
          yearFilter === 'todos' || accountYear === parseInt(yearFilter, 10);

        if (!matchesYear) return false;

        const matchesMonth =
          monthFilter === 'todos' ||
          accountMonth === parseInt(monthFilter, 10);

        if (!matchesMonth) return false;

        const accountDate = parseDateLocal(account.dueDate);
        const start = startDateFilter ? new Date(startDateFilter.getFullYear(), startDateFilter.getMonth(), startDateFilter.getDate(), 0, 0, 0, 0) : null;
        const end = endDateFilter ? new Date(endDateFilter.getFullYear(), endDateFilter.getMonth(), endDateFilter.getDate(), 23, 59, 59, 999) : null;

        const matchesStartDate = !start || accountDate.getTime() >= start.getTime();
        if (!matchesStartDate) return false;

        const matchesEndDate = !end || accountDate.getTime() <= end.getTime();
        return matchesEndDate;
      })
      .sort(
        (a, b) =>
          parseDateLocal(a.dueDate).getTime() -
          parseDateLocal(b.dueDate).getTime()
      );
  }, [accounts, searchTerm, statusFilter, typeFilter, monthFilter, yearFilter, bankFilter, startDateFilter, endDateFilter]);

  return {
    searchTerm,    setSearchTerm,
    statusFilter,  setStatusFilter,
    typeFilter,    setTypeFilter,
    monthFilter,   setMonthFilter,
    yearFilter,    setYearFilter,
    bankFilter,    setBankFilter,
    startDateFilter, setStartDateFilter,
    endDateFilter,   setEndDateFilter,
    filteredAccounts,
    hasActiveSearch: searchTerm.length > 0,
  };
};
