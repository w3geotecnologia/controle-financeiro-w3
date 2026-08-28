import React, { useMemo } from 'react';
import { Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBanksData } from '@/hooks/useBanksData';
import { formatCurrency } from '@/utils/formatters';

export const BankBalancesCard: React.FC = () => {
  const { banks, isLoading } = useBanksData();
  const navigate = useNavigate();

  const total = useMemo(
    () => banks.reduce((acc, bank) => acc + Number(bank.balance || 0), 0),
    [banks]
  );

  const sortedBanks = useMemo(
    () => [...banks].sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0)),
    [banks]
  );

  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 flex flex-col"
      style={{ height: '420px' }}
    >
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
          Saldo por banco
        </h3>
        <button
          onClick={() => navigate('/bancos')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver todos
        </button>
      </div>

      <div
        className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}
      >
        {isLoading && (
          <p className="text-sm text-slate-400 py-6 text-center">Carregando...</p>
        )}

        {!isLoading && banks.length === 0 && (
          <p className="text-sm text-slate-400 py-6 text-center">Nenhum banco cadastrado.</p>
        )}

        {!isLoading && sortedBanks.length > 0 && (
          <div className="divide-y divide-slate-100">
            {sortedBanks.map((bank) => (
              <div key={bank.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <BankLogo logoUrl={bank.logo_url} className="h-8 w-8 rounded-full" iconClassName="h-4 w-4 text-slate-700" />
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {bank.nickname || bank.name}
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-800 shrink-0">
                  {formatCurrency(Number(bank.balance || 0))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
        <span className="text-sm font-bold text-slate-800">Total</span>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
