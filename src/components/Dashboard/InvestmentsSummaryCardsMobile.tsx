import React from 'react';
import { Investment } from '@/hooks/useInvestmentsData';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentsSummaryCardsMobileProps {
  investments: Investment[];
}

export const InvestmentsSummaryCardsMobile: React.FC<InvestmentsSummaryCardsMobileProps> = ({
  investments
}) => {
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.invested_amount), 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  // Soma dos rendimentos individuais (current_value - invested_amount) de cada investimento
  const totalRendimentos = investments.reduce((sum, inv) => {
    const gain = Number(inv.current_value) - Number(inv.invested_amount);
    return sum + gain;
  }, 0);

  return (
    <div className="flex flex-col gap-2">
      {/* Total Investido */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        <span className="text-xs font-medium text-slate-600">Total Investido</span>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(totalInvested)}</span>
      </div>

      {/* Valor Atual */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <span className="text-xs font-medium text-slate-600">Valor Atual</span>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(totalCurrent)}</span>
      </div>

      {/* Rendimentos */}
      <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${
        totalRendimentos >= 0 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <span className="text-xs font-medium text-slate-600">Rendimentos</span>
        <span className={`text-sm font-bold ${totalRendimentos >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {formatCurrency(totalRendimentos)}
        </span>
      </div>

      {/* Rentabilidade */}
      <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${
        gainPercentage >= 0 
          ? 'bg-emerald-50 border border-emerald-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <span className="text-xs font-medium text-slate-600">Rentabilidade</span>
        <span className={`text-sm font-bold ${gainPercentage >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {gainPercentage.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};
