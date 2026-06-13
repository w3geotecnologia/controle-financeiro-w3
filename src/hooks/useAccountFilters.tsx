
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Account } from '@/contexts/AccountsContext';

export const useAccountFilters = (accounts: Account[]) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  
  // Inicializar sempre no mês atual (baseado em 0)
  const today = new Date();
  const [monthFilter, setMonthFilter] = useState(today.getMonth().toString());
  const [yearFilter, setYearFilter] = useState(today.getFullYear().toString());

  // Log quando searchTerm muda
  useEffect(() => {
    console.log('SearchTerm mudou para:', searchTerm);
  }, [searchTerm]);

  // Log quando monthFilter muda
  useEffect(() => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    if (monthFilter !== 'todos') {
      const monthIndex = parseInt(monthFilter);
      console.log(`📅 FILTRO DE MÊS MUDOU: ${monthFilter} (${monthNames[monthIndex]})`);
    } else {
      console.log('📅 FILTRO DE MÊS: Todos os meses');
    }
  }, [monthFilter]);

  // Aplicar filtros da URL ao carregar a página
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
    const typeParam = searchParams.get('type');
    
    if (statusParam === 'pendente') {
      setStatusFilter('pendente');
    }
    
    if (typeParam === 'receita') {
      setTypeFilter('receita');
    } else if (typeParam === 'despesa') {
      setTypeFilter('despesa');
    }
  }, [location.search]);

  const filteredAccounts = useMemo(() => {
    console.log('=== INÍCIO DO FILTRO ===');
    console.log('Total de contas:', accounts.length);
    console.log('Termo de pesquisa:', `"${searchTerm}"`);
    console.log('Filtros ativos:', { 
      searchTerm, 
      statusFilter, 
      typeFilter, 
      monthFilter: monthFilter === 'todos' ? 'todos' : `${monthFilter} (mês ${parseInt(monthFilter) + 1})`,
      yearFilter 
    });

    const filtered = accounts
      .filter(account => {
        // Log detalhado da pesquisa
        const searchLower = searchTerm.toLowerCase().trim();
        const descriptionLower = account.description.toLowerCase();
        const categoryLower = account.category.toLowerCase();
        const paymentSourceLower = account.payment_source_name?.toLowerCase() || '';
        
        // Busca flexível por data (suporte para ano, mês/ano, dia/mês/ano, ou parte da data)
        const dueDateParts = account.dueDate.split('-'); // [2025, 01, 15]
        const dueDateFormatted = `${dueDateParts[2]}/${dueDateParts[1]}/${dueDateParts[0]}`; // 15/01/2025
        const dueDateShort = `${dueDateParts[2]}/${dueDateParts[1]}`; // 15/01
        const monthYear = `${dueDateParts[1]}/${dueDateParts[0]}`; // 01/2025
        const yearOnly = dueDateParts[0]; // 2025
        const monthOnly = dueDateParts[1]; // 01
        const dayOnly = dueDateParts[2]; // 15
        
        const matchesSearch = searchTerm === '' || 
                             descriptionLower.includes(searchLower) ||
                             categoryLower.includes(searchLower) ||
                             paymentSourceLower.includes(searchLower) ||
                             // Busca por data original (2025-01-15)
                             account.dueDate.includes(searchTerm) ||
                             // Busca por data formatada (15/01/2025)
                             dueDateFormatted.includes(searchTerm) ||
                             // Busca por dia/mês (15/01)
                             dueDateShort.includes(searchTerm) ||
                             // Busca por mês/ano (01/2025)
                             monthYear.includes(searchTerm) ||
                             // Busca por ano (2025)
                             yearOnly.includes(searchTerm) ||
                             // Busca por mês (01)
                             monthOnly.includes(searchTerm) ||
                             // Busca por dia (15)
                             dayOnly.includes(searchTerm);
        
        if (searchTerm && searchTerm.length > 0) {
          console.log(`Testando conta: "${account.description}"`);
          console.log(`- Descrição: "${descriptionLower}" inclui "${searchLower}"? ${descriptionLower.includes(searchLower)}`);
          console.log(`- Categoria: "${categoryLower}" inclui "${searchLower}"? ${categoryLower.includes(searchLower)}`);
          console.log(`- Fonte Pagamento: "${paymentSourceLower}" inclui "${searchLower}"? ${paymentSourceLower.includes(searchLower)}`);
          console.log(`- Data Original: "${account.dueDate}" inclui "${searchTerm}"? ${account.dueDate.includes(searchTerm)}`);
          console.log(`- Data Formatada: "${dueDateFormatted}" inclui "${searchTerm}"? ${dueDateFormatted.includes(searchTerm)}`);
          console.log(`- Mês/Ano: "${monthYear}" inclui "${searchTerm}"? ${monthYear.includes(searchTerm)}`);
          console.log(`- Ano: "${yearOnly}" inclui "${searchTerm}"? ${yearOnly.includes(searchTerm)}`);
          console.log(`- Match pesquisa: ${matchesSearch}`);
        }
        
        const matchesStatus = statusFilter === 'todos' || account.status === statusFilter;
        const matchesType = typeFilter === 'todos' || account.type === typeFilter;
        
        // Filtrar por mês e ano - usar dueDate que é o campo correto
        const accountDate = new Date(account.dueDate + 'T12:00:00');
        const accountMonth = accountDate.getMonth(); // getMonth() retorna 0-11
        const accountYear = accountDate.getFullYear();
        
        // Converter monthFilter para número apenas se não for 'todos'
        let matchesMonth;
        if (monthFilter === 'todos') {
          // Quando "todos" está selecionado
          if (yearFilter !== 'todos') {
            // Vista anual: incluir todos os meses (janeiro a dezembro) do ano selecionado
            matchesMonth = true;
          } else {
            // Vista "Todos": incluir apenas de janeiro até o mês atual
            const today = new Date();
            const currentMonthIndex = today.getMonth(); // 0-11
            matchesMonth = accountMonth <= currentMonthIndex;
          }
        } else {
          matchesMonth = accountMonth === parseInt(monthFilter);
        }
        const matchesYear = yearFilter === 'todos' || accountYear === parseInt(yearFilter);
        
        // Log detalhado do filtro de data para algumas contas
        if (monthFilter !== 'todos' && Math.random() < 0.1) { // Log apenas 10% para não poluir
          console.log(`📅 FILTRO DATA - Conta: "${account.description}"`);
          console.log(`   - Data da conta: ${account.dueDate}`);
          console.log(`   - Mês da conta: ${accountMonth} | Filtro: ${monthFilter}`);
          console.log(`   - Ano da conta: ${accountYear} | Filtro: ${yearFilter}`);
          console.log(`   - Match mês: ${matchesMonth} | Match ano: ${matchesYear}`);
        }
        
        const finalMatch = matchesSearch && matchesStatus && matchesType && matchesMonth && matchesYear;
        
        if (searchTerm && searchTerm.length > 0) {
          console.log(`- Resultado final para "${account.description}": ${finalMatch}`);
          console.log('---');
        }
        
        return finalMatch;
      })
      .sort((a, b) => {
        // Ordenar por data de vencimento de forma decrescente (mais recentes primeiro)
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      });

    console.log('Contas filtradas:', filtered.length);
    if (searchTerm) {
      console.log('Contas que passaram no filtro de pesquisa:', filtered.map(a => a.description));
    }
    console.log('=== FIM DO FILTRO ===');
    
    return filtered;
  }, [accounts, searchTerm, statusFilter, typeFilter, monthFilter, yearFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter,
    filteredAccounts,
    hasActiveSearch: searchTerm.length > 0
  };
};
