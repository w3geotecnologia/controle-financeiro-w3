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
  ChevronDown,
  LogOut,
  KeyRound,
  User,
  BarChart3,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { icon: FileSearch, label: 'Menu Financeiro', path: '/' },
  { icon: Receipt, label: 'Contas', path: '/contas' },
  { icon: CreditCard, label: 'Contas Cartões', path: '/card-accounts' },
  { icon: CreditCard, label: 'Cartões de Crédito', path: '/cartoes-credito' },
  { icon: Building2, label: 'Bancos', path: '/bancos' },
  { icon: Tag, label: 'Categorias', path: '/categorias' },
  { icon: PieChart, label: 'Análise Gráfica', path: '/analise' },
  { icon: TrendingUp, label: 'Investimentos', path: '/investimentos' },
  { icon: Archive, label: 'Invest.Vencidos', path: '/investimentos-vencidos' },
  { icon: Settings, label: 'Administração', path: '/admin' },
  { icon: Smartphone, label: 'Baixar App', path: '/install' },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open } = useSidebar();
  const { user, signOut } = useAuth();
  const { trialStatus } = useTrialStatus();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: 'Logout realizado', description: 'Você foi desconectado com sucesso.' });
    } catch {
      toast({ title: 'Erro', description: 'Erro ao fazer logout.', variant: 'destructive' });
    }
  };

  const roleLabel = trialStatus?.is_premium
    ? 'Premium'
    : trialStatus?.is_trial_active
    ? `Trial · ${trialStatus.days_remaining} dias`
    : 'Trial expirado';

  return (
    <Sidebar
      className={`transition-all duration-300 ${open ? 'w-64' : 'w-16'} border-r border-sidebar-border h-screen`}
      collapsible="icon"
    >
      <SidebarHeader className="px-3 pt-5 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 shrink-0 rounded-full bg-sidebar-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {open && (
            <span className="text-lg font-semibold tracking-tight text-sidebar-primary-foreground">
              Finantec
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 mt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 h-auto text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }`}
                      >
                        <Icon className={`h-[18px] w-[18px] shrink-0 ${open ? '' : 'mx-auto'}`} />
                        {open && <span className="truncate">{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 rounded-lg p-1.5 text-left hover:bg-sidebar-accent transition-colors">
              <span className="h-9 w-9 shrink-0 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
                <User className="h-4 w-4" />
              </span>
              {open && (
                <>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-sidebar-primary-foreground truncate">
                      {user?.email?.split('@')[0] || 'Usuário'}
                    </span>
                    <span className="block text-xs text-sidebar-foreground/70 truncate">{roleLabel}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/70" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem disabled className="text-xs opacity-100">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/change-password')} className="cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4" />
              Alterar senha
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
