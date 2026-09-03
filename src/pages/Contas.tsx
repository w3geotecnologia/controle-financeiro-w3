// pages/Contas.tsx
import React from 'react';
import { FloatingCalculator } from '@/components/Accounts/FloatingCalculator';
import { Layout } from '@/components/Layout';
import { AccountsFilters } from '@/components/Accounts/AccountsFilters';
import { AccountsSummaryCards } from '@/components/Accounts/AccountsSummaryCards';
import { AccountsSummaryCardsMobile } from '@/components/Accounts/AccountsSummaryCardsMobile';
import { AccountsListMobile } from '@/components/Accounts/AccountsListMobile';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { AccountModal, AccountFormData } from '@/components/Accounts/AccountModal';
import { MonthYearStepperMobile } from '@/components/Accounts/MonthYearStepperMobile';
import { VoiceAccountDialog } from '@/components/Accounts/VoiceAccountDialog';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { Home, Loader2, Menu, Plus, FileText, Search, Calculator, Mic } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountsContext';
import { useAccountsReminder } from '@/hooks/useAccountsReminder';
import { useAccountFilters } from '@/hooks/useAccountFilters';
import { useAccountOperations } from '@/hooks/useAccountOperations';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Contas: React.FC = () => {
  const { accounts, loading, refreshAccounts } = useAccounts() as any;
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [calcOpen, setCalcOpen] = React.useState(false);
  const [voiceOpen, setVoiceOpen] = React.useState(false);

  useAccountsReminder(accounts);

  // Toast para contas vencendo em 1 dia
  React.useEffect(() => {
    if (!accounts || accounts.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    
    const pendingAccounts = accounts.filter((account: any) => 
      account.status === 'pendente' && account.dueDate
    );

    const accountsDueIn1Day = pendingAccounts.filter((account: any) => {
      const todayTime = new Date(today).getTime();
      const dueTime = new Date(account.dueDate).getTime();
      const diffTime = dueTime - todayTime;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays === 1;
    });

    if (accountsDueIn1Day.length > 0) {
      toast({
        title: "⚠️ Aviso de Vencimento",
        description: "Há contas a vencer. Verifique!",
        duration: 2000,
      });
    }
  }, [accounts, toast]);

  const {
    searchTerm,
    setSearchTerm,
    searchField,
    setSearchField,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter,
    bankFilter,
    setBankFilter,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    filteredAccounts,
    hasActiveSearch
  } = useAccountFilters(accounts);

  const {
    isModalOpen,
    editingAccount,
    handleSave,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleNewAccount,
    handleModalClose
  } = useAccountOperations();

  const categories = ['Trabalho', 'Moradia', 'Utilidades', 'Alimentação', 'Transporte', 'Lazer'];

  const handleMonthChange = async (startDate: Date, endDate: Date, month: number, year: number) => {
    setMonthFilter(month.toString());
    setYearFilter(year.toString());
    
    // Recarregar dados para garantir que os saldos anteriores estejam atualizados
    if (typeof refreshAccounts === "function") {
      await refreshAccounts();
    }
  };

  const handleShowAll = () => {
    setMonthFilter('todos');
    setYearFilter('todos');
  };

  const handleAnnualView = () => {
    const year = yearFilter === 'todos' ? new Date().getFullYear().toString() : yearFilter;
    setMonthFilter('todos');
    setYearFilter(year);
  };

  const today = new Date();
  const currentMonth = monthFilter === 'todos' ? today.getMonth() : parseInt(monthFilter, 10);
  const currentYear = yearFilter === 'todos' ? today.getFullYear() : parseInt(yearFilter, 10);
  const isShowingAll = monthFilter === 'todos' && yearFilter === 'todos';
  const isAnnualView = monthFilter === 'todos' && yearFilter !== 'todos';
  const hasPeriodFilter = Boolean(startDateFilter || endDateFilter);
  // Quando há busca de texto OU intervalo de datas ativo, os cards devem refletir
  // exatamente o resultado já filtrado pelo hook (filteredAccounts), em vez do
  // cálculo baseado em mês/ano (que ignora o intervalo de datas).
  const useFilteredAccountsForCards = hasActiveSearch || hasPeriodFilter;

  // Calcular saldo acumulado até um determinado mês/ano (OTIMIZADO)
  const calculateAccumulatedBalance = React.useCallback((untilMonth: number, untilYear: number, paymentSourceFilter?: string, bankIdFilter?: string) => {
    if (!accounts || accounts.length === 0) return 0;
    
    let totalRecebido = 0;
    let totalPago = 0;
    
    // Uma única iteração sobre as contas
    for (const acc of accounts) {
      if (!acc.dueDate || acc.description === "Saldo Anterior") continue;
      
      // Aplicar filtro de banco se fornecido
      if (bankIdFilter && bankIdFilter !== 'todos') {
        const accBankId = acc.payment_source_id?.toString() || acc.bank_id?.toString();
        if (accBankId !== bankIdFilter) continue;
      }
      
      // Aplicar filtro de payment_source se fornecido
      if (paymentSourceFilter) {
        const paymentSourceLower = acc.payment_source_name?.toLowerCase() || '';
        if (!paymentSourceLower.includes(paymentSourceFilter.toLowerCase())) continue;
      }
      
      const d = new Date(acc.dueDate + "T00:00:00");
      const accYear = d.getFullYear();
      const accMonth = d.getMonth();
      
      // Verificar se está dentro do período
      if (accYear < untilYear || (accYear === untilYear && accMonth <= untilMonth)) {
        if (acc.type === "receita" && acc.status === "recebido") {
          totalRecebido += acc.amount;
        } else if (acc.type === "despesa" && acc.status === "pago") {
          totalPago += Math.abs(acc.amount);
        }
      }
    }
    
    return totalRecebido - totalPago;
  }, [accounts]);

  // Calcular saldo acumulado até um cutoff (dia anterior à data inicial do intervalo)
  const calculateBalanceUntilDate = React.useCallback((cutoff: Date, bankIdFilter?: string) => {
    if (!accounts || accounts.length === 0) return 0;
    const cutoffTime = new Date(cutoff.getFullYear(), cutoff.getMonth(), cutoff.getDate(), 0, 0, 0, 0).getTime();
    let totalRecebido = 0;
    let totalPago = 0;
    for (const acc of accounts) {
      if (!acc.dueDate || acc.description === "Saldo Anterior") continue;
      if (bankIdFilter && bankIdFilter !== 'todos') {
        const accBankId = acc.payment_source_id?.toString() || acc.bank_id?.toString();
        if (accBankId !== bankIdFilter) continue;
      }
      const d = new Date(acc.dueDate + "T00:00:00").getTime();
      if (d < cutoffTime) {
        if (acc.type === "receita" && acc.status === "recebido") totalRecebido += acc.amount;
        else if (acc.type === "despesa" && acc.status === "pago") totalPago += Math.abs(acc.amount);
      }
    }
    return totalRecebido - totalPago;
  }, [accounts]);

  // Calcular previousBalance dinamicamente baseado no saldo final do mês anterior
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;

    // Com intervalo de datas: saldo acumulado até o dia anterior à data inicial
    if (hasPeriodFilter) {
      if (!startDateFilter) return 0;
      return calculateBalanceUntilDate(startDateFilter, bankFilter);
    }

    const targetMonth = isShowingAll ? 0 : currentMonth;
    const targetYear = currentYear;

    // Verificar se há filtro de payment_source ativo através do searchTerm
    const paymentSourceFilter = hasActiveSearch ? searchTerm : undefined;

    // Para janeiro, calcular baseado em dezembro do ano anterior
    if (targetMonth === 0) {
      return calculateAccumulatedBalance(11, targetYear - 1, paymentSourceFilter, bankFilter);
    }

    // Para outros meses, calcular baseado no mês anterior do mesmo ano
    return calculateAccumulatedBalance(targetMonth - 1, targetYear, paymentSourceFilter, bankFilter);
  }, [accounts, currentMonth, currentYear, isShowingAll, hasActiveSearch, searchTerm, bankFilter, calculateAccumulatedBalance, hasPeriodFilter, startDateFilter, calculateBalanceUntilDate]);

  // Função para obter o saldo anterior do mês anterior (para meses subsequentes)
  const getPreviousMonthBalance = React.useCallback(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Para janeiro, usar o saldo anterior calculado
    if (currentMonth === 0) {
      return previousBalance;
    }
    
    // Para outros meses, buscar o saldo anterior do mês anterior
    const prevMonth = currentMonth - 1;
    const prevYear = currentYear;
    
    const found = accounts.find((acc: any) => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      return acc.description === "Saldo Anterior" && 
             d.getFullYear() === prevYear && 
             d.getMonth() === prevMonth;
    });

    if (!found) return 0;
    return found.type === "receita" ? found.amount : -Math.abs(found.amount);
  }, [accounts, currentMonth, currentYear, previousBalance]);

  // Função para calcular o saldo final do mês atual baseado no saldo anterior (OTIMIZADO)
  const calculateCurrentMonthBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    let totalRecebido = 0;
    let totalPago = 0;
    
    // Uma única iteração
    for (const acc of accounts) {
      if (!acc.dueDate || acc.description === "Saldo Anterior") continue;
      
      const d = new Date(acc.dueDate + "T00:00:00");
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        if (acc.type === "receita" && acc.status === "recebido") {
          totalRecebido += acc.amount || 0;
        } else if (acc.type === "despesa" && acc.status === "pago") {
          totalPago += Math.abs(acc.amount || 0);
        }
      }
    }

    return previousBalance + totalRecebido - totalPago;
  }, [accounts, currentMonth, currentYear, previousBalance]);

  // Função para filtrar contas para cálculos (excluindo o saldo anterior)
  const getFilteredAccountsForCalculations = React.useCallback(() => {
    if (!accounts) return [];
    
    return accounts.filter((acc: any) => {
      if (!acc.dueDate) return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      
      // Aplicar filtro de banco
      if (bankFilter !== 'todos') {
        const accBankId = acc.payment_source_id?.toString() || acc.bank_id?.toString();
        if (accBankId !== bankFilter) return false;
      }
      
      // Se está mostrando todos os meses, incluir apenas de janeiro até o mês atual
      if (isShowingAll) {
        const today = new Date();
        const currentMonthIndex = today.getMonth(); // 0-11
        const accountMonth = d.getMonth(); // 0-11
        
        return d.getFullYear() === currentYear && 
               accountMonth <= currentMonthIndex && 
               acc.description !== "Saldo Anterior";
      }
      
      // Caso contrário, filtrar apenas o mês específico
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth && 
             acc.description !== "Saldo Anterior";
    });
  }, [accounts, currentMonth, currentYear, isShowingAll, bankFilter]);

  const handleSubmit = (data: AccountFormData) => {
    handleSave(data);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando contas...</span>
          </div>
        </div>
      );
    }

    // Versão Mobile Simplificada
    if (isMobile) {
      return (
        <div className="space-y-4 p-4">
          {/* Cabeçalho e botões de ação */}
          <div className="flex flex-col gap-4 px-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2563EB] via-[#1687B0] to-[#16A34A] bg-clip-text text-transparent">
                Painel Contas
              </h1>
              <p className="text-sm text-[#475569] mt-0.5">
                Visão geral das suas contas
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full sm:w-auto h-10 px-4 flex items-center justify-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-blue-300"
              >
                <Menu className="h-5 w-5 text-blue-600" />
                Menu Financeiro
              </Button>
              <Button
                onClick={handleNewAccount}
                className="w-full sm:w-auto h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-sm transition-all hover:bg-slate-50 hover:border-blue-300"
              >
                <Plus className="h-4 w-4 text-blue-600" />
                <span>Nova Conta</span>
              </Button>
              <Button
                onClick={() => navigate('/relatorios')}
                className="w-full sm:w-auto h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-sm transition-all hover:bg-slate-50 hover:border-blue-300"
              >
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Relatórios</span>
              </Button>
              <Button
                type="button"
                onClick={() => setCalcOpen(true)}
                title="Abrir calculadora"
                aria-label="Abrir calculadora"
                className="h-10 w-10 shrink-0 p-0 inline-flex items-center justify-center rounded-md bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 hover:from-slate-400 hover:to-slate-700 text-white shadow border border-slate-300"
              >
                <Calculator className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/cadastro-voz')}
                title="Cadastro por voz"
                aria-label="Cadastro por voz"
                className="w-full sm:w-auto h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium shadow"
              >
                <Mic className="h-4 w-4" />
                <span>Cadastro por voz</span>
              </Button>
            </div>
          </div>

          {/* Campo de pesquisa e filtro de tipo */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Pesquisar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>

          {/* Navegador de mês e ano compacto */}
          <MonthYearStepperMobile
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={handleMonthChange}
            isShowingAll={isShowingAll}
          />

          {/* Cards de resumo compactos */}
          <AccountsSummaryCardsMobile 
            accounts={useFilteredAccountsForCards ? filteredAccounts : getFilteredAccountsForCalculations()} 
            previousBalance={previousBalance}
          />

          {/* Lista simplificada de contas */}
          <AccountsListMobile 
            accounts={filteredAccounts} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <AccountModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSubmit={handleSubmit}
            account={editingAccount}
            categories={categories}
          />

        </div>
      );
    }

    // Versão Desktop Completa
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-start gap-4 px-1">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2563EB] via-[#1687B0] to-[#16A34A] bg-clip-text text-transparent">
              Painel Contas
            </h1>
            <p className="text-sm text-[#475569] mt-0.5">
              Visão geral das suas contas
            </p>
          </div>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            title="Voltar para a Homepage"
            aria-label="Voltar para a Homepage"
            className="shrink-0 h-10 px-4 inline-flex items-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-blue-300"
          >
            <Home className="h-4 w-4 text-blue-600" />
            <span>Menu Financeiro</span>
          </Button>

          <Button
            type="button"
            onClick={handleNewAccount}
            className="shrink-0 h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-sm hover:bg-slate-50 hover:border-blue-300"
          >
            <Plus className="h-4 w-4 text-blue-600" />
            <span>Nova Conta</span>
          </Button>

          <Button
            type="button"
            onClick={() => navigate('/relatorios')}
            className="shrink-0 h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-sm hover:bg-slate-50 hover:border-blue-300"
          >
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Relatórios</span>
          </Button>
          <Button
            type="button"
            onClick={() => setCalcOpen(true)}
            title="Abrir calculadora"
            aria-label="Abrir calculadora"
            className="h-10 w-10 shrink-0 p-0 inline-flex items-center justify-center rounded-md bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 hover:from-slate-400 hover:to-slate-700 text-white shadow border border-slate-300"
          >
            <Calculator className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          {/* Cards de resumo */}
          <AccountsSummaryCards 
            accounts={useFilteredAccountsForCards ? filteredAccounts : getFilteredAccountsForCalculations()} 
            previousBalance={previousBalance} 
            isJanuary={currentMonth === 0}
            onFilterRecebido={() => { setTypeFilter('receita'); setStatusFilter('recebido'); }}
            onFilterPago={() => { setTypeFilter('despesa'); setStatusFilter('pago'); }}
            onFilterPendente={() => { setTypeFilter('todos'); setStatusFilter('pendente'); }}
            activeFilter={
              typeFilter === 'receita' && statusFilter === 'recebido' ? 'recebido' :
              typeFilter === 'despesa' && statusFilter === 'pago' ? 'pago' :
              statusFilter === 'pendente' ? 'pendente' : null
            }
          />

          {/* Filtros de pesquisa abaixo dos cards */}
          <AccountsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchField={searchField}
            setSearchField={setSearchField}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            bankFilter={bankFilter}
            setBankFilter={setBankFilter}
            accounts={accounts}
            startDateFilter={startDateFilter}
            setStartDateFilter={setStartDateFilter}
            endDateFilter={endDateFilter}
            setEndDateFilter={setEndDateFilter}
          />

          <div className="mb-4">
            <p className="w-full text-left text-sm text-slate-600">
              {filteredAccounts.length} {filteredAccounts.length === 1 ? 'conta encontrada' : 'contas encontradas'}
            </p>
          </div>


          <AccountsTable
            accounts={filteredAccounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>

        <AccountModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleSubmit}
          account={editingAccount}
          categories={categories}
        />
      </div>
    );
  };

  return (
  <AccessControlWrapper>
    <Layout>
      {renderContent()}
      <FloatingCalculator
        isOpen={calcOpen}
        onClose={() => setCalcOpen(false)}
      />
    </Layout>
  </AccessControlWrapper>
);
};

export default Contas;
