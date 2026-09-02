import React from 'react';
import { User, Crown, Clock, Settings, LogOut, ChevronDown } from 'lucide-react';
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
} from "@/components/ui/dropdown-menu";

/**
 * Pill de usuário/logout — mesmo estilo usado no desktop.
 * Botão cápsula branco com avatar gradiente, nome, status e chevron,
 * abrindo dropdown com "Alterar Senha" e "Sair".
 */
export const UserMenuPill: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { user, signOut } = useAuth();
  const { trialStatus, loading: trialLoading } = useTrialStatus();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChangePassword = () => navigate('/change-password');

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`
            flex items-center gap-2.5
            bg-white rounded-full shadow-sm
            border border-slate-200
            pl-2 pr-4 py-1.5
            hover:bg-slate-50 transition-colors
            w-full
            ${className}
          `}
        >
          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shrink-0">
            <User size={14} className="text-white" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 leading-tight truncate">
              {user?.email?.split('@')[0] || 'Usuário'}
            </p>
            {trialLoading ? (
              <p className="text-[10px] text-slate-400 flex items-center gap-1 leading-tight">
                <Clock size={9} /> Carregando...
              </p>
            ) : trialStatus?.is_premium ? (
              <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1 leading-tight">
                <Crown size={9} /> Premium
              </p>
            ) : trialStatus?.is_trial_active ? (
              <p className="text-[10px] text-blue-600 flex items-center gap-1 leading-tight">
                <Clock size={9} /> Trial · {trialStatus.days_remaining}d
              </p>
            ) : (
              <p className="text-[10px] text-red-600 flex items-center gap-1 leading-tight">
                <Clock size={9} /> Trial expirado
              </p>
            )}
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-52">
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
