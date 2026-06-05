import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Bank {
  id: number;
  user_id: string;
  name: string;
  agency: string;
  account_number: string;
  account_type: string;
  nickname?: string;
  balance: number;
  created_at: string;
  updated_at: string;
  color?: string;
}

export interface BankInput {
  name: string;
  agency: string;
  account_number: string;
  account_type: string;
  nickname?: string;
  color?: string;
}

export function useBanksData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar bancos
  const {
    data: banks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['banks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar bancos:', error);
        throw error;
      }

      return data as Bank[];
    }
  });

  // Criar novo banco
  const createBankMutation = useMutation({
    mutationFn: async (bankData: BankInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('banks')
        .insert({
          ...bankData,
          user_id: user.id,
          balance: 0 // Saldo inicial
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar banco:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast({
        title: "Banco criado com sucesso!",
        description: "O banco foi adicionado à sua lista.",
      });
    },
    onError: (error) => {
      console.error('Erro ao criar banco:', error);
      toast({
        title: "Erro ao criar banco",
        description: "Não foi possível criar o banco. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Atualizar banco
  const updateBankMutation = useMutation({
    mutationFn: async (bankData: BankInput & { id: number }) => {
      const { data, error } = await supabase
        .from('banks')
        .update(bankData)
        .eq('id', bankData.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar banco:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast({
        title: "Banco atualizado com sucesso!",
        description: "As informações do banco foram atualizadas.",
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar banco:', error);
      toast({
        title: "Erro ao atualizar banco",
        description: "Não foi possível atualizar o banco. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Deletar banco
  const deleteBankMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('banks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar banco:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast({
        title: "Banco excluído com sucesso!",
        description: "O banco foi removido da sua lista.",
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar banco:', error);
      toast({
        title: "Erro ao excluir banco",
        description: "Não foi possível excluir o banco. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  return {
    banks,
    isLoading,
    error,
    isCreating: createBankMutation.isPending,
    isUpdating: updateBankMutation.isPending,
    isDeleting: deleteBankMutation.isPending,
    createBank: createBankMutation.mutate,
    updateBank: updateBankMutation.mutate,
    deleteBank: deleteBankMutation.mutate,
    refetch,
  };
}