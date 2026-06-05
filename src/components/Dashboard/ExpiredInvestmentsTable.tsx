
import React from 'react';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Investment } from '@/hooks/useInvestmentsData';

interface ExpiredInvestmentsTableProps {
  expiredInvestments: Investment[];
  onMoveToExpired: (id: number) => void;
}

export const ExpiredInvestmentsTable: React.FC<ExpiredInvestmentsTableProps> = ({
  expiredInvestments,
  onMoveToExpired
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

  if (expiredInvestments.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 shadow-md mb-6">
      <div className="bg-white rounded-lg p-4 mb-5">
        <h3 className="text-xl font-bold text-black">
          ⚠️ {expiredInvestments.length} Aplicações Vencidas
        </h3>
        <p className="text-sm text-black font-medium">
          Aplicações que já atingiram sua data de vencimento
        </p>
      </div>
      
      <div className="bg-white border-2 border-red-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-yellow-400 border-b-2 border-red-300">
              <tr>
                <th className="text-left py-2 px-4 font-bold text-black border-r border-red-300">Status</th>
                <th className="text-left py-2 px-4 font-bold text-black border-r border-red-300">Investidor</th>
                <th className="text-left py-2 px-4 font-bold text-black border-r border-red-300">Investimento</th>
                <th className="text-left py-2 px-4 font-bold text-black border-r border-red-300">Instituição</th>
                <th className="text-right py-2 px-4 font-bold text-black border-r border-red-300">Valor Atual</th>
                <th className="text-right py-2 px-4 font-bold text-black border-r border-red-300">Data Vencimento</th>
                <th className="text-center py-2 px-4 font-bold text-black">Ação</th>
              </tr>
            </thead>
            <tbody>
              {expiredInvestments.map((investment, index) => (
                <tr key={investment.id} className={`border-b border-red-200 hover:bg-red-25 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-red-25'}`}>
                  <td className="py-1 px-4 border-r border-red-200">
                    <Badge className="bg-red-500 text-white text-xs font-bold px-2 py-1">
                      ⚠️ VENCIDA
                    </Badge>
                  </td>
                  <td className="py-1 px-4 border-r border-red-200">
                    <span className="font-medium text-slate-800">
                      {investment.investor_name || 'Sem investidor'}
                    </span>
                  </td>
                  <td className="py-1 px-4 border-r border-red-200">
                    <span className="font-medium text-slate-800">{investment.name}</span>
                  </td>
                  <td className="py-1 px-4 border-r border-red-200">
                    <span className="text-slate-700">{investment.institution?.name}</span>
                  </td>
                  <td className="text-right py-1 px-4 border-r border-red-200">
                    <span className="font-bold text-slate-800">
                      {formatCurrency(Number(investment.current_value))}
                    </span>
                  </td>
                  <td className="text-right py-1 px-4 border-r border-red-200">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-red-700 bg-red-100 px-2 py-1 rounded text-sm">
                        {formatDate(investment.maturity_date)}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-1 px-4">
                    <Button
                      onClick={() => onMoveToExpired(investment.id)}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
                    >
                      <Archive size={12} className="mr-1" />
                      Arquivar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
