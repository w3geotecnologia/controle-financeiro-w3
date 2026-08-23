import React, { useState } from 'react';
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
  const { loading } = useAccounts();
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  // Agendar notificações locais no celular para vencimentos de amanhã
  useLocalNotifications();

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

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
