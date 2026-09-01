import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { DashboardTopSection } from '@/components/Dashboard/DashboardTopSection';
import { SpendingByCategoryCard } from '@/components/Dashboard/SpendingByCategoryCard';
import { BankBalancesCard } from '@/components/Dashboard/BankBalancesCard';
import { CreditCardsOverviewCard } from '@/components/Dashboard/CreditCardsOverviewCard';
import { FinancialEvolutionCard } from '@/components/Dashboard/FinancialEvolutionCard';
import { InvestmentsOverviewCard } from '@/components/Dashboard/InvestmentsOverviewCard';
import { ExpiringTomorrowAlert } from '@/components/Dashboard/ExpiringTomorrowAlert';
import { VoiceAccountDialog } from '@/components/Accounts/VoiceAccountDialog';
import type { AccountFormData } from '@/components/Accounts/AccountModal';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { useAccountOperations } from '@/hooks/useAccountOperations';
import { Loader2, User, Crown, Clock, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountsContext';
import { MobileMenu } from '@/components/MobileMenu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MobileUserBlock: React.FC<{ onOpenMenu: () => void }> = () => {
  const { user, signOut } = useAuth();
  const { trialStatus, loading: trialLoading } = useTrialStatus();
  const navigate = useNavigate();

  const handleChangePassword = () => navigate('/change-password');
  const handleLogout = async () => { try { await signOut(); } catch {} };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 bg-white rounded-full shadow-sm border border-slate-200 pl-2 pr-4 py-1.5 hover:bg-slate-50 transition-colors">
          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shrink-0">
            <User size={14} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-700 leading-tight truncate max-w-[120px]">
              {user?.email?.split('@')[0] || 'Usuário'}
            </p>
            {trialLoading ? (
              <p className="text-[10px] text-slate-400 flex items-center gap-1 leading-tight"><Clock size={9} /> Carregando...</p>
            ) : trialStatus?.is_premium ? (
              <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1 leading-tight"><Crown size={9} /> Premium</p>
            ) : trialStatus?.is_trial_active ? (
              <p className="text-[10px] text-blue-600 flex items-center gap-1 leading-tight"><Clock size={9} /> Trial · {trialStatus.days_remaining}d</p>
            ) : (
              <p className="text-[10px] text-red-600 flex items-center gap-1 leading-tight"><Clock size={9} /> Trial expirado</p>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="center" className="w-52">
        <DropdownMenuItem onClick={handleChangePassword} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          Alterar Senha
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Dashboard: React.FC = () => {
  const { accounts, loading, refreshAccounts } = useAccounts() as any;
  const isMobile = useIsMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const { toast } = useToast();

  const { handleSave } = useAccountOperations();

  const handleVoiceSubmit = async (data: AccountFormData) => {
    await handleSave(data);
    setVoiceOpen(false);
    toast({ title: 'Conta cadastrada', description: 'Registro por voz salvo com sucesso.' });
    if (typeof refreshAccounts === 'function') {
      await refreshAccounts();
    }
  };

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
            <div className="flex flex-col gap-2 mb-1">
              {/* Card topo: logo + usuário */}
              <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-200 px-4 py-3">
                {/* Logo clicável à esquerda */}
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="focus:outline-none"
                  aria-label="Abrir menu"
                >
                  <span className="text-2xl font-extrabold tracking-tight">
                    <span style={{ color: '#1a4fa0' }}>FINAN</span><span style={{ color: '#2a9d8f' }}>TEC</span>
                  </span>
                </button>

                {/* Bloco usuário à direita */}
                <MobileUserBlock onOpenMenu={() => setShowMobileMenu(true)} />
              </div>
            </div>
          )}

          <DashboardTopSection
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            onMonthChange={handleMonthChange}
            onOpenMobileMenu={isMobile ? () => setShowMobileMenu(true) : undefined}
          />

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
