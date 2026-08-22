import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import { useCreditCardsData } from '@/hooks/useCreditCardsData';
import { useCardAccounts } from '@/hooks/useCardAccounts';

export const CardsOverview: React.FC = () => {
  const navigate = useNavigate();
  const { creditCards } = useCreditCardsData();
  const { cardAccounts } = useCardAccounts();

  const faturaByCard = new Map<number, number>();
  (cardAccounts || []).forEach((ca) => {
    if (ca.status?.toLowerCase() === 'pendente' && ca.type === 'despesa') {
      faturaByCard.set(ca.card_id, (faturaByCard.get(ca.card_id) || 0) + Math.abs(ca.amount || 0));
    }
  });

  const cards = (creditCards || []).slice(0, 4);

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">Cartões</h2>
        <button onClick={() => navigate('/cartoes-credito')} className="text-xs font-medium text-brand hover:underline">
          Ver todos
        </button>
      </div>

      <div className="mt-3 divide-y divide-border flex-1">
        {cards.length === 0 && (
          <p className="text-sm text-muted-foreground py-3">Nenhum cartão cadastrado.</p>
        )}
        {cards.map((card) => {
          const fatura = faturaByCard.get(card.id) ?? Math.abs(card.current_value || 0);
          const limite = card.credit_limit || 0;
          const usado = limite > 0 ? Math.min((fatura / limite) * 100, 100) : 0;
          return (
            <div key={card.id} className="py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{card.card_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Fatura atual</p>
                  <p className="text-base font-bold text-foreground tabular-nums">{formatCurrency(fatura)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {card.card_brand}
                  </span>
                  {card.due_date && (
                    <p className="text-xs text-muted-foreground mt-1">Vencimento {card.due_date}</p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${usado >= 80 ? 'bg-danger' : 'bg-brand'}`}
                    style={{ width: `${usado}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold tabular-nums ${usado >= 80 ? 'text-danger' : 'text-brand'}`}>
                  {usado.toFixed(0)}%
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Limite utilizado</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
