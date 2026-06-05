
import React from 'react';
import { CreditCard } from 'lucide-react';
import { CreditCardData } from '@/hooks/useCreditCardsData';

interface CreditCardsSummaryProps {
  cards: CreditCardData[];
}

export const CreditCardsSummary: React.FC<CreditCardsSummaryProps> = ({ cards }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalCards = cards.length;
  const totalLimit = cards.reduce((sum, card) => sum + card.credit_limit, 0);
  const totalUsed = cards.reduce((sum, card) => sum + card.current_value, 0);
  const totalAvailable = totalLimit - totalUsed;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total de Cartões</p>
            <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Limite Total</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalLimit)}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Valor Utilizado</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalUsed)}</p>
          </div>
          <div className="p-2 bg-orange-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Disponível</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAvailable)}</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
