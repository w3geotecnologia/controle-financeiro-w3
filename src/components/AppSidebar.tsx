import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileSearch,
  Receipt, 
  Tag, 
  Building2, 
  CreditCard,
  TrendingUp, 
  PieChart,
  Settings,
  Archive,
  Smartphone,
  User,
  Crown,
  Clock,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTrialStatus } from '@/hooks/useTrialStatus';

const menuItems = [
  {
    icon: Receipt,
    label: 'Contas', 
    path: '/contas', 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverBg: 'hover:bg-green-100'
  },
  { 
    icon: CreditCard, 
    label: 'Contas Cartões', 
    path: '/card-accounts', 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hoverBg: 'hover:bg-purple-100'
  },
  { 
    icon: CreditCard, 
    label: 'Cartões de Crédito', 
    path: '/cartoes-credito', 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hoverBg: 'hover:bg-red-100'
  },
  { 
    icon: Building2, 
    label: 'Bancos', 
    path: '/bancos', 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    hoverBg: 'hover:bg-indigo-100'
  },
  { 
    icon: Tag, 
    label: 'Categorias', 
    path: '/categorias', 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverBg: 'hover:bg-orange-100'
  },
  { 
    icon: PieChart, 
    label: 'Análise Gráfica', 
    path: '/analise', 
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    hoverBg: 'hover:bg-cyan-100'
  },
  { 
    icon: TrendingUp, 
    label: 'Investimentos', 
    path: '/investimentos', 
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    hoverBg: 'hover:bg-teal-100'
  },
  { 
    icon: Archive, 
    label: 'Invest.Vencidos', 
    path: '/investimentos-vencidos', 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverBg: 'hover:bg-orange-100'
  },
  { 
    icon: Settings, 
    label: 'Administração', 
    path: '/admin', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    hoverBg: 'hover:bg-gray-100'
  },
  { 
    icon: Smartphone, 
    label: 'Baixar App', 
    path: '/install', 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    hoverBg: 'hover:bg-emerald-100'
  },
];

function UserStatusBadge({ trialStatus, loading }: { trialStatus: any; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Clock size={11} />
        <span>Carregando...</span>
      </div>
    );
  }
  if (trialStatus?.is_premium) {
    return (
      <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
        <Crown size={11} />
        <span>Premium</span>
      </div>
    );
  }
  if (trialStatus?.is_trial_active) {
    return (
      <div className="flex items-center gap-1 text-xs text-blue-600">
        <Clock size={11} />
        <span>Trial · {trialStatus.days_remaining}d</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-xs text-red-600">
      <Clock size={11} />
      <span>Trial expirado</span>
    </div>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useSidebar();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { trialStatus, loading } = useTrialStatus();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: "Logout realizado", description: "Você foi desconectado com sucesso." });
    } catch {
      toast({ title: "Erro", description: "Erro ao fazer logout.", variant: "destructive" });
    }
  };

  const handleChangePassword = () => navigate('/change-password');

  return (
    <Sidebar 
      className={`transition-all duration-300 ${open ? 'w-64' : 'w-16'} bg-gradient-to-b from-slate-50 to-white shadow-lg border-r h-screen`}
      collapsible="icon"
    >
      <SidebarContent className="mt-6 px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? `${item.bgColor} ${item.color} shadow-sm border-l-4 border-current`
                            : `text-gray-600 ${item.hoverBg} hover:text-gray-900 hover:shadow-sm`
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${open ? 'mr-3' : 'mx-auto'} ${isActive ? item.color : 'text-gray-500'}`} />
                        {open && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User block at the bottom */}
      <SidebarFooter className="px-4 pb-4 pt-2 border-t border-slate-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-left ${
                !open ? 'justify-center' : ''
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center shrink-0">
                <User size={15} className="text-white" />
              </div>
              {open && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">Usuário</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                  <UserStatusBadge trialStatus={trialStatus} loading={loading} />
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
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
      </SidebarFooter>
    </Sidebar>
  );
}
