import React, { useState } from 'react';
import { Plus, CreditCard, AlertCircle, Search, Edit, Trash2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCardFormModal } from '@/components/CreditCards/CreditCardFormModal';
import { useCreditCards, CreditCard as CreditCardType, CreditCardInput } from '@/hooks/useCreditCards';
import { useToast } from '@/hooks/use-toast';

const CartoesNovo = () => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  const { toast } = useToast();

  const {
    creditCards,
    isLoading,
    error,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    isCreating,
    isUpdating
  } = useCreditCards();

  // Funções utilitárias
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '--/--/----';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    const lastFour = numbers.slice(-4);
    return `****${lastFour}`;
  };

  const getBrandLabel = (brand: string) => {
    const brands: { [key: string]: string } = {
      'visa': 'Visa',
      'mastercard': 'Mastercard', 
      'elo': 'Elo',
      'american-express': 'American Express',
      'hipercard': 'Hipercard'
    };
    return brands[brand] || brand;
  };

  const getStatusLabel = (currentValue: number, creditLimit: number) => {
    const utilization = creditLimit > 0 ? (currentValue / creditLimit) * 100 : 0;
    if (utilization > 80) return 'Alto Uso';
    if (utilization > 50) return 'Uso Médio';
    return 'Limite OK';
  };

  const getStatusColor = (currentValue: number, creditLimit: number) => {
    const utilization = creditLimit > 0 ? (currentValue / creditLimit) * 100 : 0;
    if (utilization > 80) return 'bg-red-100 text-red-800';
    if (utilization > 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Resumos
  const totalCards = creditCards.length;
  const totalLimit = creditCards.reduce((sum, card) => sum + card.credit_limit, 0);
  const totalUsed = creditCards.reduce((sum, card) => sum + card.current_value, 0);
  const totalAvailable = totalLimit - totalUsed;

  // Filtros
  const filteredCards = creditCards.filter(card => {
    const matchesSearch =
      card.card_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.bank_name && card.bank_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      card.card_number.includes(searchTerm) ||
      card.holder_name.toLowerCase().includes(searchTerm.toLowerCase());

    const utilization = card.credit_limit > 0 ? (card.current_value / card.credit_limit) * 100 : 0;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'ok' && utilization <= 50) ||
      (statusFilter === 'medium' && utilization > 50 && utilization <= 80) ||
      (statusFilter === 'high' && utilization > 80);

    const matchesBrand = brandFilter === 'all' || card.card_brand === brandFilter;

    return matchesSearch && matchesStatus && matchesBrand;
  });

  // Handlers
  const handleCreateCard = async (cardData: CreditCardInput) => {
    try {
      await createCreditCard(cardData);
      setShowCardForm(false);
      toast({ title: 'Cartão criado com sucesso!', duration: 2000 });
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
    }
  };

  const handleUpdateCard = async (cardData: CreditCardInput) => {
    if (editingCard) {
      try {
        await updateCreditCard(editingCard.id, cardData);
        setEditingCard(undefined);
        setShowCardForm(false);
        toast({ title: 'Cartão atualizado com sucesso!', duration: 2000 });
      } catch (error) {
        console.error('Erro ao atualizar cartão:', error);
      }
    }
  };

  const handleDeleteCard = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await deleteCreditCard(id);
        toast({ title: 'Cartão excluído com sucesso!', duration: 2000 });
      } catch (error) {
        console.error('Erro ao excluir cartão:', error);
      }
    }
  };

  const handleEditCard = (card: CreditCardType) => {
    setEditingCard(card);
    setShowCardForm(true);
  };

  const closeCardForm = () => {
    setShowCardForm(false);
    setEditingCard(undefined);
  };

  // Carregando
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Carregando cartões...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Erro
  if (error) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar cartões. Tente novamente.</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Gestão de Cartões</h1>
              <p className="text-slate-600 mt-1">
                Gerencie seus cartões de crédito e acompanhe seus gastos
              </p>
            </div>
            <Button
              onClick={() => setShowCardForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </div>
        </div>
      
        {/* Cards Individuais dos Cartões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditCards.slice(0, 8).map((card) => {
            const available = card.credit_limit - card.current_value;
            return (
              <div
                key={card.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Informações do cartão */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800">{card.card_name}</span>
                    <span className="text-sm text-slate-600">
                      {card.bank_name || "Banco não informado"}
                    </span>
                    <span className="text-sm text-slate-500">
                      Cartão • {formatCardNumber(card.card_number)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Última atualização: {formatDate(card.updated_at)}
                    </span>
                  </div>
                </div>

                {/* Limite disponível em destaque no rodapé */}
                <p>
                  <span className="text-sm font-semibold text-slate-600">
                    Limite Disponível:
                  </span>{" "}
                  <span
                    className={`text-lg font-bold ${
                      available >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(available)}
                  </span>
                </p>
              </div>
            );
          })}

          {/* Cards vazios para completar até 8 */}
          {Array.from({ length: Math.max(0, 8 - creditCards.length) }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-white rounded-xl shadow-sm border border-slate-200 border-dashed p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-400">Cartão Vazio</span>
                  <span className="text-sm text-slate-400">Banco_Não_Cadastrado</span>
                  <span className="text-sm text-slate-300">Cartão • ****0000</span>
                  <span className="text-xs text-slate-300">
                    Última atualização: --/--/----
                  </span>
                </div>
              </div>

              <p>
                <span className="text-sm font-semibold text-slate-400">
                  Limite Disponível:
                </span>{" "}
                <span className="text-lg font-bold text-slate-300">R$ 0,00</span>
              </p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar cartões..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ok">Limite OK</SelectItem>
                <SelectItem value="medium">Uso Médio</SelectItem>
                <SelectItem value="high">Alto Uso</SelectItem>
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as Bandeiras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Bandeiras</SelectItem>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="elo">Elo</SelectItem>
                <SelectItem value="american-express">American Express</SelectItem>
                <SelectItem value="hipercard">Hipercard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Cartão</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Número</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Bandeira</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Limite</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Usado</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Disponível</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCards.map((card, index) => {
                  const available = card.credit_limit - card.current_value;
                  const utilization = card.credit_limit > 0 ? (card.current_value / card.credit_limit) * 100 : 0;
                  
                  return (
                    <tr
                      key={card.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{card.card_name}</p>
                            <p className="text-sm text-slate-500">{card.holder_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-mono text-slate-800">{formatCardNumber(card.card_number)}</p>
                          <p className="text-sm text-slate-500">Val: {card.expiry_date}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                          {getBrandLabel(card.card_brand)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(card.credit_limit)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-red-600">
                          {formatCurrency(card.current_value)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${available >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(available)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            utilization > 80 ? 'bg-red-500' : 
                            utilization > 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <Badge className={getStatusColor(card.current_value, card.credit_limit)}>
                            {getStatusLabel(card.current_value, card.credit_limit)}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCard(card)}
                            className="text-slate-600 hover:text-slate-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCards.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-600 mb-2">
                {searchTerm || statusFilter !== 'all' || brandFilter !== 'all'
                  ? 'Nenhum cartão encontrado'
                  : 'Nenhum cartão cadastrado'}
              </p>
              <p className="text-slate-500 mb-4">
                {searchTerm || statusFilter !== 'all' || brandFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Adicione seu primeiro cartão de crédito para começar.'}
              </p>
              {!searchTerm && statusFilter === 'all' && brandFilter === 'all' && (
                <Button
                  onClick={() => setShowCardForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Cartão
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Dialog */}
        <Dialog open={showCardForm} onOpenChange={closeCardForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
              </DialogTitle>
            </DialogHeader>
            <CreditCardFormModal
              card={editingCard}
              onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
              onCancel={closeCardForm}
              isLoading={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CartoesNovo;