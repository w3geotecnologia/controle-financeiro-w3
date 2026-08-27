import React, { useState, useEffect } from 'react';
import { Home, Plus, Menu } from 'lucide-react';
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
import { CardAccountsListMobile } from '@/components/CardAccounts/CardAccountsListMobile';
import { CardAccountsFilters } from '@/components/CardAccounts/CardAccountsFilters';
import { useCardAccounts, CardAccount, CardAccountFormData } from '@/hooks/useCardAccounts';
import { useAccountsReminder } from '@/hooks/useAccountsReminder';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate, useLocation } from 'react-router-dom';

const CardAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CardAccount | undefined>();
  const [cardFilter, setCardFilter] = useState('todos');
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth()));
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const today = new Date();

  // Reset state quando a página é montada ou quando a location muda
  useEffect(() => {
    const today = new Date();
    setSearchTerm('');
    setStatusFilter('todos');
    setCardFilter('todos');
    setMonthFilter(String(today.getMonth()));
    setYearFilter(String(today.getFullYear()));
  }, [location.key]);

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

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
    const matchesCard = cardFilter === 'todos' || String(account.card_id) === cardFilter;

    const accountDate = new Date(account.due_date);
    const matchesMonth = monthFilter === 'todos' || accountDate.getMonth() === Number(monthFilter);
    const matchesYear = yearFilter === 'todos' || accountDate.getFullYear() === Number(yearFilter);
    return matchesSearch && matchesStatus && matchesCard && matchesMonth && matchesYear;
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
          {/* =====================================================
              CABEÇALHO
          ===================================================== */}
          <div className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            justify-between
            gap-4
            px-1
          ">
            <div>
              {/* =================================================
                  PAINEL FINANCEIRO
                  Degradê azul → azul/verde → verde
              ================================================= */}
              <h1 className="
                text-2xl
                sm:text-3xl
                font-bold
                bg-gradient-to-r
                from-[#2563EB]
                via-[#1687B0]
                to-[#16A34A]
                bg-clip-text
                text-transparent
              ">
                Painel Contas Cartão
              </h1>

              <p className="
                text-sm
                text-[#475569]
                mt-0.5
              ">
                Visão geral da suas contas com Cartão
              </p>
            </div>
          </div>

          <CardAccountsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            cardFilter={cardFilter}
            setCardFilter={setCardFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            actionSlot={
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full sm:w-auto h-10 px-4 flex items-center justify-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-blue-300"
                >
                  <Menu className="h-5 w-5 text-blue-600" />
                  Menu Financeiro
                </Button>
              <Button
                type="button"
                onClick={() => handleOpenModal()}
                className="w-full sm:w-auto h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-sm transition-all hover:bg-slate-50 hover:border-blue-300"
              >
                <Plus className="h-4 w-4 text-blue-600" />
                <span>Nova Conta</span>
              </Button>
              </div>
            }
          />

          <p className="text-sm text-slate-600 px-1" aria-live="polite">
            {filteredCardAccounts.length} {filteredCardAccounts.length === 1 ? 'conta encontrada' : 'contas encontradas'}
          </p>

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
          {/* =====================================================
              CABEÇALHO
          ===================================================== */}
          <div className="flex flex-wrap items-center justify-start gap-4 px-1">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#2563EB] via-[#1687B0] to-[#16A34A] bg-clip-text text-transparent">
                Painel Contas Cartão
              </h1>
              <p className="text-sm text-[#475569] mt-0.5">
                Visão geral da suas contas com Cartão
              </p>
            </div>

            <Button
              onClick={() => navigate('/')}
              variant="outline"
              title="Voltar para a Homepage"
              aria-label="Voltar para a Homepage"
              className="shrink-0 h-10 px-4 inline-flex items-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 hover:border-blue-300"
            >
              <Home className="h-4 w-4 text-blue-600" />
              <span>Menu Financeiro</span>
            </Button>

            <Button
              type="button"
              onClick={() => handleOpenModal()}
              className="shrink-0 h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white border border-slate-200 text-slate-700 font-medium shadow-sm hover:bg-slate-50 hover:border-blue-300"
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Nova Conta</span>
            </Button>
          </div>

          {/* Filtros */}
          <CardAccountsFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            cardFilter={cardFilter}
            setCardFilter={setCardFilter}
            monthFilter={monthFilter}
            setMonthFilter={setMonthFilter}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
          />

          <p className="text-sm text-slate-600 px-1" aria-live="polite">
            {filteredCardAccounts.length} {filteredCardAccounts.length === 1 ? 'conta encontrada' : 'contas encontradas'}
          </p>

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
