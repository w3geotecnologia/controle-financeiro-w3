
import React from 'react';
import { Calendar, Building2 } from 'lucide-react';
import { useBanksData } from '@/hooks/useBanksData';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const RecentTransactions: React.FC = () => {
  const { banks, isLoading } = useBanksData();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Saldo dos Bancos</h3>
        <div className="flex items-center justify-center py-8">
          <span className="text-sm text-slate-500">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-lg border border-slate-200">
      <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-4">Saldo dos Bancos</h3>
      <div className="space-y-2 sm:space-y-4">
        {banks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">Nenhum banco cadastrado</p>
          </div>
        ) : (
          banks.map((bank) => (
            <div key={bank.id} className="flex items-center gap-2 p-2 sm:p-3 hover:bg-slate-50 rounded-xl transition-colors">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 flex-shrink-0">
                <Building2 size={14} className="text-blue-600 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800 text-sm sm:text-base truncate">{bank.name}</p>
                <p className="text-xs sm:text-sm text-slate-500 truncate">
                  {bank.nickname || `${bank.account_type} - ${bank.account_number}`}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-semibold text-sm sm:text-base ${bank.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(bank.balance || 0)}
                </p>
                <span className="text-xs text-slate-500 flex items-center gap-0.5 justify-end mt-0.5">
                  <Calendar size={10} className="sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">{format(new Date(bank.updated_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                  <span className="sm:hidden">{format(new Date(bank.updated_at), 'dd/MM', { locale: ptBR })}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
