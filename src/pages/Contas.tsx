// pages/Contas.tsx
import React from 'react';
import { Layout } from '@/components/Layout';
import { AccountsHeader } from '@/components/Accounts/AccountsHeader';
import { AccountsFilters } from '@/components/Accounts/AccountsFilters';
import { AccountsSummaryCards } from '@/components/Accounts/AccountsSummaryCards';
import { AccountsSummaryCardsMobile } from '@/components/Accounts/AccountsSummaryCardsMobile';
import { AccountsListMobile } from '@/components/Accounts/AccountsListMobile';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { AccountModal, AccountFormData } from '@/components/Accounts/AccountModal';
import { MonthNavigator } from '@/components/Accounts/MonthNavigator';
import { MonthYearStepperMobile } from '@/components/Accounts/MonthYearStepperMobile';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { Loader2, Menu, Plus, FileText, Search } from 'lucide-react';
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
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    monthFilter,
    setMonthFilter,
    yearFilter,
    setYearFilter,
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

  // Calcular saldo acumulado até um determinado mês/ano (OTIMIZADO)
  const calculateAccumulatedBalance = React.useCallback((untilMonth: number, untilYear: number, paymentSourceFilter?: string) => {
    if (!accounts || accounts.length === 0) return 0;
    
    let totalRecebido = 0;
    let totalPago = 0;
    
    // Uma única iteração sobre as contas
    for (const acc of accounts) {
      if (!acc.dueDate || acc.description === "Saldo Anterior") continue;
      
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

  // Calcular previousBalance dinamicamente baseado no saldo final do mês anterior
  const previousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    const targetMonth = isShowingAll ? 0 : currentMonth;
    const targetYear = currentYear;
    
    // Verificar se há filtro de payment_source ativo através do searchTerm
    const paymentSourceFilter = hasActiveSearch ? searchTerm : undefined;
    
    // Para janeiro, calcular baseado em dezembro do ano anterior
    if (targetMonth === 0) {
      return calculateAccumulatedBalance(11, targetYear - 1, paymentSourceFilter);
    }
    
    // Para outros meses, calcular baseado no mês anterior do mesmo ano
    return calculateAccumulatedBalance(targetMonth - 1, targetYear, paymentSourceFilter);
  }, [accounts, currentMonth, currentYear, isShowingAll, hasActiveSearch, searchTerm, calculateAccumulatedBalance]);

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
  }, [accounts, currentMonth, currentYear, isShowingAll]);

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
          {/* Botões de ação */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Menu className="h-5 w-5" />
              Menu Principal
            </Button>

            <div className="flex gap-3">
              <Button
                onClick={handleNewAccount}
                className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                <Plus size={18} className="mr-2" />
                Nova Conta
              </Button>
              
              <Button
                onClick={() => navigate('/relatorios')}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                <FileText size={18} className="mr-2" />
                Relatórios
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
            accounts={hasActiveSearch ? filteredAccounts : getFilteredAccountsForCalculations()} 
            previousBalance={previousBalance}
          />

          {/* Lista simplificada de contas */}
          <AccountsListMobile 
            accounts={filteredAccounts} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <AccountModal
            key={editingAccount?.id || 'new'}
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
        <AccountsHeader 
          onNewAccount={handleNewAccount}
        />

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          {/* Cards de resumo */}
          <AccountsSummaryCards 
            accounts={hasActiveSearch ? filteredAccounts : getFilteredAccountsForCalculations()} 
            previousBalance={previousBalance} 
            isJanuary={currentMonth === 0}
          />

          {/* Filtros de pesquisa abaixo dos cards */}
          <AccountsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            accounts={accounts}
          />

          <div className="mb-4">
            <p className="text-sm text-slate-600 text-center">
              {filteredAccounts.length} {filteredAccounts.length === 1 ? 'conta encontrada' : 'contas encontradas'}
            </p>
          </div>

          <MonthNavigator
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={handleMonthChange}
            onShowAll={handleShowAll}
            isShowingAll={isShowingAll}
            onAnnualView={handleAnnualView}
            isAnnualView={isAnnualView}
          />

          <AccountsTable
            accounts={filteredAccounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        </div>

        <AccountModal
          key={editingAccount?.id || 'new'}
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
      </Layout>
    </AccessControlWrapper>
  );
};

export default Contas;
