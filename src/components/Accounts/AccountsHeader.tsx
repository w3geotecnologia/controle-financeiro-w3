
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
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 flex justify-start gap-3">
          <Button
            onClick={onNewAccount}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 px-4 py-2"
          >
            <Plus size={20} className="mr-2" />
            Nova Conta
          </Button>
          
          <Button
            onClick={() => navigate('/relatorios')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 px-4 py-2"
          >
            <FileText size={20} className="mr-2" />
            Relatórios
          </Button>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Contas</h1>
          <p className="text-slate-600">Gerencie suas contas a pagar e receber</p>
        </div>
        
        <div className="flex-1"></div>
      </div>
    </div>
  );
};
