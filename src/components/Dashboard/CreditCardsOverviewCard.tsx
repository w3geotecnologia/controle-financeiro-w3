import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreditCardsData } from '@/hooks/useCreditCardsData';
import { CardBrandIcon } from '@/components/CreditCards/CardBrandIcons';
import { formatCurrency } from '@/utils/formatters';

const VISIBLE_LIMIT = 2;

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

  const visibleCards = creditCards.slice(0, VISIBLE_LIMIT);
  const extraCards = creditCards.slice(VISIBLE_LIMIT);
  const hiddenCount = extraCards.length;

  const renderCard = (card: (typeof creditCards)[number]) => {
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
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-200 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">Cartões</h3>
        <button
          onClick={() => navigate('/cartoes-credito')}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver todos
        </button>
      </div>

      <div className="mt-4 flex-1 flex flex-col min-h-0">
        {isLoading && <p className="text-sm text-slate-400 py-6 text-center">Carregando...</p>}

        {!isLoading && creditCards.length === 0 && (
          <p className="text-sm text-slate-400 py-6 text-center">Nenhum cartão cadastrado.</p>
        )}

        {!isLoading && creditCards.length > 0 && (
          <>
            {/* Fixed first 2 cards — always visible */}
            <div className="space-y-3">
              {visibleCards.map(renderCard)}
            </div>

            {/* Scrollable extra cards */}
            {hiddenCount > 0 && (
              <div className="mt-3 overflow-y-auto max-h-[280px] space-y-3 pr-1
                scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb]:bg-slate-200
                [&::-webkit-scrollbar-track]:bg-transparent">
                {extraCards.map(renderCard)}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">Total disponível</span>
        <span className="text-sm font-bold text-green-600">{formatCurrency(totalAvailable)}</span>
      </div>
    </div>
  );
};
