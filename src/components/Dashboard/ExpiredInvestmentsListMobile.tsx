import React from 'react';
import { Archive, Calendar, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';

interface ExpiredInvestment {
  id: number;
  name: string;
  invested_amount: number;
  current_value: number;
  maturity_date?: string | null;
  purchase_date: string;
  investor_name?: string | null;
  moved_at?: string | null;
}

interface ExpiredInvestmentsListMobileProps {
  investments: ExpiredInvestment[];
  onDelete: (id: number) => void;
}

export const ExpiredInvestmentsListMobile: React.FC<ExpiredInvestmentsListMobileProps> = ({
  investments,
  onDelete
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
      return '-';
    }
  };

  if (investments.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Archive className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="font-medium">Nenhum investimento vencido</p>
        <p className="text-sm">Os investimentos aparecerão aqui após o vencimento.</p>
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

        return (
          <div
            key={investment.id}
            className="bg-white border border-orange-200 rounded-lg p-3 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Archive size={16} className="text-orange-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-slate-800 truncate">
                    {investment.name}
                  </h4>
                  {investment.investor_name && (
                    <p className="text-xs text-slate-500 truncate">{investment.investor_name}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(investment.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 flex-shrink-0"
              >
                <Trash2 size={16} />
              </Button>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <span className="text-slate-500">Investido:</span>
                <span className="font-medium text-slate-700 ml-1">{formatCurrency(invested)}</span>
              </div>
              <div>
                <span className="text-slate-500">Valor Final:</span>
                <span className="font-medium text-slate-700 ml-1">{formatCurrency(current)}</span>
              </div>
            </div>

            {/* Rendimento */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Rendimento:</span>
              <Badge 
                className={`text-[10px] px-1.5 py-0.5 ${
                  isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isPositive ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                {isPositive ? '+' : ''}{formatCurrency(gain)} ({gainPercentage.toFixed(1)}%)
              </Badge>
            </div>

            {/* Footer - Dates */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Venc: {formatDate(investment.maturity_date)}</span>
              </div>
              <span>Movido: {formatDate(investment.moved_at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
