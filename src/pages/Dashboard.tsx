import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { SpendingByCategoryCard } from '@/components/Dashboard/SpendingByCategoryCard';
import { BankBalancesCard } from '@/components/Dashboard/BankBalancesCard';
import { CreditCardsOverviewCard } from '@/components/Dashboard/CreditCardsOverviewCard';
import { FinancialEvolutionCard } from '@/components/Dashboard/FinancialEvolutionCard';
import { InvestmentsOverviewCard } from '@/components/Dashboard/InvestmentsOverviewCard';
import { ExpiringTomorrowAlert } from '@/components/Dashboard/ExpiringTomorrowAlert';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { MobileUserCard } from '@/components/Dashboard/MobileUserCard';

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
  const selectedMonth = today.getMonth();
  const selectedYear = today.getFullYear();

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

          <div className="flex flex-wrap items-center justify-start gap-4 px-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2563EB] via-[#1687B0] to-[#16A34A] bg-clip-text text-transparent">
                Painel Financeiro
              </h1>
              <p className="text-sm text-[#475569] mt-0.5">
                Visão geral da sua vida financeira
              </p>
            </div>
          </div>

          <ExpiringTomorrowAlert />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-6 items-start">
            <SpendingByCategoryCard month={selectedMonth} year={selectedYear} />
            <BankBalancesCard />
            <CreditCardsOverviewCard />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-6 items-start">
            <FinancialEvolutionCard />
            <InvestmentsOverviewCard />
          </div>



        </div>
      </Layout>
    </AccessControlWrapper>
  );
};

export default Dashboard;
