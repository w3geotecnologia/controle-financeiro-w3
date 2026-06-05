
import React from 'react';
import { Plus, CreditCard, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreditCardsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewCard: () => void;
}

export const CreditCardsHeader: React.FC<CreditCardsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onNewCard
}) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Controle de Cartões</h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">João Silva</span>
        </div>
      </div>

      {/* Título principal e ações */}
      <div className="space-y-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Meus Cartões de Crédito</h2>
          <p className="text-gray-600 mt-1">Gerencie seus cartões e acompanhe seus gastos</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={onNewCard} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Cartão
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar cartões..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>
    </>
  );
};
