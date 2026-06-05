import React, { useState, useEffect } from 'react';
import { Save, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CardAccount, CardAccountFormData } from '@/hooks/useCardAccounts';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useCreditCardsOptions } from '@/hooks/useCreditCardsOptions';
import { formatCurrency } from '@/utils/formatters';

interface CardAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CardAccountFormData) => void;
  cardAccount?: CardAccount;
  isLoading?: boolean;
}

export const CardAccountFormModal: React.FC<CardAccountFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cardAccount,
  isLoading = false
}) => {
  const { categories } = useCategoriesData();
  const { cards } = useCreditCardsOptions();

  const [formData, setFormData] = useState<CardAccountFormData>({
    description: '',
    amount: 0,
    due_date: '',
    category_id: 0,
    card_id: 0,
    status: 'pendente',
    type: 'despesa',
    payment_source: 'card',
    payment_source_id: 0,
    payment_source_name: '',
    data_conta: ''
  });

  const [displayAmount, setDisplayAmount] = useState('');

  useEffect(() => {
    if (cardAccount) {
      setFormData({
        description: cardAccount.description,
        amount: cardAccount.amount,
        due_date: cardAccount.due_date,
        category_id: cardAccount.category_id,
        card_id: cardAccount.card_id,
        status: cardAccount.status,
        type: cardAccount.type || 'despesa',
        payment_source: cardAccount.payment_source || 'card',
        payment_source_id: cardAccount.payment_source_id || cardAccount.card_id,
        payment_source_name: cardAccount.payment_source_name || cardAccount.card_name || '',
        data_conta: cardAccount.data_conta || ''
      });
      setDisplayAmount(formatCurrencyInput(cardAccount.amount));
    } else {
      setFormData({
        description: '',
        amount: 0,
        due_date: '',
        category_id: 0,
        card_id: 0,
        status: 'pendente',
        type: 'despesa',
        payment_source: 'card',
        payment_source_id: 0,
        payment_source_name: '',
        data_conta: ''
      });
      setDisplayAmount('');
    }
  }, [cardAccount, isOpen]);

  const formatCurrencyInput = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const parseCurrencyInput = (value: string): number => {
    // Remove todos os caracteres que não sejam dígitos
    const numbers = value.replace(/\D/g, '');
    // Converte para número dividindo por 100 (para considerar os centavos)
    return numbers ? parseFloat(numbers) / 100 : 0;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrencyInput(inputValue);
    const formattedValue = formatCurrencyInput(numericValue);
    
    setDisplayAmount(formattedValue);
    setFormData(prev => ({ ...prev, amount: numericValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CardAccountFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (cardId: string) => {
    const selectedCard = cards.find(card => card.id === cardId);
    if (selectedCard) {
      setFormData(prev => ({
        ...prev,
        card_id: parseInt(cardId),
        payment_source_id: parseInt(cardId),
        payment_source_name: selectedCard.name
      }));
    }
  };

  // Filtrar categorias com base no tipo selecionado
  const filteredCategories = categories.filter(cat => cat.type === formData.type);
  const selectedCard = cards.find(card => card.id === formData.card_id.toString());

  // Limpar categoria quando o tipo mudar
  const handleTypeChange = (value: 'receita' | 'despesa') => {
    setFormData(prev => ({ ...prev, type: value, category_id: 0 }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {cardAccount ? 'Editar Conta de Cartão' : 'Nova Conta de Cartão'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Descrição */}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              type="text"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Descrição da conta"
              required
            />
          </div>

          {/* Tipo e Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={formData.type} 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      Despesa
                    </div>
                  </SelectItem>
                  <SelectItem value="receita">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Receita
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category_id">Categoria *</Label>
              <Select 
                value={formData.category_id.toString()} 
                onValueChange={value => handleChange('category_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="max-h-80 overflow-y-auto">
                  {filteredCategories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data da Compra e Data de Vencimento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_conta">Data da Compra</Label>
              <Input
                id="data_conta"
                type="date"
                value={formData.data_conta}
                onChange={e => handleChange('data_conta', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="due_date">Data de Vencimento *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={e => handleChange('due_date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Fonte de Pagamento e Cartão de Crédito */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_source">Fonte de Pagamento</Label>
              <div className="flex items-center h-10 px-3 py-2 border border-input bg-gray-50 rounded-md">
                <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">Cartão</span>
              </div>
            </div>
            <div>
              <Label htmlFor="card_id">Cartão de Crédito *</Label>
              <Select 
                value={formData.card_id.toString()} 
                onValueChange={handleCardChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cartão" />
                </SelectTrigger>
                <SelectContent>
                  {cards.map(card => (
                    <SelectItem key={card.id} value={card.id}>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span>{card.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mostrar informações do cartão selecionado */}
          {selectedCard && (
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-blue-900">{selectedCard.name}</span>
                  <span className="text-xs text-blue-600">
                    Usado: {formatCurrency(selectedCard.current_value)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-medium text-blue-700">Limite Disponível:</span>
                <span className="text-sm font-bold text-blue-800">
                  {formatCurrency((selectedCard.credit_limit || 0) - (selectedCard.current_value || 0))}
                </span>
              </div>
            </div>
          )}

          {/* Valor e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Valor *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  R$
                </span>
                <Input
                  id="amount"
                  type="text"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={value => handleChange('status', value as 'pendente' | 'pago' | 'recebido')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      Pendente
                    </div>
                  </SelectItem>
                  <SelectItem value="pago">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Pago
                    </div>
                  </SelectItem>
                  <SelectItem value="recebido">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      Recebido
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
