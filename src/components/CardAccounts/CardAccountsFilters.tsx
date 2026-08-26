import React from 'react';
import { CreditCard, Filter, List, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCardsOptions } from '@/hooks/useCardsOptions';

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface CardAccountsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  cardFilter: string;
  setCardFilter: (value: string) => void;
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  yearFilter: string;
  setYearFilter: (value: string) => void;
  actionSlot?: React.ReactNode;
}

export const CardAccountsFilters: React.FC<CardAccountsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  cardFilter,
  setCardFilter,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  actionSlot,
}) => {
  const { cards } = useCardsOptions();
  const today = new Date();

  const handleMonth = (month: number) => {
    setMonthFilter(String(month));
    setYearFilter(String(today.getFullYear()));
  };

  const handleToday = () => {
    setMonthFilter(String(today.getMonth()));
    setYearFilter(String(today.getFullYear()));
  };

  const handleAnnual = () => {
    setMonthFilter('todos');
    setYearFilter(String(today.getFullYear()));
  };

  const handleAll = () => {
    setMonthFilter('todos');
    setYearFilter('todos');
  };

  const isToday = monthFilter === String(today.getMonth()) && yearFilter === String(today.getFullYear());
  const isAnnual = monthFilter === 'todos' && yearFilter !== 'todos';
  const isAll = monthFilter === 'todos' && yearFilter === 'todos';

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap items-stretch sm:items-center">
        <Select value={cardFilter} onValueChange={setCardFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <CreditCard size={16} className="mr-2" />
            <SelectValue placeholder="Todos os Cartões" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Cartões</SelectItem>
            {cards.map((card) => (
              <SelectItem key={card.id} value={String(card.id)}>{card.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Todos os Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="recebido">Recebido</SelectItem>
          </SelectContent>
        </Select>

        {actionSlot}
      </div>

      <div className="border border-input rounded-md p-3 flex items-center gap-2 flex-wrap">
        <CalendarIcon size={16} className="text-slate-500 mr-1" />
        {MONTHS_SHORT.map((label, index) => {
          const isActive = monthFilter === String(index) && yearFilter !== 'todos';
          return (
            <Button
              key={label}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleMonth(index)}
              className={`h-8 px-3 text-xs rounded-full ${isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-blue-50 hover:border-blue-300'}`}
            >
              {label}
            </Button>
          );
        })}
        <div className="mx-1 h-6 w-px bg-slate-200" />
        <Button type="button" variant={isToday ? 'default' : 'outline'} size="sm" onClick={handleToday} className={`h-8 px-3 text-xs rounded-full gap-1 ${isToday ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'}`}>
          <CalendarIcon size={12} /> Hoje
        </Button>
        <Button type="button" variant={isAnnual ? 'default' : 'outline'} size="sm" onClick={handleAnnual} className={`h-8 px-3 text-xs rounded-full gap-1 ${isAnnual ? 'bg-purple-600 text-white hover:bg-purple-700' : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'}`}>
          <CalendarIcon size={12} /> Anual
        </Button>
        <Button type="button" variant={isAll ? 'default' : 'outline'} size="sm" onClick={handleAll} className={`h-8 px-3 text-xs rounded-full gap-1 ${isAll ? 'bg-purple-600 text-white hover:bg-purple-700' : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'}`}>
          <List size={12} /> Todos
        </Button>
      </div>

      <div className="relative w-full">
        <Search size={20} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
        <Input placeholder="Pesquisar contas de cartões..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full" />
      </div>
    </div>
  );
};

export default CardAccountsFilters;
export type { CardAccountsFiltersProps };
