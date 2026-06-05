import React from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface ReportsSummaryCardsMobileProps {
  previousBalance: number;
  totalReceitas: number;
  totalDespesas: number;
  saldoFinal: number;
}

export const ReportsSummaryCardsMobile: React.FC<ReportsSummaryCardsMobileProps> = ({
  previousBalance,
  totalReceitas,
  totalDespesas,
  saldoFinal
}) => {
  return (
    <div className="space-y-2">
      {/* Saldo Anterior */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <Wallet className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-xs text-slate-600">Saldo Anterior</span>
        </div>
        <span className={`text-sm font-bold ${previousBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
          {formatCurrency(previousBalance)}
        </span>
      </div>

      {/* Total Recebido */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-100 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <span className="text-xs text-slate-600">Total Recebido</span>
        </div>
        <span className="text-sm font-bold text-green-600">
          {formatCurrency(totalReceitas)}
        </span>
      </div>

      {/* Total Pago */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-100 rounded-lg">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
          <span className="text-xs text-slate-600">Total Pago</span>
        </div>
        <span className="text-sm font-bold text-red-600">
          {formatCurrency(totalDespesas)}
        </span>
      </div>

      {/* Saldo Final */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <DollarSign className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-xs text-slate-600">Saldo Final</span>
        </div>
        <span className={`text-sm font-bold ${saldoFinal >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {formatCurrency(saldoFinal)}
        </span>
      </div>
    </div>
  );
};
