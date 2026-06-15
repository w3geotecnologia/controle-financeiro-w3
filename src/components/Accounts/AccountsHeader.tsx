import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calculator } from 'lucide-react';
import { FloatingCalculator } from './FloatingCalculator';

interface AccountsHeaderProps {
  onNewAccount: () => void;
}

export const AccountsHeader: React.FC<AccountsHeaderProps> = ({ onNewAccount }) => {
  const navigate = useNavigate();
  const [calcOpen, setCalcOpen] = useState(false);

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
          className="gap-2 bg-gradient-to-r from-sky-300 via-sky-400 to-blue-500 hover:from-sky-400 hover:to-blue-600 text-white shadow"
        >
          <FileText size={16} />
          Relatórios
        </Button>

        <Button
          onClick={() => setCalcOpen(true)}
          className="gap-2 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-600 hover:from-slate-400 hover:to-slate-700 text-white shadow border border-slate-300"
        >
          <Calculator size={16} />
          Calculadora
        </Button>

        <Button
          onClick={onNewAccount}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus size={16} />
          Nova Conta
        </Button>
      </div>

      <FloatingCalculator isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </div>
  );
};
