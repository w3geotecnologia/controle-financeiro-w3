
import React from 'react';
import { User, LogOut, Settings, Crown, Clock, PanelLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from '@/components/ui/sidebar';

const getSubtitleByRoute = (pathname: string): string => {
  const routeSubtitles: Record<string, string> = {
    '/': 'Gestão Financeira',
    '/contas': 'Gestão de Contas',
    '/card-accounts': 'Gestão Contas Cartões',
    '/cartoes-credito': 'Gestão Cartões de Crédito',
    '/bancos': 'Gestão Contas Bancos',
    '/investimentos': 'Gestão de Investimentos',
    '/investimentos-vencidos': 'Gestão Investimentos Vencidos',
    '/categorias': 'Gestão de Categorias',
    '/analise': 'Gestão Análise Gráfica',
    '/relatorios': 'Gestão de Relatórios',
    '/dashboard': 'Gestão Financeira',
    '/admin': 'Administração',
    '/admin/relatorio': 'Relatório de Acessos',
    '/change-password': 'Alterar Senha',
  };
  return routeSubtitles[pathname] || 'Gestão Financeira';
};

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { trialStatus, loading } = useTrialStatus();
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();
  
  const subtitle = getSubtitleByRoute(location.pathname);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  const renderUserStatus = () => {
    if (loading) {
      return (
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} />
          <span>Carregando...</span>
        </div>
      );
    }

    if (trialStatus?.is_premium) {
      return (
        <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
          <Crown size={12} />
          <span>Premium</span>
        </div>
      );
    }

    if (trialStatus?.is_trial_active) {
      return (
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <Clock size={12} />
          <span>Trial - {trialStatus.days_remaining} dias restantes</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-xs text-red-600">
        <Clock size={12} />
        <span>Trial expirado</span>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Controle Financeiro W3
          </h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
          {!isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Mostrar menu lateral"
              className="mt-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <PanelLeft size={14} />
              Menu
            </button>
          )}
        </div>

        
        {!isMobile && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Usuário</p>
              <p className="text-xs text-slate-500">{user?.email || 'user@example.com'}</p>
              {renderUserStatus()}
              {trialStatus?.is_premium && (
                <button
                  onClick={handleChangePassword}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1"
                >
                  Alterar senha
                </button>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
                  <Settings size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
          </div>
        )}
      </div>
    </header>
  );
};
