import React from 'react';
import { Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelect } from './CategorySelect';
import { Category } from '@/hooks/useCategoriesData';
import { useBanksOptions } from '@/hooks/useBanksOptions';

interface Account {
  id?: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  qtd_parcelas?: number;
  bank_id?: number;
  payment_source?: 'bank';
  payment_source_id?: number;
  payment_source_name?: string;
}

interface AccountFormProps {
  formData: Account;
  setFormData: React.Dispatch<React.SetStateAction<Account>>;
  categories: Category[];
  onRefreshCategories: () => void;
  onAddCategory?: (categoryData: { name: string; type: 'receita' | 'despesa'; color: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  formData,
  setFormData,
  categories,
  onRefreshCategories,
  onAddCategory,
  onSubmit,
  onCancel,
  isEditing
}) => {
  const { banksOptions } = useBanksOptions();

  // Sempre fixa como banco
  React.useEffect(() => {
    if (formData.payment_source !== 'bank') {
      setFormData(prev => ({ ...prev, payment_source: 'bank' }));
    }
  }, [formData.payment_source, setFormData]);

  const formatCurrencyInput = (value: number): string => {
    if (!value) return '';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '');
    const numericValue = digitsOnly ? parseInt(digitsOnly) / 100 : 0;
    setFormData({ ...formData, amount: numericValue });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, description: e.target.value });
  };

  const handleTypeChange = (value: 'receita' | 'despesa') => {
    setFormData({ ...formData, type: value, category: '' });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, dueDate: e.target.value });
  };


  const handleParcellasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, qtd_parcelas: parseInt(e.target.value) || 1 });
  };

  const handleBankChange = (value: string) => {
    const bank = banksOptions.find(b => b.id === value);
    setFormData({
      ...formData,
      payment_source_id: parseInt(value),
      payment_source_name: bank?.name || ''
    });
  };

  const handleStatusChange = (value: 'pendente' | 'pago' | 'recebido') => {
    setFormData({ ...formData, status: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.payment_source_id) {
      alert('Por favor, selecione um banco.');
      return;
    }
    onSubmit(e);
  };

  const getSelectedBankBalance = () => {
    const bank = banksOptions.find(b => b.id === formData.payment_source_id?.toString());
    return bank ? `Saldo: R$ ${formatCurrencyInput(bank.balance)}` : null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Descrição */}
      <div>
        <Label htmlFor="description">Descrição *</Label>
        <Input
          id="description"
          type="text"
          value={formData.description || ''}
          onChange={handleDescriptionChange}
          placeholder="Ex: Aluguel, Salário..."
          required
        />
      </div>

      {/* Tipo e Categoria */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Tipo *</Label>
          <Select value={formData.type || 'despesa'} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="receita">Receita</SelectItem>
              <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Categoria *</Label>
          <CategorySelect
            value={formData.category || ''}
            onValueChange={handleCategoryChange}
            categories={categories || []}
            accountType={formData.type || 'despesa'}
            onRefresh={onRefreshCategories}
            onAddCategory={onAddCategory}
          />
        </div>
      </div>

      {/* Fonte de Pagamento e Banco */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Fonte de Pagamento *</Label>
          <Select value="bank" disabled>
            <SelectTrigger>
              <SelectValue placeholder="Banco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Banco</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bank">Banco *</Label>
          <Select
            value={formData.payment_source_id?.toString() || ''}
            onValueChange={handleBankChange}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o banco" />
            </SelectTrigger>
            <SelectContent>
              {banksOptions.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Saldo do banco selecionado */}
          {formData.payment_source_id && (
            <div className="mt-2 p-2 bg-slate-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{formData.payment_source_name}</span>
                <span className="text-xs text-slate-600">{getSelectedBankBalance()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data de Vencimento e Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dueDate">Data de Vencimento *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate || ''}
            onChange={handleDateChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status || 'pendente'} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Valor */}
      <div>
        <Label htmlFor="amount">Valor *</Label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-slate-400">R$</span>
          <Input
            id="amount"
            type="text"
            value={formatCurrencyInput(formData.amount || 0)}
            onChange={handleAmountChange}
            className="pl-10"
            placeholder="0,00"
            required
          />
        </div>
      </div>

      {/* Parcelas */}
      {!isEditing && (
        <div>
          <Label htmlFor="qtd_parcelas">Parcelas</Label>
          <Input
            id="qtd_parcelas"
            type="number"
            min="1"
            max="60"
            value={formData.qtd_parcelas || 1}
            onChange={handleParcellasChange}
            placeholder="1"
          />
        </div>
      )}

      {/* Botões */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-green-500">
          {isEditing ? 'Atualizar' : 
           (formData.qtd_parcelas && formData.qtd_parcelas > 1) 
             ? `Criar ${formData.qtd_parcelas} Parcelas` 
             : 'Criar'}
        </Button>
      </div>
    </form>
  );
};
