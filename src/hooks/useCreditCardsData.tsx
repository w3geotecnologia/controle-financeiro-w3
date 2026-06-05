
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CreditCardData {
  id: number;
  user_id: string;
  card_name: string;
  card_number: string;
  holder_name: string;
  expiry_date: string;
  due_date?: string;
  credit_limit: number;
  current_value: number;
  bank_name?: string;
  card_brand: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  color?: string;
}

export interface CreditCardFormData {
  card_name: string;
  card_number: string;
  holder_name: string;
  expiry_date: string;
  due_date?: string;
  credit_limit: number;
  current_value: number;
  bank_name?: string;
  card_brand?: string;
  color?: string;
}

export function useCreditCardsData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: creditCards = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['creditcards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('creditcards')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar cartões:', error);
        throw error;
      }
      
      return data as CreditCardData[];
    }
  });

  const createCardMutation = useMutation({
    mutationFn: async (cardData: CreditCardFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('creditcards')
        .insert({
          ...cardData,
          user_id: user.id,
          card_brand: cardData.card_brand || 'visa',
          credit_limit: cardData.credit_limit || 0,
          current_value: cardData.current_value || 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Cartão criado com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao criar cartão:', error);
      toast({
        title: "Erro ao criar cartão",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const updateCardMutation = useMutation({
    mutationFn: async ({ id, cardData }: { id: number; cardData: CreditCardFormData }) => {
      const { data, error } = await supabase
        .from('creditcards')
        .update({
          ...cardData,
          card_brand: cardData.card_brand || 'visa',
          credit_limit: cardData.credit_limit || 0,
          current_value: cardData.current_value || 0,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Cartão atualizado com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar cartão:', error);
      toast({
        title: "Erro ao atualizar cartão",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('creditcards')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
      toast({
        title: "Cartão excluído com sucesso!",
        duration: 2000,
      });
    },
    onError: (error) => {
      console.error('Erro ao excluir cartão:', error);
      toast({
        title: "Erro ao excluir cartão",
        description: "Tente novamente",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  return {
    creditCards,
    isLoading,
    error,
    isCreating: createCardMutation.isPending,
    isUpdating: updateCardMutation.isPending,
    isDeleting: deleteCardMutation.isPending,
    createCard: createCardMutation.mutate,
    updateCard: updateCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
    refetch,
  };
}
