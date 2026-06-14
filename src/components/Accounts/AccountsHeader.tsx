import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

interface AccountsHeaderProps {
  onNewAccount: () => void;
}

export const AccountsHeader: React.FC<AccountsHeaderProps> = ({ onNewAccount }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Contas</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerencie suas contas a pagar e receber</p>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-3">
        <Button
          onClick={() => navigate('/relatorios')}
          variant="outline"
          className="gap-2"
        >
          <FileText size={16} />
          Relatórios
        </Button>

        <Button
          onClick={onNewAccount}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} />
          Nova Conta
        </Button>
      </div>
    </div>
  );
};
