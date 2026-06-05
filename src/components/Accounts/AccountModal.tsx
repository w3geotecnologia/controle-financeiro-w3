import React, { useState, useEffect } from 'react';
import { Save, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Account } from '@/hooks/useAccountsData';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useBanksOptions } from '@/hooks/useBanksOptions';
import { formatCurrency } from '@/utils/formatters';

export interface AccountFormData {
  description: string;
  amount: number;
  dueDate: string;
  type: 'receita' | 'despesa';
  category: string;
  status: 'pendente' | 'pago' | 'recebido';
  payment_source: 'bank';  // Fixo como 'bank'
  payment_source_id: number | null;
  payment_source_name: string;
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => void;
  account?: Account;
  isLoading?: boolean;
  categories: string[];
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  account,
  isLoading = false,
  categories
}) => {
  const { categories: categoriesData } = useCategoriesData();
  const { banks } = useBanksOptions();

  const [formData, setFormData] = useState<AccountFormData>({
    description: '',
    amount: 0,
    dueDate: '',
    type: 'despesa',
    category: '',
    status: 'pendente',
    payment_source: 'bank',
    payment_source_id: null,
    payment_source_name: ''
  });

  const [displayAmount, setDisplayAmount] = useState('');
  const [isCategoryEditing, setIsCategoryEditing] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        description: account.description,
        amount: account.amount,
        dueDate: account.dueDate,
        type: account.type as 'receita' | 'despesa',
        category: account.category,
        status: account.status as 'pendente' | 'pago' | 'recebido',
        payment_source: 'bank',
        payment_source_id: account.payment_source_id,
        payment_source_name: account.payment_source_name || ''
      });
      setDisplayAmount(formatCurrencyInput(account.amount));
      setIsCategoryEditing(false);
    } else {
      setFormData({
        description: '',
        amount: 0,
        dueDate: '',
        type: 'despesa',
        category: '',
        status: 'pendente',
        payment_source: 'bank',
        payment_source_id: null,
        payment_source_name: ''
      });
      setDisplayAmount('');
      setIsCategoryEditing(true);
    }
  }, [account, isOpen]);

  const formatCurrencyInput = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const parseCurrencyInput = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
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

  const handleChange = (field: keyof AccountFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getFilteredCategories = () => {
    return categoriesData.filter(cat => cat.type === formData.type);
  };

  const handleBankChange = (bankId: string) => {
    const selectedBank = banks.find(bank => bank.id === bankId);
    if (selectedBank) {
      setFormData(prev => ({
        ...prev,
        payment_source_id: parseInt(bankId),
        payment_source_name: selectedBank.name
      }));
    }
  };

  const selectedBank = banks.find(bank => bank.id === formData.payment_source_id?.toString());

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Editar Conta' : 'Nova Conta'}
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
                onValueChange={value => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">Receita</SelectItem>
                  <SelectItem value="despesa">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Categoria *</Label>
              {account && !isCategoryEditing ? (
                <div
                  onClick={() => setIsCategoryEditing(true)}
                  className="flex items-center h-10 px-3 py-2 border border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {(() => {
                    const currentCategory = categoriesData.find(cat => cat.name === formData.category);
                    return (
                      <div className="flex items-center gap-2">
                        {currentCategory && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: currentCategory.color }}
                          />
                        )}
                        <span className="text-sm">{formData.category || 'Selecione uma categoria'}</span>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <Select 
                  value={formData.category} 
                  onValueChange={value => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80 overflow-y-auto">
                    {getFilteredCategories().map(category => (
                      <SelectItem key={category.id} value={category.name}>
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
              )}
           </div>
      </div>

          {/* Fonte de Pagamento e Banco */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_source">Fonte de Pagamento *</Label>
              <div className="flex items-center h-10 px-3 py-2 border border-input bg-gray-50 rounded-md">
                <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm text-gray-700">Banco</span>
              </div>
            </div>
            <div>
              <Label htmlFor="payment_source_id">Banco *</Label>
              <Select 
                value={formData.payment_source_id?.toString() || ''} 
                onValueChange={handleBankChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um banco" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map(bank => (
                    <SelectItem key={bank.id} value={bank.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <span>{bank.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mostrar informações do banco selecionado */}
          {selectedBank && (
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-blue-900">{selectedBank.name}</span>
                  <span className="text-xs text-blue-600">Banco selecionado</span>
                </div>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-medium text-blue-700">Saldo Atual:</span>
                <span className="text-sm font-bold text-blue-800">
                  {formatCurrency(selectedBank.balance)}
                </span>
              </div>
            </div>
          )}

          {/* Data de Vencimento e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Data de Vencimento *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={e => handleChange('dueDate', e.target.value)}
                required
              />
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

          {/* Valor */}
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
