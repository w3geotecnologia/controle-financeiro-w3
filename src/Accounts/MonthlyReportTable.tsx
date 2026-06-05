import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/formatters';

interface MonthlyData {
  month: string;
  saldoAnterior: number;
  totalRecebido: number;
  totalPago: number;
  saldoFinal: number;
}

interface MonthlyReportTableProps {
  monthlyData: MonthlyData[];
  totalReceived: number;
  totalPaid: number;
  finalBalance: number;
  currentYear: number;
  onYearChange: (year: number) => void;
}

export const MonthlyReportTable: React.FC<MonthlyReportTableProps> = ({
  monthlyData,
  totalReceived,
  totalPaid,
  finalBalance,
  currentYear,
  onYearChange
}) => {
  const navigateYear = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? currentYear - 1 : currentYear + 1;
    onYearChange(newYear);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateYear('prev')}
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronLeft size={16} />
        </Button>

        <h2 className="text-xl font-semibold text-slate-800">
          Relatório dos Últimos 12 Meses - {currentYear}
        </h2>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateYear('next')}
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <div className="border border-slate-300 rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300">
                <th className="text-left font-semibold text-slate-700 px-4 py-2 border-r border-slate-300 text-sm">Mês</th>
                <th className="text-left font-semibold text-green-600 px-4 py-2 border-r border-slate-300 text-sm">Total Recebido</th>
                <th className="text-left font-semibold text-red-600 px-4 py-2 border-r border-slate-300 text-sm">Total Pago</th>
                <th className="text-left font-semibold text-slate-700 px-4 py-2 text-sm">Saldo Final</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr key={index} className="hover:bg-slate-50 border-b border-slate-200">
                  <td className="font-medium text-slate-700 px-4 py-1.5 border-r border-slate-200 text-sm">{data.month}</td>
                  <td className="text-left text-green-600 font-medium px-4 py-1.5 border-r border-slate-200 text-sm">
                    {formatCurrency(data.totalRecebido)}
                  </td>
                  <td className="text-left text-red-600 font-medium px-4 py-1.5 border-r border-slate-200 text-sm">
                    {formatCurrency(data.totalPago)}
                  </td>
                  <td className={`text-left font-semibold px-4 py-1.5 text-sm ${
                    data.saldoFinal >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(data.saldoFinal)}
                  </td>
                </tr>
              ))}
              
              {/* Linha de totais */}
              <tr className="border-t-2 border-slate-400 bg-slate-100">
                <td className="font-bold text-slate-800 px-4 py-2 border-r border-slate-300 text-sm">TOTAIS GERAIS</td>
                <td className="text-left text-green-600 font-bold px-4 py-2 border-r border-slate-300 text-sm">
                  {formatCurrency(totalReceived)}
                </td>
                <td className="text-left text-red-600 font-bold px-4 py-2 border-r border-slate-300 text-sm">
                  {formatCurrency(totalPaid)}
                </td>
                <td className={`text-left font-bold px-4 py-2 text-sm ${
                  finalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(finalBalance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
