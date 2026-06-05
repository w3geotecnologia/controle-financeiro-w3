import React from 'react';
import { Archive, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface ExpiredInvestment {
  id: number;
  name: string;
  invested_amount: number;
  current_value: number;
  maturity_date?: string | null;
}

interface ExpiredInvestmentsSummaryCardsMobileProps {
  investments: ExpiredInvestment[];
}

export const ExpiredInvestmentsSummaryCardsMobile: React.FC<ExpiredInvestmentsSummaryCardsMobileProps> = ({
  investments
}) => {
  const totalValue = investments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch {
      return '-';
    }
  };

  const lastMaturityDate = investments.length > 0 
    ? investments.sort((a, b) => new Date(b.maturity_date || '').getTime() - new Date(a.maturity_date || '').getTime())[0]?.maturity_date
    : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Total de Investimentos */}
      <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <Archive size={16} className="text-orange-600" />
          <span className="text-xs font-medium text-slate-600">Total Vencidos</span>
        </div>
        <span className="text-sm font-bold text-slate-800">{investments.length}</span>
      </div>

      {/* Valor Total Resgatado */}
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-600" />
          <span className="text-xs font-medium text-slate-600">Valor Total</span>
        </div>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(totalValue)}</span>
      </div>

      {/* Último Vencimento */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-600" />
          <span className="text-xs font-medium text-slate-600">Último Vencimento</span>
        </div>
        <span className="text-sm font-bold text-slate-800">{formatDate(lastMaturityDate)}</span>
      </div>
    </div>
  );
};
