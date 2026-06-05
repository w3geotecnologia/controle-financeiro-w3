
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

export interface CardOption {
    id: string;
    name: string;
    current_value: number;
}

export function useCardsOptions() {
    const {
        data: cards = [],
        isLoading,
        error,
        refetch
    } = useQuery<CardOption[]>({
        queryKey: ['creditcards-options'],
        queryFn: async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error('Usuário não autenticado');

            console.log('useCardsOptions: Buscando cartões para usuário:', user.id);

            const { data, error } = await supabase
                .from('creditcards')
                .select('id, card_name, current_value')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .order('card_name');

            if (error) {
                console.error('useCardsOptions: Erro ao carregar cartões:', error);
                throw error;
            }

            console.log('useCardsOptions: Dados brutos do banco:', data);

            const transformedData = (data || []).map(card => ({
                id: String(card.id),
                name: card.card_name,
                current_value: card.current_value ?? 0
            }));

            console.log('useCardsOptions: Dados transformados:', transformedData);

            return transformedData;
        },
        refetchOnWindowFocus: false,
        staleTime: 60000,
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
