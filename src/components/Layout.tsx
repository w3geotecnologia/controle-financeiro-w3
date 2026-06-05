
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const collapsiblePages = [
    '/contas',
    '/categorias', 
    '/relatorios',
    '/analise',
    '/bancos',
    '/cartoes-credito',
    '/card-accounts',
    '/investimentos',
    '/investimentos-vencidos'
  ];
  
  const isCollapsiblePage = collapsiblePages.includes(location.pathname);

  useEffect(() => {
    if (!isCollapsiblePage) {
      setSidebarCollapsed(false);
    }
  }, [isCollapsiblePage]);

  const handleMainContentHover = () => {
    if (isCollapsiblePage) {
      setSidebarCollapsed(true);
    }
  };

  const handleSidebarHover = () => {
    if (isCollapsiblePage) {
      setSidebarCollapsed(false);
    }
  };

  if (isCollapsiblePage) {
    return (
      <SidebarProvider open={!sidebarCollapsed} onOpenChange={(open) => setSidebarCollapsed(!open)}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex">
          {/* Desktop Sidebar */}
        <div className="hidden md:block" onMouseEnter={handleSidebarHover}>
          <AppSidebar />
        </div>

          <div className="flex-1 flex flex-col">
            <Header />
            <main 
              className="flex-1 p-3 sm:p-6"
              onMouseEnter={handleMainContentHover}
            >
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-3 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
