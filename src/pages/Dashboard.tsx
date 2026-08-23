import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { DashboardTopSection } from '@/components/Dashboard/DashboardTopSection';
import { RecentTransactions } from '@/components/Dashboard/RecentTransactions';
import { CreditCardPendingSummary } from '@/components/Dashboard/CreditCardPendingSummary';
import { AccountsPendingSummary } from '@/components/Dashboard/AccountsPendingSummary';
import { ExpiringTomorrowAlert } from '@/components/Dashboard/ExpiringTomorrowAlert';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { MobileUserCard } from '@/components/Dashboard/MobileUserCard';
import { MonthlyRevenueExpenseChart } from '@/components/Dashboard/MonthlyRevenueExpenseChart';
import { Loader2, Menu } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountsContext';
import { MobileMenu } from '@/components/MobileMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { loading, accounts, getTransactions } = useAccounts();
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  // Agendar notificações locais no celular para vencimentos de amanhã
  useLocalNotifications();

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // --- Função auxiliar: filtra contas do mês/ano selecionado (sem Saldo Anterior)
  const getFilteredAccountsForCalculations = () => {
    return accounts.filter((account) => {
      if (!account.dueDate || account.description === "Saldo Anterior") return false;
      const dueDate = new Date(account.dueDate + "T00:00:00");
      return (
        dueDate.getMonth() === selectedMonth &&
        dueDate.getFullYear() === selectedYear
      );
    });
  };

  // --- Calcular saldo acumulado até um determinado mês/ano (ignorando registros "Saldo Anterior")
  const calculateAccumulatedBalance = React.useCallback((untilMonth: number, untilYear: number) => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Filtrar todas as contas até o mês/ano especificado (EXCLUINDO "Saldo Anterior")
    const accountsUntilDate = accounts.filter(acc => {
      if (!acc.dueDate || acc.description === "Saldo Anterior") return false;
      const d = new Date(acc.dueDate + "T00:00:00");
      const accYear = d.getFullYear();
      const accMonth = d.getMonth();
      
      // Incluir se for ano anterior OU se for mesmo ano mas mês anterior ou igual
      return accYear < untilYear || (accYear === untilYear && accMonth <= untilMonth);
    });
    
    // Calcular total de receitas recebidas
    const totalRecebido = accountsUntilDate
      .filter(acc => acc.type === "receita" && acc.status === "recebido")
      .reduce((sum, acc) => sum + acc.amount, 0);
    
    // Calcular total de despesas pagas
    const totalPago = accountsUntilDate
      .filter(acc => acc.type === "despesa" && acc.status === "pago")
      .reduce((sum, acc) => sum + Math.abs(acc.amount), 0);
    
    return totalRecebido - totalPago;
  }, [accounts]);

  // --- Calcular previousBalance dinamicamente baseado no saldo final do mês anterior
  const getPreviousBalance = React.useMemo(() => {
    if (!accounts || accounts.length === 0) return 0;
    
    // Para janeiro, calcular baseado em dezembro do ano anterior
    if (selectedMonth === 0) {
      return calculateAccumulatedBalance(11, selectedYear - 1);
    }
    
    // Para outros meses, calcular baseado no mês anterior do mesmo ano
    return calculateAccumulatedBalance(selectedMonth - 1, selectedYear);
  }, [accounts, selectedMonth, selectedYear, calculateAccumulatedBalance]);

  // --- Total Recebido
 const getMonthReceitas = () => {
  const monthAccounts = getFilteredAccountsForCalculations();
  return monthAccounts
    .filter((acc) => acc.type === "receita" && acc.status?.toLowerCase() === "recebido")
    .reduce((sum, acc) => sum + (acc.amount || 0), 0);
};

 const getMonthDespesas = () => {
  return accounts
    .filter(account => {
      if (account.type !== 'despesa' || account.status?.toLowerCase() !== 'pago') return false;
      const dueDate = new Date(account.dueDate + "T00:00:00");
      return dueDate.getMonth() === selectedMonth && dueDate.getFullYear() === selectedYear;
    })
    .reduce((sum, account) => sum + Math.abs(account.amount || 0), 0);
};

  // --- Saldo Final
  const getMonthSaldoFinal = () => {
    // Total Recebido e Total Pago
    const totalRecebido = getMonthReceitas();
    const totalPago = getMonthDespesas();

    // Saldo final = previousBalance + totalRecebido - totalPago
    return getPreviousBalance + totalRecebido - totalPago;
  };

  // Obter nome do mês
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho','Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const selectedMonthName = monthNames[selectedMonth];

  const transactions = getTransactions();

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleReceitasClick = () => navigate('/contas?type=receita&status=recebido');
  const handleDespesasClick = () => navigate('/contas?type=despesa&status=pago');
  const handleContasPendentesClick = () => navigate('/contas?status=pendente');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando dados...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Mobile menu view
  if (isMobile && showMobileMenu) {
    return <MobileMenu onViewDashboard={() => setShowMobileMenu(false)} />;
  }

  return (
    <AccessControlWrapper>
      <Layout>
        <div className="space-y-2 sm:space-y-6">
          {isMobile && (
            <div className="space-y-3 mb-4">
              <Button
                onClick={() => setShowMobileMenu(true)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Menu className="h-5 w-5" />
                Menu Principal
              </Button>
              <MobileUserCard />
            </div>
          )}
          
          <DashboardTopSection
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            onMonthChange={handleMonthChange}
          />

          <ExpiringTomorrowAlert />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-6">
            <RecentTransactions />
            <CreditCardPendingSummary />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:gap-6">
            <AccountsPendingSummary />
          </div>

          <MonthlyRevenueExpenseChart year={selectedYear} />
        </div>
      </Layout>
    </AccessControlWrapper>
  );
};

export default Dashboard;
