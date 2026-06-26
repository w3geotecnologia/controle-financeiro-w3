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

function calcRelevance(account: Account, q: string): number {
  if (!q) return 0;
  const query = q.toLowerCase().trim();
  if (!query) return 0;

  const desc = account.description.toLowerCase();
  const cat = account.category.toLowerCase();
  const bank = (account.payment_source_name ?? '').toLowerCase();

  let score = 0;

  // Descrição — maior peso
  if (desc === query) score += 100;
  else if (desc.startsWith(query)) score += 80;
  else if (desc.includes(query)) score += 60;

  // Categoria — segundo maior peso
  if (cat === query) score += 70;
  else if (cat.startsWith(query)) score += 50;
  else if (cat.includes(query)) score += 40;

  // Banco / fonte de pagamento
  if (bank === query) score += 30;
  else if (bank.startsWith(query)) score += 20;
  else if (bank.includes(query)) score += 15;

  // Tokens de data
  const dateMatch = buildDateSearchTokens(account.dueDate).some((token) =>
    token.toLowerCase().includes(query)
  );
  if (dateMatch) score += 5;

  return score;
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

    const results = accounts
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

        // Filtro de período (data inicial/final) tem prioridade sobre mês/ano.
        // Quando o usuário define um período, os filtros de mês e ano são
        // ignorados — eles são modos mutuamente exclusivos de navegação temporal.
        const hasPeriodFilter = Boolean(startDateFilter || endDateFilter);
        const accountDate = parseDateLocal(account.dueDate);

        if (hasPeriodFilter) {
          const start = startDateFilter
            ? new Date(startDateFilter.getFullYear(), startDateFilter.getMonth(), startDateFilter.getDate(), 0, 0, 0, 0)
            : null;
          const end = endDateFilter
            ? new Date(endDateFilter.getFullYear(), endDateFilter.getMonth(), endDateFilter.getDate(), 23, 59, 59, 999)
            : null;

          const matchesStartDate = !start || accountDate.getTime() >= start.getTime();
          if (!matchesStartDate) return false;

          const matchesEndDate = !end || accountDate.getTime() <= end.getTime();
          return matchesEndDate;
        }

        const accountMonth = accountDate.getMonth();
        const accountYear  = accountDate.getFullYear();

        const matchesYear =
          yearFilter === 'todos' || accountYear === parseInt(yearFilter, 10);

        if (!matchesYear) return false;

        const matchesMonth =
          monthFilter === 'todos' ||
          accountMonth === parseInt(monthFilter, 10);

        return matchesMonth;
      })
      .map((account) => ({
        account,
        relevance: calcRelevance(account, q),
      }));

    // Com busca ativa: ordena por relevância (maior primeiro), depois por data.
    // Sem busca: ordena apenas por data.
    if (q) {
      return results
        .sort((a, b) => {
          if (b.relevance !== a.relevance) return b.relevance - a.relevance;
          return parseDateLocal(a.account.dueDate).getTime() - parseDateLocal(b.account.dueDate).getTime();
        })
        .map((item) => item.account);
    }

    return results
      .sort(
        (a, b) =>
          parseDateLocal(a.account.dueDate).getTime() -
          parseDateLocal(b.account.dueDate).getTime()
      )
      .map((item) => item.account);
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
