
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ExpiredInvestment {
  id: number;
  name: string;
  invested_amount: number;
  current_value: number;
  yield_percentage: number | null;
  purchase_date: string;
  maturity_date: string | null;
  investor_name?: string | null;
  institution_id: number;
  type_id: number;
  moved_at: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useExpiredInvestments = () => {
  const [expiredInvestments, setExpiredInvestments] = useState<ExpiredInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchExpiredInvestments = async () => {
    if (!user) {
      console.log('fetchExpiredInvestments: no user, skipping');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investimentos_vencidos')
        .select('*')
        .eq('user_id', user.id)
        .order('moved_at', { ascending: false });

      if (error) {
        console.error('fetchExpiredInvestments error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os investimentos vencidos.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Expired investments loaded:', data);
      setExpiredInvestments(data || []);
    } catch (error) {
      console.error('Erro ao buscar investimentos vencidos:', error);
      toast({
        title: "Erro", 
        description: "Erro ao carregar investimentos vencidos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteExpiredInvestment = async (id: number) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('investimentos_vencidos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('deleteExpiredInvestment error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o investimento vencido.",
          variant: "destructive"
        });
        return;
      }
      
      await fetchExpiredInvestments();
      toast({
        title: "Sucesso",
        description: "Investimento vencido removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao excluir investimento vencido:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir investimento vencido",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchExpiredInvestments();
  }, [user]);

  return {
    expiredInvestments,
    loading,
    deleteExpiredInvestment,
    refetch: fetchExpiredInvestments
  };
};
