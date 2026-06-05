
import React from 'react';
import { AlertTriangle, Calendar, Building2, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Investment } from '@/hooks/useInvestmentsData';

interface ExpiredInvestmentCardsProps {
  expiredInvestments: Investment[];
}

export const ExpiredInvestmentCards: React.FC<ExpiredInvestmentCardsProps> = ({
  expiredInvestments
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Agrupa investimentos idênticos por nome, instituição e vencimento
  const groupedInvestments = expiredInvestments.reduce((groups, investment) => {
    const key = `${investment.name}-${investment.institution?.name}-${investment.maturity_date}`;
    if (!groups[key]) {
      groups[key] = {
        ...investment,
        investors: []
      };
    }
    groups[key].investors.push({
      name: investment.investor_name || 'Sem investidor',
      invested_amount: investment.invested_amount,
      current_value: investment.current_value
    });
    return groups;
  }, {} as any);

  const groupedArray = Object.values(groupedInvestments);

  if (expiredInvestments.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 shadow-md mb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-red-100 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-red-800">
            ⚠️ {expiredInvestments.length} Aplicações Vencidas
          </h3>
          <p className="text-sm text-red-700 font-medium">
            Aplicações que já atingiram sua data de vencimento
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groupedArray.map((group: any, index: number) => {
          const totalInvested = group.investors.reduce((sum: number, inv: any) => sum + Number(inv.invested_amount), 0);
          const totalCurrent = group.investors.reduce((sum: number, inv: any) => sum + Number(inv.current_value), 0);
          const gain = totalCurrent - totalInvested;
          const gainPercentage = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;
          const isPositive = gain >= 0;
          
          return (
            <div key={index} className="bg-white border-2 border-red-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow min-h-[200px] flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1" title={group.name}>
                    {group.name.length > 25 ? `${group.name.substring(0, 25)}...` : group.name}
                  </h4>
                </div>
                <Badge className="bg-red-500 text-white text-xs font-bold flex-shrink-0 ml-2 px-2 py-1">
                  VENCIDA
                </Badge>
              </div>
              
              <div className="space-y-2 text-xs mb-3">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-500 flex-shrink-0" />
                  <span className="text-slate-700 font-medium truncate">{group.institution?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-red-700 font-bold bg-red-100 px-2 py-1 rounded">
                    {formatDate(group.maturity_date)}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <div className="text-xs text-slate-600 mb-1">Investidores ({group.investors.length})</div>
                  <div className="space-y-1 max-h-16 overflow-y-auto">
                    {group.investors.slice(0, 2).map((investor: any, invIndex: number) => (
                      <div key={invIndex} className="text-xs text-slate-700 font-medium">
                        • {investor.name}
                      </div>
                    ))}
                    {group.investors.length > 2 && (
                      <div className="text-xs text-blue-600 font-medium">
                        + {group.investors.length - 2} outros
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500">Valor Total</p>
                    <p className="font-bold text-sm text-slate-800">{formatCurrency(totalCurrent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Rendimento</p>
                    <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      <span>{gainPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
