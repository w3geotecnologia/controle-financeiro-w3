
import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCardData, CreditCardFormData } from '@/hooks/useCreditCardsData';

const colorOptions = [
  { value: 'blue', label: 'Azul', gradient: 'bg-gradient-to-br from-blue-600 to-blue-800' },
  { value: 'green', label: 'Verde', gradient: 'bg-gradient-to-br from-green-600 to-green-800' },
  { value: 'purple', label: 'Roxo', gradient: 'bg-gradient-to-br from-purple-600 to-purple-800' },
  { value: 'orange', label: 'Laranja', gradient: 'bg-gradient-to-br from-orange-600 to-red-600' },
  { value: 'teal', label: 'Verde Azulado', gradient: 'bg-gradient-to-br from-teal-600 to-teal-800' },
  { value: 'indigo', label: 'Índigo', gradient: 'bg-gradient-to-br from-indigo-600 to-indigo-800' },
  { value: 'pink', label: 'Rosa', gradient: 'bg-gradient-to-br from-pink-600 to-pink-800' },
  { value: 'cyan', label: 'Ciano', gradient: 'bg-gradient-to-br from-cyan-600 to-cyan-800' },
  { value: 'emerald', label: 'Esmeralda', gradient: 'bg-gradient-to-br from-emerald-600 to-emerald-800' },
  { value: 'violet', label: 'Violeta', gradient: 'bg-gradient-to-br from-violet-600 to-violet-800' },
  { value: 'black', label: 'Preto', gradient: 'bg-gradient-to-br from-gray-800 to-black' },
  { value: 'silver', label: 'Prata', gradient: 'bg-gradient-to-br from-gray-400 to-gray-600' },
  { value: 'gold', label: 'Ouro', gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
];

interface CreditCardFormModalProps {
  card?: CreditCardData;
  onSubmit: (data: CreditCardFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreditCardFormModal: React.FC<CreditCardFormModalProps> = ({
  card,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreditCardFormData>({
    card_name: '',
    card_number: '',
    holder_name: '',
    expiry_date: '',
    due_date: '',
    credit_limit: 0,
    current_value: 0,
    bank_name: '',
    card_brand: 'visa',
    color: 'blue',
  });

  useEffect(() => {
    if (card) {
      setFormData({
        card_name: card.card_name,
        card_number: card.card_number,
        holder_name: card.holder_name,
        expiry_date: card.expiry_date,
        due_date: card.due_date || '',
        credit_limit: card.credit_limit,
        current_value: card.current_value,
        bank_name: card.bank_name || '',
        card_brand: card.card_brand,
        color: card.color || 'blue',
      });
    }
  }, [card]);

  const handleChange = (field: keyof CreditCardFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Extrai apenas os últimos 4 dígitos para exibição no campo
  const getLastFourDigits = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    // Se tiver mais de 4 dígitos, pega os últimos 4
    if (numbers.length > 4) {
      return numbers.slice(-4);
    }
    return numbers;
  };

  // Formata o número completo para armazenamento (12 asteriscos + 4 últimos dígitos)
  const formatCardNumberForStorage = (lastFour: string) => {
    const digits = lastFour.replace(/\D/g, '').slice(0, 4);
    return `************${digits}`;
  };

  // Formata para exibição: **** **** **** 1234
  const formatCardNumberDisplay = (value: string) => {
    const lastFour = getLastFourDigits(value);
    return `**** **** **** ${lastFour.padEnd(4, '_')}`;
  };

  const handleCardNumberChange = (value: string) => {
    // Permite apenas números e limita a 4 dígitos
    const digits = value.replace(/\D/g, '').slice(0, 4);
    // Armazena com os asteriscos
    handleChange('card_number', formatCardNumberForStorage(digits));
  };

  const formatExpiryDate = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 6 dígitos (MM/AAAA)
    const limited = numbers.slice(0, 6);
    
    // Formata como MM/AAAA
    if (limited.length >= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    } else if (limited.length >= 2) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    }
    
    return limited;
  };

  const handleExpiryDateChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    handleChange('expiry_date', formatted);
  };

  const getSelectedColorGradient = () => {
    const selectedColor = colorOptions.find(color => color.value === formData.color);
    return selectedColor?.gradient || colorOptions[0].gradient;
  };

  const availableLimit = (formData.credit_limit || 0) - (formData.current_value || 0);

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
      <div>
        <Label htmlFor="holder_name">Nome do Usuário *</Label>
        <Input
          id="holder_name"
          type="text"
          value={formData.holder_name}
          onChange={e => handleChange('holder_name', e.target.value)}
          placeholder="Nome do titular do cartão"
          required
        />
      </div>

      <div>
        <Label htmlFor="card_name">Nome do Cartão *</Label>
        <Input
          id="card_name"
          type="text"
          value={formData.card_name}
          onChange={e => handleChange('card_name', e.target.value)}
          placeholder="Ex: Nubank Roxinho"
          required
        />
      </div>

      <div>
        <Label htmlFor="card_number">Número do Cartão (últimos 4 dígitos) *</Label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-mono text-sm">**** **** ****</span>
          <Input
            id="card_number"
            type="text"
            maxLength={4}
            value={getLastFourDigits(formData.card_number)}
            onChange={e => handleCardNumberChange(e.target.value)}
            placeholder="1234"
            className="w-24 text-center font-mono"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="card_brand">Bandeira do Cartão *</Label>
        <Select
          value={formData.card_brand}
          onValueChange={(value) => handleChange('card_brand', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a bandeira" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visa">Visa</SelectItem>
            <SelectItem value="mastercard">MasterCard</SelectItem>
            <SelectItem value="elo">Elo</SelectItem>
            <SelectItem value="amex">American Express</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="color" className="text-slate-700">
          Cor do Cartão
        </Label>
        <Select
          value={formData.color}
          onValueChange={(value) => handleChange('color', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {colorOptions.map((colorOption) => (
              <SelectItem key={colorOption.value} value={colorOption.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${colorOption.gradient}`} />
                  {colorOption.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="mt-2">
          <div className={`w-full h-8 rounded ${getSelectedColorGradient()} flex items-center justify-center text-white text-xs font-medium`}>
            Prévia da Cor
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry_date">Data de Validade *</Label>
          <Input
            id="expiry_date"
            type="text"
            maxLength={7}
            value={formData.expiry_date}
            onChange={e => handleExpiryDateChange(e.target.value)}
            placeholder="MM/AAAA"
            required
          />
        </div>
        <div>
          <Label htmlFor="due_date">Dia do Vencimento</Label>
          <Input
            id="due_date"
            type="text"
            value={formData.due_date}
            onChange={e => handleChange('due_date', e.target.value)}
            placeholder="Dia 20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="credit_limit">Limite de Crédito *</Label>
          <Input
            id="credit_limit"
            type="number"
            step="0.01"
            value={formData.credit_limit}
            onChange={e => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
            placeholder="5000.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="current_value">Valor Atual</Label>
          <Input
            id="current_value"
            type="number"
            step="0.01"
            value={formData.current_value}
            onChange={e => handleChange('current_value', parseFloat(e.target.value) || 0)}
            placeholder="1200.00"
          />
        </div>
      </div>

      {/* Limite disponível calculado */}
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Limite Disponível:</span>
        <span className="text-sm font-bold text-green-600">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(availableLimit)}
        </span>
      </div>

      {/* Botões de ação */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
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
          {isLoading ? 'Salvando...' : 'Salvar Cartão'}
        </Button>
      </div>
    </form>
  );
};
