import React from 'react';
import { Link } from 'react-router-dom';
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
  LayoutDashboard,
  Smartphone
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@/utils/version';

const menuItems = [
  { 
    icon: Receipt, 
    label: 'Contas', 
    path: '/contas', 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  { 
    icon: CreditCard, 
    label: 'Contas Cartões', 
    path: '/card-accounts', 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  { 
    icon: CreditCard, 
    label: 'Cartões de Crédito', 
    path: '/cartoes-credito', 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  { 
    icon: Building2, 
    label: 'Bancos', 
    path: '/bancos', 
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  { 
    icon: Tag, 
    label: 'Categorias', 
    path: '/categorias', 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  { 
    icon: PieChart, 
    label: 'Análise Gráfica', 
    path: '/analise', 
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
  { 
    icon: TrendingUp, 
    label: 'Investimentos', 
    path: '/investimentos', 
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  { 
    icon: Archive, 
    label: 'Invest.Vencidos', 
    path: '/investimentos-vencidos', 
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  { 
    icon: Settings, 
    label: 'Administração', 
    path: '/admin', 
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  { 
    icon: Smartphone, 
    label: 'Baixar App', 
    path: '/install', 
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
];

interface MobileMenuProps {
  onViewDashboard?: () => void;
}

export function MobileMenu({ onViewDashboard }: MobileMenuProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Financeiro</h1>
        <p className="text-sm text-gray-600">Selecione uma opção</p>
      </div>

      {onViewDashboard && (
        <Button
          onClick={onViewDashboard}
          className="w-full mb-4 h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
        >
          <LayoutDashboard className="mr-2 h-6 w-6" />
          Ver Resumo Financeiro
        </Button>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <Link key={item.path} to={item.path}>
              <Card className={`${item.bgColor} border-none shadow-md hover:shadow-lg transition-all duration-200 h-32 flex flex-col items-center justify-center p-4`}>
                <Icon className={`h-10 w-10 ${item.color} mb-2`} />
                <span className={`text-sm font-medium text-center ${item.color}`}>
                  {item.label}
                </span>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <span className="text-xs text-muted-foreground">
          Versão {APP_VERSION}
        </span>
      </div>
    </div>
  );
}
