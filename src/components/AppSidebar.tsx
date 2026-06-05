import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Smartphone
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const menuItems = [
  { 
    icon: FileSearch, 
    label: 'Menu Financeiro', 
    path: '/', 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverBg: 'hover:bg-blue-100'
  },
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

export function AppSidebar() {
  const location = useLocation();
  const { open } = useSidebar();

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
    </Sidebar>
  );
}
