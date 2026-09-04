import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  ChevronDown,
  FileSearch,
  Receipt,
  CreditCard,
  Building2,
  Tag,
  PieChart,
  TrendingUp,
  Archive,
  Settings,
  Smartphone,
} from 'lucide-react';

const financeMenuItems = [
  { icon: FileSearch, label: 'Painel Financeiro', path: '/', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { icon: Receipt, label: 'Contas', path: '/contas', color: 'text-green-600', bgColor: 'bg-green-50' },
  { icon: CreditCard, label: 'Contas Cartões', path: '/card-accounts', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { icon: CreditCard, label: 'Cartões de Crédito', path: '/cartoes-credito', color: 'text-red-600', bgColor: 'bg-red-50' },
  { icon: Building2, label: 'Bancos', path: '/bancos', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { icon: Tag, label: 'Categorias', path: '/categorias', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { icon: PieChart, label: 'Análise Gráfica', path: '/analise', color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  { icon: TrendingUp, label: 'Investimentos', path: '/investimentos', color: 'text-teal-600', bgColor: 'bg-teal-50' },
  { icon: Archive, label: 'Invest.Vencidos', path: '/investimentos-vencidos', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { icon: Settings, label: 'Administração', path: '/admin', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { icon: Smartphone, label: 'Baixar App', path: '/install', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
];

interface MainMenuButtonProps {
  className?: string;
}

export const MainMenuButton: React.FC<MainMenuButtonProps> = ({ className = '' }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenuOpen(false), 200);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className={`shrink-0 ${className}`}>
      {/* Mobile: abre o Menu Financeiro com todas as páginas */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="
              lg:hidden
              w-full sm:w-auto h-10 px-4
              inline-flex items-center justify-center gap-2
              bg-white rounded-full shadow-sm
              border border-slate-200
              text-sm font-semibold text-[#0F172A]
              hover:bg-slate-50 transition-colors
            "
          >
            <Menu className="h-4 w-4 text-[#2563EB]" />
            Menu Principal
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="lg:hidden rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left">Menu Financeiro</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2 mt-4 pb-4">
            {financeMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSheetOpen(false)}
                  className={`
                    flex items-center gap-2 px-3 py-3 rounded-xl border border-slate-100
                    text-sm font-medium transition-colors
                    ${isActive ? `${item.bgColor} ${item.color}` : 'text-slate-700 bg-white'}
                  `}
                >
                  <span className={`p-1.5 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>


      {/* Desktop: menu suspenso */}
      <div
        className="relative hidden lg:block"
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(o => !o)}
          className={`
            h-10 px-4
            flex items-center gap-2
            bg-white rounded-full shadow-sm
            border border-slate-200
            text-sm font-semibold
            transition-colors
            ${menuOpen ? 'text-[#2563EB] border-blue-300 bg-blue-50' : 'text-[#0F172A] hover:bg-slate-50'}
          `}
        >
          <Menu className="h-4 w-4 text-[#2563EB]" />
          Menu Principal
          <ChevronDown className={`h-4 w-4 text-[#64748B] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <div
            className="
              absolute left-0 top-full mt-2 z-50
              w-64 bg-white rounded-2xl shadow-xl
              border border-slate-200 p-2
              animate-in fade-in slide-in-from-top-2 duration-150
            "
            onMouseEnter={openMenu}
            onMouseLeave={closeMenu}
          >
            {financeMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-xl
                    text-sm font-medium transition-colors
                    ${isActive ? `${item.bgColor} ${item.color}` : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <span className={`p-1.5 rounded-lg ${item.bgColor}`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainMenuButton;
