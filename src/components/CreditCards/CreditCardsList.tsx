
import React from 'react';
import { CreditCardItemNew } from './CreditCardItemNew';
import { CreditCardData } from '@/hooks/useCreditCardsData';

interface CreditCardsListProps {
  cards: CreditCardData[];
  onEdit: (card: CreditCardData) => void;
  onDelete: (id: number) => void;
}

export const CreditCardsList: React.FC<CreditCardsListProps> = ({
  cards,
  onEdit,
  onDelete
}) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-gray-600 mb-4">Nenhum cartão encontrado</div>
        <p className="text-gray-500">Comece adicionando seu primeiro cartão de crédito.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card) => (
        <CreditCardItemNew
          key={card.id}
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
