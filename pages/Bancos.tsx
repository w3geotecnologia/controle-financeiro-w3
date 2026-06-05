import React, { useState } from 'react';
import { Plus, Building2, AlertCircle, Search, Edit, Trash2, Wallet, CheckCircle, Users, Menu } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BankForm } from '@/components/Banks/BankForm';
import { DepositForm } from '@/components/Banks/DepositForm';
import { BanksList } from '@/components/Banks/BanksList';
import { useBanksData, Bank, BankInput } from '@/hooks/useBanksData';
import { useDepositsData } from '@/hooks/useDepositsData';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

const Bancos = () => {
  const [showBankForm, setShowBankForm] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | undefined>();
  const [selectedBankForDeposit, setSelectedBankForDeposit] = useState<Bank | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const {
    banks,
    isLoading,
    error,
    createBank,
    updateBank,
    deleteBank,
    isCreating,
    isUpdating
  } = useBanksData();

  const { createDeposit, isCreating: isCreatingDeposit } = useDepositsData();

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

  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'corrente': 'Corrente',
      'poupanca': 'Poupança',
      'salario': 'Salário',
      'investimento': 'Investimento'
    };
    return types[type] || type;
  };

  const getStatusLabel = (balance: number) => (balance >= 0 ? 'Ativo' : 'Negativo');

  const getStatusColor = (balance: number) =>
    balance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';

  // Resumos
  const totalBanks = banks.length;
  const activeBanks = banks.filter(bank => bank.balance >= 0).length;
  const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);
  const uniqueBanks = new Set(banks.map(bank => bank.name)).size;

  // Filtros
  const filteredBanks = banks.filter(bank => {
    const matchesSearch =
      bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bank.account_number.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && bank.balance >= 0) ||
      (statusFilter === 'negative' && bank.balance < 0);

    const matchesType = typeFilter === 'all' || bank.account_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handlers
  const handleCreateBank = (bankData: BankInput) => {
    createBank(bankData);
    setShowBankForm(false);
    toast({ title: 'Banco criado com sucesso!', duration: 2000 });
  };

  const handleUpdateBank = (bankData: BankInput) => {
    if (editingBank) {
      updateBank({ id: editingBank.id, ...bankData });
      setEditingBank(undefined);
      setShowBankForm(false);
      toast({ title: 'Banco atualizado com sucesso!', duration: 2000 });
    }
  };

  const handleDeleteBank = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este banco?')) {
      deleteBank(id);
      toast({ title: 'Banco excluído com sucesso!', duration: 2000 });
    }
  };

  const handleEditBank = (bank: Bank) => {
    setEditingBank(bank);
    setShowBankForm(true);
  };

  const handleAddDeposit = (bank: Bank) => {
    setSelectedBankForDeposit(bank);
    setShowDepositForm(true);
  };

  const handleCreateDeposit = (depositData: any) => {
    createDeposit(depositData);
    setShowDepositForm(false);
    setSelectedBankForDeposit(undefined);
    toast({ title: 'Depósito registrado com sucesso!', duration: 2000 });
  };

  const closeBankForm = () => {
    setShowBankForm(false);
    setEditingBank(undefined);
  };

  const closeDepositForm = () => {
    setShowDepositForm(false);
    setSelectedBankForDeposit(undefined);
  };

  // Carregando
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Carregando bancos...</p>
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
          <AlertDescription>Erro ao carregar bancos. Tente novamente.</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col space-y-4">
          {isMobile && (
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="mb-4 flex items-center gap-2 w-fit"
            >
              <Menu className="h-5 w-5" />
              Menu Principal
            </Button>
          )}
          
          {!isMobile && (
            <div className="flex items-center justify-start">
              <Button
                onClick={() => setShowBankForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Banco
              </Button>
            </div>
          )}

          {isMobile && (
            <Button
              onClick={() => setShowBankForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Banco
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className={isMobile ? "space-y-3" : "bg-white rounded-xl shadow-sm border border-slate-200 p-6"}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar bancos..."
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
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="negative">Negativos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os Tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="corrente">Corrente</SelectItem>
                <SelectItem value="poupanca">Poupança</SelectItem>
                <SelectItem value="salario">Salário</SelectItem>
                <SelectItem value="investimento">Investimento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Banks List - Cards Grid */}
        <div className={isMobile ? "space-y-4" : ""}>
          <BanksList
            banks={filteredBanks}
            onEdit={handleEditBank}
            onDelete={handleDeleteBank}
            onAddDeposit={handleAddDeposit}
          />
        </div>

        {/* Tabela - Desktop only */}
        {!isMobile && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300">
                <thead className="bg-slate-100 border-b-2 border-slate-300">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-800 border-r border-slate-300">Banco</th>
                    <th className="text-left p-4 font-semibold text-slate-800 border-r border-slate-300">Conta</th>
                    <th className="text-left p-4 font-semibold text-slate-800 border-r border-slate-300">Tipo</th>
                    <th className="text-left p-4 font-semibold text-slate-800 border-r border-slate-300">Saldo</th>
                    <th className="text-left p-4 font-semibold text-slate-800 border-r border-slate-300">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-800 border-r border-slate-300">Criado em</th>
                    <th className="text-left p-4 font-semibold text-slate-800">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanks.map((bank, index) => (
                    <tr
                      key={bank.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-25'
                      }`}
                    >
                      <td className="py-3 px-4 border-r border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {bank.nickname || bank.name}
                            </p>
                            <p className="text-sm text-slate-500">{bank.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200">
                        <div>
                          <p className="font-medium text-slate-800">{bank.account_number}</p>
                          <p className="text-sm text-slate-500">Agência: {bank.agency}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {getAccountTypeLabel(bank.account_type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200">
                        <span className={`font-semibold ${bank.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(bank.balance)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-r border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${bank.balance >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-sm ${getStatusColor(bank.balance)}`}>
                            {getStatusLabel(bank.balance)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 border-r border-slate-200">
                        {formatDate(bank.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddDeposit(bank)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBank(bank)}
                            className="text-slate-600 hover:text-slate-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBank(bank.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredBanks.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-600 mb-2">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Nenhum banco encontrado'
                    : 'Nenhum banco cadastrado'}
                </p>
                <p className="text-slate-500 mb-4">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Adicione sua primeira conta bancária para começar.'}
                </p>
                {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
                  <Button
                    onClick={() => setShowBankForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Banco
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dialogs */}
        <Dialog open={showBankForm} onOpenChange={closeBankForm}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBank ? 'Editar Banco' : 'Adicionar Novo Banco'}
              </DialogTitle>
            </DialogHeader>
            <BankForm
              bank={editingBank}
              onSubmit={editingBank ? handleUpdateBank : handleCreateBank}
              onCancel={closeBankForm}
              isLoading={isCreating || isUpdating}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showDepositForm} onOpenChange={closeDepositForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Depósito</DialogTitle>
            </DialogHeader>
            {selectedBankForDeposit && (
              <DepositForm
                bank={selectedBankForDeposit}
                onSubmit={handleCreateDeposit}
                onCancel={closeDepositForm}
                isLoading={isCreatingDeposit}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Bancos;
