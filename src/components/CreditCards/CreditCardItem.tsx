import React from 'react';
import { CreditCard, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCardData } from '@/hooks/useCreditCardsData';

interface CreditCardItemProps {
  card: CreditCardData;
  onEdit: (card: CreditCardData) => void;
  onDelete: (id: number) => void;
}

export const CreditCardItem: React.FC<CreditCardItemProps> = ({
  card,
  onEdit,
  onDelete
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) {
      return numbers;
    }
    // Mostra apenas os 4 últimos números, o resto fica mascarado
    const lastFour = numbers.slice(-4);
    const masked = '*'.repeat(numbers.length - 4);
    return `${masked} ${lastFour}`;
  };

  const getStatusLabel = (currentValue: number, creditLimit: number) => {
    const utilization = creditLimit > 0 ? (currentValue / creditLimit) * 100 : 0;
    if (utilization > 80) return 'Limite uso Alto';
    if (utilization > 50) return 'Limite uso Médio';
    return 'Limite OK';
  };

  const getStatusColor = (currentValue: number, creditLimit: number) => {
    const utilization = creditLimit > 0 ? (currentValue / creditLimit) * 100 : 0;
    if (utilization > 80) return 'bg-red-100 text-red-800';
    if (utilization > 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const utilization = card.credit_limit && card.credit_limit > 0 
    ? (card.current_value / card.credit_limit) * 100 
    : 0;
  const available = (card.credit_limit || 0) - card.current_value;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      {/* Header do cartão */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{card.card_name}</h3>
            <p className="text-sm text-gray-600">{card.holder_name}</p>
          </div>
        </div>
        <Badge className={getStatusColor(card.current_value, card.credit_limit)}>
          {getStatusLabel(card.current_value, card.credit_limit)}
        </Badge>
      </div>

      {/* Informações do cartão */}
      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Número do Cartão</p>
          <p className="font-mono text-gray-900">{formatCardNumber(card.card_number)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Validade</p>
            <p className="text-gray-900">{card.expiry_date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Vencimento</p>
            <p className="text-gray-900">
              {card.due_date || 'Não informado'}
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">Utilização</p>
            <p className="text-sm font-medium text-gray-900">{utilization.toFixed(0)}%</p>
          </div>
          <Progress value={utilization} className="h-2" />
        </div>

        {/* Valores financeiros */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Limite Total:</span>
            <span className="text-sm font-medium text-gray-900">{formatCurrency(card.credit_limit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Valor Atual:</span>
            <span className="text-sm font-medium text-gray-900">{formatCurrency(card.current_value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Disponível:</span>
            <span className="text-sm font-medium text-green-600">{formatCurrency(available)}</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(card)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(card.id)}
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
};
