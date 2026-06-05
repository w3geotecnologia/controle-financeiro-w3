
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Investment {
  id: number;
  institution_id: number;
  type_id: number;
  name: string;
  invested_amount: number;
  current_value: number;
  yield_percentage: number | null;
  purchase_date: string;
  maturity_date?: string | null;
  investor_name?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  institution?: {
    id: number;
    name: string;
  };
  type?: {
    id: number;
    name: string;
    category: string;
  };
}

export interface InvestmentInstitution {
  id: number;
  name: string;
  user_id: string;
}

export interface InvestmentType {
  id: number;
  name: string;
  category: string;
  user_id: string;
}

export const useInvestmentsData = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [institutions, setInstitutions] = useState<InvestmentInstitution[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchInvestments = async () => {
    if (!user) {
      console.log('fetchInvestments: no user, skipping');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          institution:investment_institutions(id, name),
          type:investment_types(id, name, category)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('fetchInvestments error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os investimentos.",
          variant: "destructive"
        });
        return;
      }
      
      setInvestments(data || []);
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      toast({
        title: "Erro", 
        description: "Erro ao carregar investimentos",
        variant: "destructive"
      });
    }
  };

  const fetchInstitutions = async () => {
    if (!user) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investment_institutions')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('fetchInstitutions error:', error);
        return;
      }
      
      setInstitutions(data || []);
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
    }
  };

  const fetchInvestmentTypes = async () => {
    if (!user) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investment_types')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.eq.00000000-0000-0000-0000-000000000000`)
        .order('name');

      if (error) {
        console.error('fetchInvestmentTypes error:', error);
        return;
      }
      
      setInvestmentTypes(data || []);
    } catch (error) {
      console.error('Erro ao buscar tipos:', error);
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investments')
        .insert([{ ...investment, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('addInvestment error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o investimento.",
          variant: "destructive"
        });
        return;
      }
      
      await fetchInvestments();
      toast({
        title: "Sucesso",
        description: "Investimento adicionado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao adicionar investimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar investimento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateInvestment = async (updates: Partial<Investment> & { id: number }) => {
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
        .from('investments')
        .update(updates)
        .eq('id', updates.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('updateInvestment error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o investimento.",
          variant: "destructive"
        });
        return;
      }
      
      await fetchInvestments();
      toast({
        title: "Sucesso",
        description: "Investimento atualizado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar investimento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteInvestment = async (id: number) => {
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
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('deleteInvestment error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover o investimento.",
          variant: "destructive"
        });
        return;
      }
      
      await fetchInvestments();
      toast({
        title: "Sucesso",
        description: "Investimento removido com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover investimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover investimento",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addInstitution = async (name: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investment_institutions')
        .insert([{ name, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('addInstitution error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar a instituição.",
          variant: "destructive"
        });
        return;
      }
      
      await fetchInstitutions();
      toast({
        title: "Sucesso",
        description: "Instituição adicionada com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao adicionar instituição:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar instituição",
        variant: "destructive"
      });
      throw error;
    }
  };

  const addInvestmentType = async (name: string, category: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('investment_types')
        .insert([{ name, category, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('addInvestmentType error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o tipo.",
          variant: "destructive"
        });
        return;
      }
      
      await fetchInvestmentTypes();
      toast({
        title: "Sucesso",
        description: "Tipo de investimento adicionado com sucesso!",
      });
      return data;
    } catch (error) {
      console.error('Erro ao adicionar tipo:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar tipo",
        variant: "destructive"
      });
      throw error;
    }
  };

  const moveExpiredInvestments = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return 0;
    }

    try {
      const { data, error } = await supabase.rpc('move_expired_investments', {
        target_user_id: user.id
      });

      if (error) {
        console.error('moveExpiredInvestments error:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover as aplicações vencidas.",
          variant: "destructive"
        });
        return 0;
      }

      await fetchInvestments();
      toast({
        title: "Sucesso",
        description: `${data || 0} aplicações vencidas foram removidas com sucesso!`,
      });
      
      return data || 0;
    } catch (error) {
      console.error('Erro ao mover investimentos vencidos:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover aplicações vencidas",
        variant: "destructive"
      });
      return 0;
    }
  };

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchInvestments(),
          fetchInstitutions(),
          fetchInvestmentTypes()
        ]);
        setLoading(false);
      };
      
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    investments,
    institutions,
    investmentTypes,
    loading,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    addInstitution,
    addInvestmentType,
    moveExpiredInvestments,
    refetch: () => Promise.all([fetchInvestments(), fetchInstitutions(), fetchInvestmentTypes()])
  };
};
