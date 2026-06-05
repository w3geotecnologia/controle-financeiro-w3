
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Deposit {
  id: number;
  bank_id: number;
  user_id: string;
  amount: number;
  deposit_date: string;
  description?: string;
  origin_bank?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DepositInput {
  bank_id: number;
  amount: number;
  deposit_date: string;
  description?: string;
  origin_bank?: string;
  receipt_url?: string;
}

export const useDepositsData = (bankId?: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar depósitos (todos ou de um banco específico)
  const {
    data: deposits = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['deposits', bankId],
    queryFn: async () => {
      let query = supabase
        .from('deposits')
        .select('*')
        .order('deposit_date', { ascending: false });

      if (bankId) {
        query = query.eq('bank_id', bankId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar depósitos:', error);
        throw error;
      }

      return data as Deposit[];
    }
  });

  // Criar novo depósito
  const createDepositMutation = useMutation({
    mutationFn: async (depositData: DepositInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('deposits')
        .insert({
          ...depositData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar depósito:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      queryClient.invalidateQueries({ queryKey: ['banks'] });
      toast({
        title: "Depósito registrado com sucesso!",
        description: "O depósito foi registrado e o saldo foi atualizado.",
      });
    },
    onError: (error) => {
      console.error('Erro ao registrar depósito:', error);
      toast({
        title: "Erro ao registrar depósito",
        description: "Não foi possível registrar o depósito. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  return {
    deposits,
    isLoading,
    error,
    refetch,
    createDeposit: createDepositMutation.mutate,
    isCreating: createDepositMutation.isPending,
  };
};
