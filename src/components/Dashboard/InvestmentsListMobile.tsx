import React from 'react';
import { Building2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Investment } from '@/hooks/useInvestmentsData';
import { formatCurrency } from '@/utils/formatters';

interface InvestmentsListMobileProps {
  investments: Investment[];
  onEdit: (investment: Investment) => void;
}

export const InvestmentsListMobile: React.FC<InvestmentsListMobileProps> = ({
  investments,
  onEdit
}) => {
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
      return dateString;
    }
  };

  const isExpired = (maturityDate: string | null) => {
    if (!maturityDate) return false;
    try {
      const date = new Date(maturityDate + 'T00:00:00');
      return date <= new Date();
    } catch {
      return false;
    }
  };

  if (investments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>Nenhum investimento encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {investments.map((investment) => {
        const invested = Number(investment.invested_amount);
        const current = Number(investment.current_value);
        const gain = current - invested;
        const gainPercentage = invested > 0 ? (gain / invested) * 100 : 0;
        const isPositive = gain >= 0;
        const expired = isExpired(investment.maturity_date);

        return (
          <div
            key={investment.id}
            onClick={() => onEdit(investment)}
            className={`bg-white border rounded-lg p-3 shadow-sm active:bg-slate-50 cursor-pointer ${
              expired ? 'border-red-300 bg-red-50' : 'border-slate-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-slate-800 truncate">
                  {investment.name}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Building2 size={12} />
                  <span className="truncate">{investment.institution?.name}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                {expired && (
                  <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                    VENCIDA
                  </Badge>
                )}
                <Badge 
                  className={`text-[10px] px-1.5 py-0.5 ${
                    isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isPositive ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                  {gainPercentage.toFixed(1)}%
                </Badge>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Investido:</span>
                <span className="font-medium text-slate-700 ml-1">{formatCurrency(invested)}</span>
              </div>
              <div>
                <span className="text-slate-500">Atual:</span>
                <span className="font-medium text-slate-700 ml-1">{formatCurrency(current)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <Calendar size={12} />
                <span>Venc: {formatDate(investment.maturity_date)}</span>
              </div>
              {investment.investor_name && (
                <span className="text-slate-500 truncate max-w-[100px]">
                  {investment.investor_name}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
