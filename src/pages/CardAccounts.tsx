import React, { useState, useEffect } from 'react';
import { Plus, Menu, Search } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CardAccountFormModal } from '@/components/CardAccounts/CardAccountFormModal';
import { CardAccountsTable } from '@/components/CardAccounts/CardAccountsTable';
import { CardAccountsSummaryCards } from '@/components/CardAccounts/CardAccountsSummaryCards';
import { CardAccountsSummaryCardsMobile } from '@/components/CardAccounts/CardAccountsSummaryCardsMobile';
import { CardAccountsListMobile } from '@/components/CardAccounts/CardAccountsListMobile';
import { MonthNavigator } from '@/components/Accounts/MonthNavigator';
import { MonthYearStepperMobile } from '@/components/Accounts/MonthYearStepperMobile';
import { AccountsFilters } from '@/components/Accounts/AccountsFilters';
import { Input } from '@/components/ui/input';
import { useCardAccounts, CardAccount, CardAccountFormData } from '@/hooks/useCardAccounts';
import { useAccountsReminder } from '@/hooks/useAccountsReminder';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';

const CardAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CardAccount | undefined>();
  const [isShowingAll, setIsShowingAll] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Estado do mês/ano atual
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Reset state quando a página é montada ou quando a location muda
  useEffect(() => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSearchTerm('');
    setStatusFilter('todos');
    setTypeFilter('todos');
    setMonthFilter(today.getMonth().toString());
    setYearFilter(today.getFullYear().toString());
    setIsShowingAll(false);
  }, [location.key]);

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos'); // Sempre despesa para cartões
  const [monthFilter, setMonthFilter] = useState(today.getMonth().toString());
  const [yearFilter, setYearFilter] = useState(today.getFullYear().toString());

  const {
    cardAccounts,
    loading,
    createCardAccount,
    updateCardAccount,
    updateCardAccountStatus,
    deleteCardAccount,
    isCreating,
    isUpdating,
    isUpdatingStatus,
    isDeleting
  } = useCardAccounts();

  // Ativar lembretes para contas de cartão
  const cardAccountsForReminder = cardAccounts.map(account => ({
    id: account.id,
    description: account.description,
    amount: account.amount,
    dueDate: account.due_date,
    status: account.status === 'pago' ? 'pago' as const : account.status === 'recebido' ? 'recebido' as const : 'pendente' as const,
    type: account.type || 'despesa' as const,
    category: account.category_name || 'Sem categoria',
    payment_source_name: account.payment_source_name || '',
    created_at: account.created_at,
    updated_at: account.updated_at,
    user_id: '',
    payment_source_id: account.payment_source_id,
    payment_source: 'bank' as const,
    data_conta: account.data_conta,
    creditcards_id: account.card_id,
    bank_id: null,
    recorrente_id: null,
    parcela: null
  }));

  useAccountsReminder(cardAccountsForReminder);

  // Toast de aviso quando faltar 1 dia para vencer
  useEffect(() => {
    if (cardAccounts.length === 0) return;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const pendingAccounts = cardAccounts.filter(account => account.status === 'pendente');
    
    if (pendingAccounts.length === 0) return;

    // Encontrar contas que vencem em 1 dia
    const accountsDueIn1Day = pendingAccounts.filter(account => {
      const [todayYear, todayMonth, todayDay] = todayStr.split('-').map(Number);
      const [dueYear, dueMonth, dueDay] = account.due_date.split('-').map(Number);
      
      const todayDate = new Date(todayYear, todayMonth - 1, todayDay);
      const dueDate = new Date(dueYear, dueMonth - 1, dueDay);
      
      const diffTime = dueDate.getTime() - todayDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays === 1;
    });

    console.log('CardAccounts toast debug', {
      todayStr,
      pendingCount: pendingAccounts.length,
      dueIn1DayCount: accountsDueIn1Day.length,
    });

    if (accountsDueIn1Day.length > 0) {
      toast({
        title: "⚠️ Aviso de Vencimento",
        description: "Há contas de cartões a vencer. Verifique!",
        duration: 2000,
      });
    }
  }, [cardAccounts, toast]);

  // Filtros
  const filteredCardAccounts = cardAccounts.filter(account => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      searchTerm === '' ||
      account.description.toLowerCase().includes(searchLower) ||
      account.category_name?.toLowerCase().includes(searchLower) ||
      account.payment_source_name?.toLowerCase().includes(searchLower) ||
      account.card_name?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'todos' || account.status === statusFilter;

    const accountDate = new Date(account.due_date);
    const accountMonth = accountDate.getMonth();
    const accountYear = accountDate.getFullYear();

    const matchesMonth = isShowingAll || monthFilter === 'todos' || accountMonth === parseInt(monthFilter);
    const matchesYear = isShowingAll || yearFilter === 'todos' || accountYear === parseInt(yearFilter);

    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  });

  // Ações
  const handleOpenModal = (account?: CardAccount) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(undefined);
  };

  const handleSubmit = (data: CardAccountFormData) => {
    if (editingAccount) {
      updateCardAccount({ id: editingAccount.id, data });
    } else {
      createCardAccount(data);
    }
    handleCloseModal();
  };

  const handleStatusChange = (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    updateCardAccountStatus({ id, status });
  };

  const handleDelete = (id: number) => {
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      deleteCardAccount(accountToDelete);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setAccountToDelete(null);
  };

  // Renderização mobile vs desktop
  if (isMobile) {
    return (
      <Layout key={`card-accounts-mobile-${location.pathname}`}>
        <div className="space-y-4 p-4">
          {/* Botões de ação */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Menu className="h-5 w-5" />
              Menu Principal
            </Button>

            <Button
              onClick={() => handleOpenModal()}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              <Plus size={18} className="mr-2" />
              Nova Conta
            </Button>
          </div>

          {/* Campo de pesquisa e filtro de status */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Pesquisar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="recebido">Recebido</option>
            </select>
          </div>

          {/* Navegador de mês e ano compacto */}
          <MonthYearStepperMobile
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={(startDate, endDate, month, year) => {
              setCurrentMonth(month);
              setCurrentYear(year);
              setMonthFilter(month.toString());
              setYearFilter(year.toString());
              setIsShowingAll(false);
            }}
            isShowingAll={isShowingAll}
          />

          {/* Cards de resumo compactos */}
          {!loading && (
            <CardAccountsSummaryCardsMobile 
              cardAccounts={filteredCardAccounts} 
              totalFound={filteredCardAccounts.length}
            />
          )}

          {/* Lista simplificada de contas */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-lg text-slate-600">Carregando contas...</div>
            </div>
          ) : (
            <CardAccountsListMobile
              cardAccounts={filteredCardAccounts}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          )}

          {/* Modal */}
          <CardAccountFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            cardAccount={editingAccount}
            isLoading={isCreating || isUpdating}
          />

          {/* Diálogo de Confirmação de Exclusão */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelDelete}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Layout>
    );
  }

  // Versão Desktop
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header com Botão e Título */}
          <div className="flex items-start justify-between">
            {/* Botão totalmente à esquerda */}
            <Button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
            
            {/* Título alinhado acima do card "Total Pago" */}
            <div className="flex-1 ml-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div></div>
                <div className="text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Contas Cartões
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Gerencie suas contas de cartões de crédito
                  </p>
                </div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>

          {!loading && (
            <CardAccountsSummaryCards 
              cardAccounts={filteredCardAccounts} 
              totalFound={filteredCardAccounts.length}
            />
          )}

          {/* Filtros */}
          <AccountsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            accounts={filteredCardAccounts}
          />

          {/* Navegador de Mês */}
          <MonthNavigator
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={(startDate, endDate, month, year) => {
              setCurrentMonth(month);
              setCurrentYear(year);
              setMonthFilter(month.toString());
              setYearFilter(year.toString());
              setIsShowingAll(false);
            }}
            onShowAll={() => {
              setIsShowingAll(!isShowingAll);
              if (!isShowingAll) {
                setMonthFilter('todos');
                setYearFilter('todos');
              } else {
                setMonthFilter(currentMonth.toString());
                setYearFilter(currentYear.toString());
              }
            }}
            isShowingAll={isShowingAll}
          />

          {/* Tabela */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="text-lg text-slate-600">Carregando contas...</div>
              </div>
            ) : (
              <CardAccountsTable
                cardAccounts={filteredCardAccounts}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                isDeleting={isDeleting}
              />
            )}
          </div>

          {/* Modal */}
          <CardAccountFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmit}
            cardAccount={editingAccount}
            isLoading={isCreating || isUpdating}
          />

          {/* Diálogo de Confirmação de Exclusão */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelDelete}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Layout>
  );
};

export default CardAccounts;
