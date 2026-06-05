import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Loader2, ChevronDown, ChevronRight, Menu } from 'lucide-react';
import { useCategoriesData, Category } from '@/hooks/useCategoriesData';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

const Categorias: React.FC = () => {
  const { categories, loading, addCategory, updateCategory, deleteCategory, refreshCategories } = useCategoriesData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [formData, setFormData] = useState({ 
    name: '', 
    type: 'despesa' as 'receita' | 'despesa', 
    color: '#3B82F6'
  });
  
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const colorOptions = [
    '#3B82F6', '#10B981', '#EF4444', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
  ];

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return;
    }

    if (editingCategory) {
      await updateCategory({
        ...formData,
        id: editingCategory.id
      } as Category);
      toast({
        title: "Categoria atualizada com sucesso!",
        duration: 2000,
      });
    } else {
      await addCategory({
        name: formData.name,
        type: formData.type,
        color: formData.color
      });
      toast({
        title: "Categoria criada com sucesso!",
        duration: 2000,
      });
    }
    
    setIsModalOpen(false);
    setEditingCategory(undefined);
    setFormData({ name: '', type: 'despesa', color: '#3B82F6' });
    refreshCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ 
      name: category.name, 
      type: category.type, 
      color: category.color
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCategory(id);
    toast({
      title: "Categoria excluída com sucesso!",
      duration: 2000,
    });
    refreshCategories();
  };

  const handleNewCategory = () => {
    setEditingCategory(undefined);
    setFormData({ 
      name: '', 
      type: 'despesa', 
      color: '#3B82F6'
    });
    setIsModalOpen(true);
  };

  const renderCategory = (category: Category) => (
    <div 
      key={category.id}
      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
        category.type === 'receita' ? 'bg-green-50' : 'bg-red-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full" 
          style={{ backgroundColor: category.color }}
        />
        <span className="font-medium text-slate-800">
          {category.name}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(category)}
          className="hover:bg-blue-50"
        >
          <Edit size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(category.id)}
          className="hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );

  const receitaCategories = categories.filter(cat => cat.type === 'receita');
  const despesaCategories = categories.filter(cat => cat.type === 'despesa');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando categorias...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {isMobile && (
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="mb-4 flex items-center gap-2"
          >
            <Menu className="h-5 w-5" />
            Menu Principal
          </Button>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Categorias</h1>
            <p className="text-slate-600">Organize suas transações por categorias hierárquicas</p>
          </div>
          <Button
            onClick={() => handleNewCategory()}
            className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            <Plus size={20} className="mr-2" />
            Nova Categoria
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Despesas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              📂 Despesas
            </h2>
            <div className="space-y-3">
              {despesaCategories.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhuma categoria de despesa encontrada</p>
              ) : (
                despesaCategories.map(category => renderCategory(category))
              )}
            </div>
          </div>

          {/* Receitas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
            <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              💰 Receitas
            </h2>
            <div className="space-y-3">
              {receitaCategories.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Nenhuma categoria de receita encontrada</p>
              ) : (
                receitaCategories.map(category => renderCategory(category))
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-800">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-700">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Alimentação, Trabalho..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="type" className="text-slate-700">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'receita' | 'despesa') => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receita">Receita</SelectItem>
                      <SelectItem value="despesa">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-slate-700">Cor</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-slate-400' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                  >
                    {editingCategory ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Categorias;
