import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackToDashboardButtonProps {
  className?: string;
}

/**
 * Botão fixo no topo das páginas internas para voltar ao Painel Financeiro.
 */
export const BackToDashboardButton: React.FC<BackToDashboardButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Não exibir quando já estiver no painel financeiro
  if (location.pathname === '/' || location.pathname === '/dashboard') {
    return null;
  }

  return (
    <div className={`flex justify-start mb-2 ${className}`}>
      <Button
        onClick={() => navigate('/')}
        variant="outline"
        size="sm"
        className="gap-2 bg-white/80 backdrop-blur border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 shadow-sm"
      >
        <ArrowLeft size={16} />
        Voltar ao Painel Financeiro
      </Button>
    </div>
  );
};
