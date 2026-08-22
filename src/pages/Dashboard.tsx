import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { DashboardMonthNavigator } from '@/components/Dashboard/DashboardMonthNavigator';
import { ExpiringTomorrowAlert } from '@/components/Dashboard/ExpiringTomorrowAlert';
import { MobileUserCard } from '@/components/Dashboard/MobileUserCard';
import { ConsolidatedBalance } from '@/components/Dashboard/v2/ConsolidatedBalance';
import { MonthStatCards } from '@/components/Dashboard/v2/MonthStatCards';
import { BudgetProgress } from '@/components/Dashboard/v2/BudgetProgress';
import { FinancialEvolutionChart } from '@/components/Dashboard/v2/FinancialEvolutionChart';
import { CategorySpendCard } from '@/components/Dashboard/v2/CategorySpendCard';
import { CardsOverview } from '@/components/Dashboard/v2/CardsOverview';
import { InvestmentsOverview } from '@/components/Dashboard/v2/InvestmentsOverview';
import { BanksBalanceCard } from '@/components/Dashboard/v2/BanksBalanceCard';
import { LatestTransactions } from '@/components/Dashboard/v2/LatestTransactions';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { useAccounts } from '@/contexts/AccountsContext';
import { useBanksData } from '@/hooks/useBanksData';
import { useInvestmentsData } from '@/hooks/useInvestmentsData';
import { useCreditCardsData } from '@/hooks/useCreditCardsData';
import { Loader2, Menu } from 'lucide-react';
import { MobileMenu } from '@/components/MobileMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { loading, accounts } = useAccounts();
  const { banks } = useBanksData();
  const { investments } = useInvestmentsData();
  const { creditCards } = useCreditCardsData();
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  useLocalNotifications();

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const monthTotals = React.useCallback(
    (month: number, year: number) => {
      let receitas = 0;
      let despesas = 0;
      accounts.forEach((acc) => {
        if (!acc.dueDate || acc.description === 'Saldo Anterior') return;
        const d = new Date(acc.dueDate + 'T00:00:00');
        if (d.getMonth() !== month || d.getFullYear() !== year) return;
        if (acc.type === 'receita' && acc.status?.toLowerCase() === 'recebido') receitas += acc.amount || 0;
        if (acc.type === 'despesa' && acc.status?.toLowerCase() === 'pago') despesas += Math.abs(acc.amount || 0);
      });
      return { receitas, despesas, resultado: receitas - despesas };
    },
    [accounts]
  );

  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

  const current = useMemo(() => monthTotals(selectedMonth, selectedYear), [monthTotals, selectedMonth, selectedYear]);
  const previous = useMemo(() => monthTotals(prevMonth, prevYear), [monthTotals, prevMonth, prevYear]);

  const variation = (now: number, before: number) =>
    before === 0 ? null : ((now - before) / Math.abs(before)) * 100;

  const banksTotal = (banks || []).reduce((s, b) => s + (b.balance || 0), 0);
  const investmentsTotal = (investments || []).reduce(
    (s, i) => s + (i.current_value || i.invested_amount || 0),
    0
  );
  const cardsTotal = (creditCards || []).reduce((s, c) => s + Math.abs(c.current_value || 0), 0);

  const budget = useMemo(() => {
    const despesasPrevistas = accounts
      .filter((acc) => {
        if (acc.type !== 'despesa' || !acc.dueDate || acc.description === 'Saldo Anterior') return false;
        const d = new Date(acc.dueDate + 'T00:00:00');
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      })
      .reduce((s, acc) => s + Math.abs(acc.amount || 0), 0);
    return despesasPrevistas;
  }, [accounts, selectedMonth, selectedYear]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
            <span className="text-lg text-muted-foreground">Carregando dados...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (isMobile && showMobileMenu) {
    return <MobileMenu onViewDashboard={() => setShowMobileMenu(false)} />;
  }

  return (
    <AccessControlWrapper>
      <Layout>
        <div className="space-y-3 sm:space-y-4">
          {isMobile && (
            <div className="space-y-3">
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

          <DashboardMonthNavigator
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            onMonthChange={(month, year) => {
              setSelectedMonth(month);
              setSelectedYear(year);
            }}
          />

          <ExpiringTomorrowAlert />

          <ConsolidatedBalance
            banksTotal={banksTotal}
            investmentsTotal={investmentsTotal}
            cardsTotal={cardsTotal}
            variationPct={variation(current.resultado, previous.resultado)}
            previousMonthLabel={MONTH_NAMES[prevMonth]}
          />

          <MonthStatCards
            receitas={current.receitas}
            despesas={current.despesas}
            resultado={current.resultado}
            varReceitas={variation(current.receitas, previous.receitas)}
            varDespesas={variation(current.despesas, previous.despesas)}
            varResultado={variation(current.resultado, previous.resultado)}
            previousMonthLabel={MONTH_NAMES[prevMonth]}
            onReceitasClick={() => navigate('/contas?type=receita&status=recebido')}
            onDespesasClick={() => navigate('/contas?type=despesa&status=pago')}
          />

          <BudgetProgress spent={current.despesas} budget={budget} />

          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-3 sm:gap-4">
            <FinancialEvolutionChart
              accounts={accounts}
              year={selectedYear}
              monthIndex={selectedMonth}
              extraPatrimony={banksTotal + investmentsTotal - cardsTotal}
            />
            <CategorySpendCard accounts={accounts} month={selectedMonth} year={selectedYear} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <CardsOverview />
            <InvestmentsOverview />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <BanksBalanceCard />
            <LatestTransactions accounts={accounts} />
          </div>
        </div>
      </Layout>
    </AccessControlWrapper>
  );
};

export default Dashboard;
