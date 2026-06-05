import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RefreshCw } from 'lucide-react';
import { Category } from '@/hooks/useCategoriesData';

interface CategorySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  categories: Category[];
  accountType: 'receita' | 'despesa';
  onRefresh: () => void;
  onAddCategory?: (categoryData: { name: string; type: 'receita' | 'despesa'; color: string }) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onValueChange,
  categories,
  accountType,
  onRefresh,
  onAddCategory
}) => {
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const filteredCategories = categories.filter(cat => cat.type === accountType);

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim() || !onAddCategory) return;

    const defaultColors = {
      receita: '#10B981',
      despesa: '#EF4444'
    };

    try {
      await onAddCategory({
        name: newCategoryName.trim(),
        type: accountType,
        color: defaultColors[accountType]
      });
      
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      onValueChange(newCategoryName.trim());
      
      setTimeout(() => {
        onRefresh();
      }, 100);
      
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewCategory();
    }
    if (e.key === 'Escape') {
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-slate-700 font-medium">Categoria</Label>
        <div className="flex gap-1">
          {onAddCategory && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowNewCategoryInput(true)}
              className="h-8 px-2 text-xs"
              title="Adicionar nova categoria"
            >
              <Plus size={14} className="mr-1" />
              Nova
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 px-2 text-xs"
            title="Atualizar lista de categorias"
          >
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {/* Input para nova categoria */}
      {showNewCategoryInput && (
        <div className="flex gap-2 p-3 bg-slate-50 rounded-lg">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Nova categoria de ${accountType}`}
            className="flex-1"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddNewCategory}
            disabled={!newCategoryName.trim()}
            className="px-3"
          >
            Adicionar
          </Button>
        </div>
      )}

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={`Selecione uma categoria de ${accountType}`} />
        </SelectTrigger>
        <SelectContent>
          {filteredCategories.map(category => (
            <SelectItem key={category.id} value={category.name}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value && (
        <div className="text-sm text-slate-600 bg-blue-50 p-2 rounded-lg">
          <strong>Selecionado:</strong> {value}
        </div>
      )}
    </div>
  );
};