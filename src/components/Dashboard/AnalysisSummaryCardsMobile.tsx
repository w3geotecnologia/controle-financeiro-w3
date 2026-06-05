import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface AnalysisSummaryCardsMobileProps {
  receitas: number;
  despesas: number;
  saldo: number;
}

export const AnalysisSummaryCardsMobile: React.FC<AnalysisSummaryCardsMobileProps> = ({ 
  receitas,
  despesas,
  saldo
}) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-3">
      {/* Total de Receitas */}
      <div className="bg-card border rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Total de Receitas</p>
            <p className="text-sm font-bold text-green-600">
              {formatCurrency(receitas)}
            </p>
          </div>
        </div>
      </div>

      {/* Total de Despesas */}
      <div className="bg-card border rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
            <TrendingDown size={18} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Total de Despesas</p>
            <p className="text-sm font-bold text-red-600">
              {formatCurrency(despesas)}
            </p>
          </div>
        </div>
      </div>

      {/* Saldo */}
      <div className="bg-card border rounded-lg p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 ${saldo >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-lg flex-shrink-0`}>
            <DollarSign size={18} className={saldo >= 0 ? 'text-blue-600' : 'text-orange-600'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className={`text-sm font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(saldo)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
