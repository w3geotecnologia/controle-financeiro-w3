
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CreditCard {
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

export interface CreditCardInput {
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

function formatCardNumber(value: string) {
  return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim().slice(0, 19);
}

function formatExpiryDate(value: string) {
  // Converte de YYYY-MM para MM/YYYY
  if (value.includes('-')) {
    const [year, month] = value.split('-');
    return `${month}/${year}`;
  }
  return value;
}

export function useCreditCards() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Buscar cartões usando React Query
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
        .from("creditcards")
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar cartões:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Criar cartão usando React Query Mutation

  const createCreditCardMutation = useMutation({
    mutationFn: async (card: CreditCardInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const formattedCard = {
        ...card,
        card_number: formatCardNumber(card.card_number),
        expiry_date: formatExpiryDate(card.expiry_date),
        user_id: user.id,
        card_brand: card.card_brand || 'visa',
        credit_limit: card.credit_limit || 0,
        current_value: card.current_value || 0,
        is_active: true,
      };

      const { data, error } = await supabase
        .from("creditcards")
        .insert([formattedCard])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creditcards'] });
    },
    onError: (error) => {
      console.error('Erro ao criar cartão:', error);
    }
  });

  // Atualizar cartão usando React Query Mutation
  const updateCreditCardMutation = useMutation({
    mutationFn: async ({ id, card }: { id: number; card: CreditCardInput }) => {
      const formattedCard = {
        ...card,
        card_number: formatCardNumber(card.card_number),
        expiry_date: formatExpiryDate(card.expiry_date),
        card_brand: card.card_brand || 'visa',
        credit_limit: card.credit_limit || 0,
        current_value: card.current_value || 0,
      };

      const { data, error } = await supabase
        .from("creditcards")
        .update(formattedCard)
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
    },
    onError: (error) => {
      console.error('Erro ao atualizar cartão:', error);
    }
  });

  // Deletar cartão usando React Query Mutation
  const deleteCreditCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("creditcards")
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return id;
    },
    onSuccess: () => {
     
    },
    onError: (error) => {
      console.error('Erro ao excluir cartão:', error);
    }
  });

  // Funções wrapper para manter compatibilidade
  const createCreditCard = async (card: CreditCardInput) => {
    setIsCreating(true);
    try {
      await createCreditCardMutation.mutateAsync(card);
    } finally {
      setIsCreating(false);
    }
  };

  const updateCreditCard = async (id: number, card: CreditCardInput) => {
    setIsUpdating(true);
    try {
      await updateCreditCardMutation.mutateAsync({ id, card });
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteCreditCard = async (id: number) => {
    setIsDeleting(true);
    try {
      await deleteCreditCardMutation.mutateAsync(id);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    creditCards,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    refetch,
  };
}
