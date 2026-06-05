
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Category {
  id: number;
  name: string;
  type: 'receita' | 'despesa';
  color: string;
}

export const useCategoriesData = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar categorias do Supabase com useCallback para evitar re-renders desnecessários
  const fetchCategories = useCallback(async () => {
    try {
      console.log('Iniciando carregamento de categorias...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar categorias do Supabase:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive"
        });
        setCategories([]);
        return;
      }

      console.log('Dados recebidos do Supabase:', data);

      // Transformar dados do Supabase
      const categories: Category[] = (data || []).map(category => ({
        id: category.id,
        name: category.name,
        type: category.type as 'receita' | 'despesa',
        color: category.color
      }));

      setCategories(categories);
      console.log('Categorias carregadas com sucesso:', categories.length, 'categorias');
    } catch (error) {
      console.error('Erro inesperado ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar as categorias.",
        variant: "destructive"
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Adicionar nova categoria
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      console.log('Adicionando nova categoria:', categoryData);
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name,
          type: categoryData.type,
          color: categoryData.color,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar categoria:', error);
        toast({
          title: "Erro",
          description: "Não foi possível criar a categoria.",
          variant: "destructive"
        });
        return;
      }

      // Transformar e adicionar à lista local
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        type: data.type as 'receita' | 'despesa',
        color: data.color
      };

      setCategories(prev => [newCategory, ...prev]);
      
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso.",
      });
    } catch (error) {
      console.error('Erro inesperado ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar a categoria.",
        variant: "destructive"
      });
    }
  };

  // Atualizar categoria
  const updateCategory = async (updatedCategory: Category) => {
    try {
      console.log('Atualizando categoria:', updatedCategory);
      
      const { error } = await supabase
        .from('categories')
        .update({
          name: updatedCategory.name,
          type: updatedCategory.type,
          color: updatedCategory.color
        })
        .eq('id', updatedCategory.id);

      if (error) {
        console.error('Erro ao atualizar categoria:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a categoria.",
          variant: "destructive"
        });
        return;
      }

      setCategories(prev => prev.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      ));

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro inesperado ao atualizar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar a categoria.",
        variant: "destructive"
      });
    }
  };

  // Deletar categoria
  const deleteCategory = async (id: number) => {
    try {
      console.log('Deletando categoria ID:', id);
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar categoria:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a categoria.",
          variant: "destructive"
        });
        return;
      }

      setCategories(prev => prev.filter(cat => cat.id !== id));

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro inesperado ao deletar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao excluir a categoria.",
        variant: "destructive"
      });
    }
  };

  // Carregar categorias ao montar o componente
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories
  };
};
