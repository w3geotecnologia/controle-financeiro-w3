import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatters';
import { useCreditCardsData } from '@/hooks/useCreditCardsData';
import { useCardAccounts } from '@/hooks/useCardAccounts';
import { CardBrandIcon } from '@/components/CreditCards/CardBrandIcons';

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
    <section className="rounded-lg bg-card border border-border shadow-sm p-4 h-full flex flex-col min-h-[340px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-foreground">Cartões de crédito</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Faturas e limites</p>
        </div>
        <button onClick={() => navigate('/cartoes-credito')} className="text-xs font-medium text-brand hover:underline">
          Ver todos
        </button>
      </div>

      <div className="mt-2 divide-y divide-border flex-1">
        {cards.length === 0 && (
          <p className="text-sm text-muted-foreground py-3">Nenhum cartão cadastrado.</p>
        )}
        {cards.map((card) => {
          const fatura = faturaByCard.get(card.id) ?? Math.abs(card.current_value || 0);
          const limite = card.credit_limit || 0;
          const usado = limite > 0 ? Math.min((fatura / limite) * 100, 100) : 0;
          return (
            <div key={card.id} className="py-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <CardBrandIcon brand={card.card_brand} className="w-10 h-7 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-foreground">{card.card_name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">Fatura atual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground tabular-nums">{formatCurrency(fatura)}</p>
                  {card.due_date && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Vence dia {card.due_date}</p>
                  )}
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-2.5 flex-1 rounded-sm bg-muted overflow-hidden ring-1 ring-inset ring-border">
                  <div
                    className={`h-full rounded-sm transition-[width] duration-500 ${usado >= 80 ? 'bg-danger' : usado >= 55 ? 'bg-warning' : 'bg-brand'}`}
                    style={{ width: `${usado}%` }}
                  />
                </div>
                <span className={`w-9 text-right text-[11px] font-bold tabular-nums ${usado >= 80 ? 'text-danger' : 'text-brand'}`}>
                  {usado.toFixed(0)}%
                </span>
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>Limite utilizado</span>
                <span>{formatCurrency(limite)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
