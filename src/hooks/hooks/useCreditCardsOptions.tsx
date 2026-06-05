
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CreditCardOption {
  id: string;
  name: string;
  current_value: number;
  credit_limit: number;
}

export function useCreditCardsOptions() {
  const {
    data: cards = [],
    isLoading,
    error,
    refetch
  } = useQuery<CreditCardOption[]>({
    queryKey: ['creditcards-options'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Usuário não autenticado');

      console.log('useCreditCardsOptions: Buscando cartões para usuário:', user.id);

      const { data, error } = await supabase
        .from('creditcards')
        .select('id, card_name, current_value, credit_limit')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('card_name');

      if (error) {
        console.error('useCreditCardsOptions: Erro ao carregar cartões:', error);
        throw error;
      }

      console.log('useCreditCardsOptions: Dados brutos do banco:', data);

      const transformedData = (data || []).map(card => ({
        id: String(card.id),
        name: card.card_name,
        current_value: card.current_value ?? 0,
        credit_limit: card.credit_limit ?? 0
      }));

      console.log('useCreditCardsOptions: Dados transformados:', transformedData);

      return transformedData;
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // Reduzido para 30 segundos para atualização mais frequente
    gcTime: 300000,
    retry: 1
  });

  return {
    cards,
    loading: isLoading,
    error,
    refetch,
    cardsOptions: cards
  };
}
