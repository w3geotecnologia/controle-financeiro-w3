
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Investment, InvestmentInstitution, InvestmentType } from '@/hooks/useInvestmentsData';
import { Edit, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface InvestmentTableProps {
  investments: Investment[];
  institutions: InvestmentInstitution[];
  investmentTypes: InvestmentType[];
  onEdit: (investment: Investment) => void;
  onDelete: (id: number) => void;
}

export const InvestmentTable: React.FC<InvestmentTableProps> = ({
  investments,
  institutions,
  investmentTypes,
  onEdit,
  onDelete
}) => {
  const calculateReturn = (invested: number, current: number) => {
    return ((current - invested) / invested) * 100;
  };

  const calculateReturnValue = (invested: number, current: number) => {
    return current - invested;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    
    try {
      // Cria a data como local para evitar problemas de timezone
      const date = new Date(dateString + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }
    
    return '-';
  };

  const isExpired = (maturityDate: string | null | undefined) => {
    if (!maturityDate) return false;
    
    try {
      // Cria a data como local para evitar problemas de timezone
      const date = new Date(maturityDate + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        return date <= new Date();
      }
    } catch (error) {
      console.error('Error checking expiry date:', error);
    }
    
    return false;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200">
              <TableHead className="py-3 px-4 font-semibold text-slate-700">Investidor</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-slate-700">Investimento</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-slate-700">Instituição</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-slate-700">Tipo</TableHead>
              <TableHead className="text-right py-3 px-4 font-semibold text-slate-700">Investido</TableHead>
              <TableHead className="text-right py-3 px-4 font-semibold text-slate-700">Valor Atual</TableHead>
              <TableHead className="text-right py-3 px-4 font-semibold text-slate-700">Rendimento</TableHead>
              <TableHead className="text-right py-3 px-4 font-semibold text-slate-700">Rentabilidade</TableHead>
              <TableHead className="text-right py-3 px-4 font-semibold text-slate-700">Compra</TableHead>
              <TableHead className="text-right py-3 px-4 font-semibold text-slate-700">Vencimento</TableHead>
              <TableHead className="py-3 px-4 font-semibold text-slate-700"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((investment, index) => {
              const investedAmount = Number(investment.invested_amount);
              const currentValue = Number(investment.current_value);
              const returnPercentage = calculateReturn(investedAmount, currentValue);
              const returnValue = calculateReturnValue(investedAmount, currentValue);
              const isPositive = returnPercentage >= 0;
              const expired = isExpired(investment.maturity_date);
              
              return (
                <TableRow key={investment.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'} ${expired ? 'bg-orange-50' : ''}`}>
                  <TableCell className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      {expired && <AlertTriangle size={16} className="text-orange-500" />}
                      <span className="font-medium text-slate-800">{investment.investor_name || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-4 font-medium text-slate-800">{investment.name}</TableCell>
                  <TableCell className="py-2 px-4 text-slate-800">{investment.institution?.name}</TableCell>
                  <TableCell className="py-2 px-4">
                    <span className="text-sm text-slate-600">
                      {investment.type?.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-2 px-4 font-semibold text-slate-800">{formatCurrency(investedAmount)}</TableCell>
                  <TableCell className="text-right py-2 px-4 font-semibold text-slate-800">{formatCurrency(currentValue)}</TableCell>
                  <TableCell className="text-right py-2 px-4">
                    <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(returnValue))}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-2 px-4">
                    <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="font-medium">
                        {returnPercentage.toFixed(2)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2 px-4 text-sm text-slate-600">
                    {formatDate(investment.purchase_date)}
                  </TableCell>
                  <TableCell className="text-right py-2 px-4 text-sm text-slate-600">
                    <div className="flex items-center justify-end gap-1">
                      {expired && <AlertTriangle size={14} className="text-orange-500" />}
                      {formatDate(investment.maturity_date)}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 px-4">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(investment)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(investment.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {investments.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          Nenhum investimento cadastrado ainda.
        </div>
      )}
    </div>
  );
};
