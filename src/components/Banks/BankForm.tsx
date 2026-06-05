
import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bank, BankInput } from '@/hooks/useBanksData';

interface BankFormProps {
  bank?: Bank;
  onSubmit: (data: BankInput & { balance?: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

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

export const BankForm: React.FC<BankFormProps> = ({
  bank,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<BankInput & { balance?: number }>({
    name: '',
    agency: '',
    account_number: '',
    account_type: 'corrente',
    nickname: '',
    balance: 0,
    color: 'blue'
  });

  useEffect(() => {
    if (bank) {
      setFormData({
        name: bank.name,
        agency: bank.agency,
        account_number: bank.account_number,
        account_type: bank.account_type,
        nickname: bank.nickname || '',
        balance: bank.balance,
        color: bank.color || 'blue'
      });
    }
  }, [bank]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof (BankInput & { balance: number }), value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSelectedColorGradient = () => {
    const selectedColor = colorOptions.find(color => color.value === formData.color);
    return selectedColor?.gradient || colorOptions[0].gradient;
  };
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

   return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-slate-700">
            Nome do Banco *
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Ex: Banco do Brasil, Itaú, Nubank..."
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="nickname" className="text-slate-700">
            Apelido/Nome Fantasia
          </Label>
          <Input
            id="nickname"
            type="text"
            value={formData.nickname}
            onChange={(e) => handleChange('nickname', e.target.value)}
            placeholder="Ex: Conta Principal, Poupança Reserva..."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Nome para identificação fácil (opcional)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="agency" className="text-slate-700">
              Agência *
            </Label>
            <Input
              id="agency"
              type="text"
              value={formData.agency}
              onChange={(e) => handleChange('agency', e.target.value)}
              placeholder="Ex: 1234"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="account_number" className="text-slate-700">
              Número da Conta *
            </Label>
            <Input
              id="account_number"
              type="text"
              value={formData.account_number}
              onChange={(e) => handleChange('account_number', e.target.value)}
              placeholder="Ex: 12345-6"
              className="mt-1"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="account_type" className="text-slate-700">
            Tipo de Conta
          </Label>
          <Select
            value={formData.account_type}
            onValueChange={(value) => handleChange('account_type', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corrente">Conta Corrente</SelectItem>
              <SelectItem value="poupanca">Conta Poupança</SelectItem>
              <SelectItem value="salario">Conta Salário</SelectItem>
              <SelectItem value="investimento">Conta Investimento</SelectItem>
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

        {bank && (
          <div>
  <Label htmlFor="balance" className="text-slate-700">
    Saldo Atual
  </Label>

  {/* Mostra o valor atual formatado antes da edição */}
  <p className="text-sm text-slate-500 mb-1">
    Valor atual: {formatCurrency(formData.balance || 0)}
  </p>

  <Input
    id="balance"
    type="number"
    step="0.01"
    value={formData.balance || 0}
    onChange={(e) =>
      handleChange('balance', parseFloat(e.target.value) || 0)
    }
    placeholder="Ex: 1500.00"
    className="mt-1"
  />

  <p className="text-xs text-muted-foreground mt-1">
    Ajuste o saldo atual da conta
  </p>
</div>
        )}
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
          className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          disabled={isLoading}
        >
          {isLoading ? 'Salvando...' : (bank ? 'Atualizar' : 'Salvar')}
        </Button>
      </div>
    </form>
  );
};
