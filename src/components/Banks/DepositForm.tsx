
import React, { useState } from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Bank } from '@/hooks/useBanksData';
import { DepositInput } from '@/hooks/useDepositsData';

interface DepositFormProps {
  bank: Bank;
  onSubmit: (data: DepositInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DepositForm: React.FC<DepositFormProps> = ({
  bank,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    amount: 0,
    deposit_date: new Date().toISOString().split('T')[0],
    description: '',
    origin_bank: ''
  });

  const formatCurrencyInput = (value: number): string => {
    if (isNaN(value) || value === null || value === undefined || value === 0) {
      return '';
    }
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const parseCurrencyInput = (inputValue: string): number => {
    if (!inputValue) return 0;
    
    const digitsOnly = inputValue.replace(/\D/g, '');
    if (!digitsOnly) return 0;
    
    const numericValue = parseInt(digitsOnly) / 100;
    return numericValue;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      bank_id: bank.id,
      amount: formData.amount,
      deposit_date: formData.deposit_date,
      description: formData.description || undefined,
      origin_bank: formData.origin_bank || undefined
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrencyInput(inputValue);
    setFormData(prev => ({ ...prev, amount: numericValue }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900">Depósito para:</h3>
        <p className="text-blue-700">
          {bank.nickname || bank.name} - Ag: {bank.agency} - Conta: {bank.account_number}
        </p>
      </div>

      <div>
        <Label htmlFor="amount" className="text-slate-700">
          Valor do Depósito *
        </Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-3 text-slate-400 text-sm font-medium">R$</span>
          <Input
            id="amount"
            type="text"
            value={formatCurrencyInput(formData.amount)}
            onChange={handleAmountChange}
            className="pl-10"
            placeholder="0,00"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="deposit_date" className="text-slate-700">
          Data do Depósito *
        </Label>
        <div className="relative mt-1">
          <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
          <Input
            id="deposit_date"
            type="date"
            value={formData.deposit_date}
            onChange={(e) => setFormData(prev => ({ ...prev, deposit_date: e.target.value }))}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="origin_bank" className="text-slate-700">
          Banco de Origem
        </Label>
        <Input
          id="origin_bank"
          type="text"
          value={formData.origin_bank}
          onChange={(e) => setFormData(prev => ({ ...prev, origin_bank: e.target.value }))}
          placeholder="Ex: Santander, PIX de outro banco..."
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Informe de onde veio o depósito (opcional)
        </p>
      </div>

      <div>
        <Label htmlFor="description" className="text-slate-700">
          Descrição/Observação
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ex: Transferência salário, PIX recebido..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          disabled={isLoading || formData.amount <= 0}
        >
          {isLoading ? 'Registrando...' : 'Registrar Depósito'}
        </Button>
      </div>
    </form>
  );
};
