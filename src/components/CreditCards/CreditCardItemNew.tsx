import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CreditCardData } from '@/hooks/useCreditCardsData';
import { CreditCardUI } from './CreditCardUI';
import { formatCurrency } from '@/utils/formatters';

interface CreditCardItemNewProps {
  card: CreditCardData;
  onEdit: (card: CreditCardData) => void;
  onDelete: (id: number) => void;
}

export const CreditCardItemNew: React.FC<CreditCardItemNewProps> = ({
  card,
  onEdit,
  onDelete
}) => {
  const getStatusLabel = (currentValue: number, creditLimit: number) => {
    const utilization = creditLimit > 0 ? (currentValue / creditLimit) * 100 : 0;
    if (utilization > 80) return 'Limite Alto';
    if (utilization > 50) return 'Limite Médio';
    return 'Limite OK';
  };

  const getStatusColor = (currentValue: number, creditLimit: number) => {
    const utilization = creditLimit > 0 ? (currentValue / creditLimit) * 100 : 0;
    if (utilization > 80) return 'bg-red-100 text-red-800';
    if (utilization > 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const creditLimit = card.credit_limit || 0;
  const currentValue = card.current_value || 0;
  const available = creditLimit - currentValue;
  const utilization = creditLimit > 0 ? (currentValue / creditLimit) * 100 : 0;

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Visual Credit Card */}
      <div className="p-4">
        <CreditCardUI
          bankName={card.bank_name || card.card_brand || "BANCO"}
          cardNumber={card.card_number}
          holderName={card.holder_name || "NOME DO TITULAR"}
          expiry={card.expiry_date || "00/00"}
          brand={card.card_brand}
          color={card.color}
          cardName={card.card_name}
        />
      </div>

      {/* Card Information */}
      <div className="p-4 pt-0 space-y-4">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-card-foreground">{card.card_name}</h3>
          <Badge className={getStatusColor(card.current_value, card.credit_limit)}>
            {getStatusLabel(card.current_value, card.credit_limit)}
          </Badge>
        </div>

        {/* Usage Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Utilização</span>
            <span className="text-sm font-medium">{utilization.toFixed(0)}%</span>
          </div>
          <Progress value={utilization} className="h-2" />
        </div>

        {/* Financial Information */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Limite Total:</span>
            <span className="font-medium">{formatCurrency(card.credit_limit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valor Usado:</span>
            <span className="font-medium">{formatCurrency(card.current_value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Disponível:</span>
            <span className="font-medium text-green-600">{formatCurrency(available)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
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
            className="flex-1 text-destructive border-destructive/20 hover:bg-destructive/5"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
};