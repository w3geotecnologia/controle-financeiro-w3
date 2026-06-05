
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CardAccount {
  id: number;
  description: string;
  amount: number;
  due_date: string;
  category_id: number;
  card_id: number;
  status: 'pendente' | 'pago' | 'recebido';
  type: 'receita' | 'despesa';
  created_at: string;
  updated_at: string;
  payment_source?: string;
  payment_source_id?: number;
  payment_source_name?: string;
  data_conta?: string;
  category_name?: string;
  category_color?: string;
  card_name?: string;
}

export interface CardAccountFormData {
  description: string;
  amount: number;
  due_date: string;
  category_id: number;
  card_id: number;
  status: 'pendente' | 'pago' | 'recebido';
  type: 'receita' | 'despesa';
  payment_source: string;
  payment_source_id: number;
  payment_source_name: string;
  data_conta?: string;
}

export const useCardAccounts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar contas de cartões
  const {
    data: cardAccounts = [],
    isLoading,
    error,
    refetch
  } = useQuery<CardAccount[]>({
    queryKey: ['card-accounts'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Usuário não autenticado');

      console.log('useCardAccounts: Buscando contas de cartões para usuário:', user.id);

      const { data, error } = await supabase
        .from('card_accounts')
        .select(`
          *,
          categories!category_id (
            name,
            color
          ),
          creditcards!card_id (
            card_name
          )
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: false });

      if (error) {
        console.error('useCardAccounts: Erro ao carregar contas:', error);
        throw error;
      }

      console.log('useCardAccounts: Dados brutos:', data);

      const transformedData = (data || []).map(account => ({
        id: account.id,
        description: account.description,
        amount: account.amount,
        due_date: account.due_date,
        category_id: account.category_id,
        card_id: account.card_id,
        status: account.status as 'pendente' | 'pago' | 'recebido',
        type: (account.type || 'despesa') as 'receita' | 'despesa',
        created_at: account.created_at,
        updated_at: account.updated_at,
        payment_source: account.payment_source,
        payment_source_id: account.payment_source_id,
        payment_source_name: account.payment_source_name,
        data_conta: account.data_conta,
        category_name: account.categories?.name,
        category_color: account.categories?.color,
        card_name: account.creditcards?.card_name
      }));

      console.log('useCardAccounts: Dados transformados:', transformedData);
      return transformedData;
    },
    refetchOnWindowFocus: false,
    staleTime: 60000,
    gcTime: 300000,
    retry: 1
  });

  // Criar conta
  const createCardAccount = useMutation({
    mutationFn: async (data: CardAccountFormData) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Usuário não autenticado');

      console.log('useCardAccounts: Criando conta:', data);

      const { data: result, error } = await supabase
        .from('card_accounts')
        .insert([{
          ...data,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('useCardAccounts: Erro ao criar conta:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards-options'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] }); // Invalidar também a query principal dos cartões
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('useCardAccounts: Erro ao criar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta.",
        variant: "destructive"
      });
    }
  });

  // Atualizar conta
  const updateCardAccount = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CardAccountFormData }) => {
      console.log('useCardAccounts: Atualizando conta:', id, data);

      const { data: result, error } = await supabase
        .from('card_accounts')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useCardAccounts: Erro ao atualizar conta:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards-options'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('useCardAccounts: Erro ao atualizar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conta.",
        variant: "destructive"
      });
    }
  });

  // Atualizar status da conta
  const updateCardAccountStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'pendente' | 'pago' | 'recebido' }) => {
      console.log('useCardAccounts: Atualizando status da conta:', id, status);

      const { data: result, error } = await supabase
        .from('card_accounts')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useCardAccounts: Erro ao atualizar status:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards-options'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('useCardAccounts: Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive"
      });
    }
  });

  // Deletar conta
  const deleteCardAccount = useMutation({
    mutationFn: async (id: number) => {
      console.log('useCardAccounts: Deletando conta:', id);

      const { error } = await supabase
        .from('card_accounts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useCardAccounts: Erro ao deletar conta:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards-options'] });
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso.",
      });
    },
    onError: (error) => {
      console.error('useCardAccounts: Erro ao deletar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta.",
        variant: "destructive"
      });
    }
  });

  return {
    cardAccounts,
    loading: isLoading,
    error,
    refetch,
    createCardAccount: createCardAccount.mutate,
    updateCardAccount: updateCardAccount.mutate,
    updateCardAccountStatus: updateCardAccountStatus.mutate,
    deleteCardAccount: deleteCardAccount.mutate,
    isCreating: createCardAccount.isPending,
    isUpdating: updateCardAccount.isPending,
    isUpdatingStatus: updateCardAccountStatus.isPending,
    isDeleting: deleteCardAccount.isPending
  };
};
