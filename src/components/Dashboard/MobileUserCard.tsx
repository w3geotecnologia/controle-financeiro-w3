import React from 'react';
import { User, Crown, Clock, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const MobileUserCard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { trialStatus, loading } = useTrialStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

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
          <span>Trial - {trialStatus.days_remaining} dias</span>
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
    <Card className="bg-white border-none shadow-md hover:shadow-lg transition-all duration-200 p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
        <User size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700">Usuário</p>
        <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
        {renderUserStatus()}
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-md hover:bg-slate-100 flex-shrink-0">
            <Settings size={18} />
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
    </Card>
  );
};
