import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreditCardsData } from '@/hooks/useCreditCardsData';
import { CardBrandIcon } from '@/components/CreditCards/CardBrandIcons';
import { formatCurrency } from '@/utils/formatters';

const formatDueDay = (dueDate?: string) => {
  if (!dueDate) return null;
  const iso = dueDate.split('T')[0];
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  const day = Number(dueDate);
  return Number.isFinite(day) && day > 0 ? `Dia ${day}` : null;
};

export const CreditCardsOverviewCard: React.FC = () => {
  const { creditCards, isLoading } = useCreditCardsData();
  const navigate = useNavigate();

  const totalAvailable = useMemo(
    () =>
      creditCards.reduce(
        (acc, card) =>
          acc + (Number(card.credit_limit || 0) - Number(card.current_value || 0)),
        0
      ),
    [creditCards]
  );

  return (
    <div
      className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 flex flex-col"
      style={{ height: '420px' }}
    >
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Cartões</h3>
        <button
          onClick={() => navigate('/cartoes-credito')}
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

        {!isLoading && creditCards.length === 0 && (
          <p className="text-sm text-slate-400 py-6 text-center">Nenhum cartão cadastrado.</p>
        )}

        {!isLoading && creditCards.length > 0 && (
          <div className="space-y-3">
            {creditCards.map((card) => {
              const limit = Number(card.credit_limit || 0);
              const used = Number(card.current_value || 0);
              const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
              const due = formatDueDay(card.due_date);

              return (
                <div
                  key={card.id}
                  className="rounded-xl border border-slate-200 p-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {card.card_name}
                    </span>
                    <CardBrandIcon brand={card.card_brand} className="w-10 h-6" />
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-500">Fatura atual</p>
                      <p className="text-base font-bold text-slate-800">
                        {formatCurrency(used)}
                      </p>
                    </div>
                    {due && (
                      <p className="text-xs text-slate-500 whitespace-nowrap">Vencimento {due}</p>
                    )}
                  </div>

                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${percent >= 80 ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Limite utilizado</span>
                    <span className="text-xs font-semibold text-blue-600">
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
        <span className="text-sm font-bold text-slate-800">Total disponível</span>
        <span className="text-sm font-bold text-green-600">{formatCurrency(totalAvailable)}</span>
      </div>
    </div>
  );
};
