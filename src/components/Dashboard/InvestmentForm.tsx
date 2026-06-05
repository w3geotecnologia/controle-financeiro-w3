import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Investment, InvestmentInstitution, InvestmentType } from '@/hooks/useInvestmentsData';
import { X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvestmentFormProps {
  onClose: () => void;
  onSubmit: (investment: any) => Promise<void>;
  onAddInstitution: (name: string) => Promise<any>;
  onAddType: (name: string, category: string) => Promise<any>;
  investment?: Investment;
  institutions: InvestmentInstitution[];
  investmentTypes: InvestmentType[];
  isLoading?: boolean;
}

const initialFormData = {
  name: '',
  institution_id: '',
  type_id: '',
  invested_amount: 0,
  current_value: 0,
  yield_percentage: '',
  purchase_date: '',
  maturity_date: '',
  investor_name: ''
};

const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  // Se a data já estiver no formato YYYY-MM-DD, retorna como está
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  // Se a data estiver no formato ISO, converte para YYYY-MM-DD sem considerar fuso horário
  try {
    // Cria a data como local para evitar problemas de timezone
    const date = new Date(dateString + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  
  return '';
};

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  onClose,
  onSubmit,
  onAddInstitution,
  onAddType,
  investment,
  institutions,
  investmentTypes,
  isLoading = false
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [newInstitution, setNewInstitution] = useState('');
  const [showNewInstitution, setShowNewInstitution] = useState(false);
  const [newType, setNewType] = useState({ name: '', category: '' });
  const [showNewType, setShowNewType] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Abrir modal automaticamente quando há investment ou quando o formulário é usado
  useEffect(() => {
    setIsOpen(true);
  }, []);

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

  // Reset form when investment changes
  useEffect(() => {
    if (investment) {
      console.log('InvestmentForm: editing investment', investment);
      const formattedPurchaseDate = formatDateForInput(investment.purchase_date);
      const formattedMaturityDate = formatDateForInput(investment.maturity_date);
      
      console.log('InvestmentForm: original dates', {
        purchase_date: investment.purchase_date,
        maturity_date: investment.maturity_date
      });
      console.log('InvestmentForm: formatted dates', {
        purchase_date: formattedPurchaseDate,
        maturity_date: formattedMaturityDate
      });
      
      // Editing existing investment
      setFormData({
        name: investment.name || '',
        institution_id: investment.institution_id?.toString() || '',
        type_id: investment.type_id?.toString() || '',
        invested_amount: investment.invested_amount || 0,
        current_value: investment.current_value || 0,
        yield_percentage: investment.yield_percentage?.toString() || '',
        purchase_date: formattedPurchaseDate,
        maturity_date: formattedMaturityDate,
        investor_name: investment.investor_name || ''
      });
    } else {
      // Creating new investment - reset to initial state
      setFormData(initialFormData);
    }
    // Reset other form states
    setNewInstitution('');
    setShowNewInstitution(false);
    setNewType({ name: '', category: '' });
    setShowNewType(false);
  }, [investment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        name: formData.name,
        institution_id: parseInt(formData.institution_id),
        type_id: parseInt(formData.type_id),
        invested_amount: formData.invested_amount,
        current_value: formData.current_value,
        yield_percentage: formData.yield_percentage ? parseFloat(formData.yield_percentage) : null,
        purchase_date: formData.purchase_date,
        maturity_date: formData.maturity_date || null,
        investor_name: formData.investor_name || null
      };
      
      console.log('InvestmentForm: submitting data', submitData);
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar investimento:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Aguarda animação do modal
  };

  const handleAmountChange = (field: 'invested_amount' | 'current_value') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseCurrencyInput(inputValue);
    setFormData(prev => ({ ...prev, [field]: numericValue }));
  };

  const handleAddInstitution = async () => {
    if (!newInstitution.trim()) return;
    
    try {
      const institution = await onAddInstitution(newInstitution);
      setFormData({ ...formData, institution_id: institution.id.toString() });
      setNewInstitution('');
      setShowNewInstitution(false);
    } catch (error) {
      console.error('Erro ao adicionar instituição:', error);
    }
  };

  const handleAddType = async () => {
    if (!newType.name.trim() || !newType.category.trim()) return;
    
    try {
      const type = await onAddType(newType.name, newType.category);
      setFormData({ ...formData, type_id: type.id.toString() });
      setNewType({ name: '', category: '' });
      setShowNewType(false);
    } catch (error) {
      console.error('Erro ao adicionar tipo:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {investment ? 'Editar Investimento' : 'Novo Investimento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investor_name">Nome do Investidor</Label>
              <Input
                id="investor_name"
                value={formData.investor_name}
                onChange={(e) => setFormData({ ...formData, investor_name: e.target.value })}
                placeholder="Nome do investidor"
              />
            </div>

            <div>
              <Label htmlFor="name">Nome do Investimento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: CDB Banco XYZ"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Instituição</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewInstitution(!showNewInstitution)}
              >
                <Plus size={16} />
                Nova
              </Button>
            </div>
            
            {showNewInstitution ? (
              <div className="flex gap-2">
                <Input
                  value={newInstitution}
                  onChange={(e) => setNewInstitution(e.target.value)}
                  placeholder="Nome da instituição"
                />
                <Button type="button" onClick={handleAddInstitution} size="sm">
                  Adicionar
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowNewInstitution(false)}
                >
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <Select
                value={formData.institution_id}
                onValueChange={(value) => setFormData({ ...formData, institution_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a instituição" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id.toString()}>
                      {institution.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Tipo de Investimento</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowNewType(!showNewType)}
              >
                <Plus size={16} />
                Novo
              </Button>
            </div>
            
            {showNewType ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newType.name}
                    onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                    placeholder="Nome do tipo"
                  />
                  <Select
                    value={newType.category}
                    onValueChange={(value) => setNewType({ ...newType, category: value })}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renda_fixa">Renda Fixa</SelectItem>
                      <SelectItem value="renda_variavel">Renda Variável</SelectItem>
                      <SelectItem value="fundos">Fundos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={handleAddType} size="sm" className="flex-1">
                    Adicionar Tipo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowNewType(false)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ) : (
              <Select
                value={formData.type_id}
                onValueChange={(value) => setFormData({ ...formData, type_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {investmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name} ({type.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invested_amount">Valor Investido</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-3 text-slate-400 text-sm font-medium">R$</span>
                <Input
                  id="invested_amount"
                  type="text"
                  value={formatCurrencyInput(formData.invested_amount)}
                  onChange={handleAmountChange('invested_amount')}
                  className="pl-10"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="current_value">Valor Atual</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-3 text-slate-400 text-sm font-medium">R$</span>
                <Input
                  id="current_value"
                  type="text"
                  value={formatCurrencyInput(formData.current_value)}
                  onChange={handleAmountChange('current_value')}
                  className="pl-10"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="yield_percentage">Rentabilidade (%)</Label>
              <Input
                id="yield_percentage"
                type="number"
                step="0.01"
                value={formData.yield_percentage}
                onChange={(e) => setFormData({ ...formData, yield_percentage: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="purchase_date">Data da Compra</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => {
                  console.log('InvestmentForm: purchase_date changed to', e.target.value);
                  setFormData({ ...formData, purchase_date: e.target.value });
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="maturity_date">Vencimento</Label>
              <Input
                id="maturity_date"
                type="date"
                value={formData.maturity_date}
                onChange={(e) => {
                  console.log('InvestmentForm: maturity_date changed to', e.target.value);
                  setFormData({ ...formData, maturity_date: e.target.value });
                }}
                placeholder="Data de vencimento"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Salvando...' : investment ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
