import React, { useMemo } from 'react';
import { Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBanksData } from '@/hooks/useBanksData';
import { formatCurrency } from '@/utils/formatters';

// Number of rows that fit before the list starts scrolling internally.
const VISIBLE_LIMIT = 5;
const ROW_HEIGHT_PX = 52; // approx height of one bank row incl. divider

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

  const isScrollable = sortedBanks.length > VISIBLE_LIMIT;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 flex flex-col h-full">
      <div className="flex items-center justify-between">
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
        className="mt-4 flex-1 divide-y divide-slate-100 overflow-y-auto scroll-smooth pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full"
        style={isScrollable ? { maxHeight: `${VISIBLE_LIMIT * ROW_HEIGHT_PX}px` } : undefined}
      >
        {isLoading && <p className="text-sm text-slate-400 py-6 text-center">Carregando...</p>}

        {!isLoading && banks.length === 0 && (
          <p className="text-sm text-slate-400 py-6 text-center">Nenhum banco cadastrado.</p>
        )}

        {sortedBanks.map((bank) => (
          <div key={bank.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: bank.color || '#e2e8f0' }}
              >
                <Landmark className="h-4 w-4 text-slate-700" />
              </div>
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

      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">Total</span>
        <span className="text-sm font-bold text-slate-800">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
