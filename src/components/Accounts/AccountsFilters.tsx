import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Landmark, Calendar as CalendarIcon, List, CreditCard, X } from 'lucide-react';
import { useBanksOptions } from '@/hooks/useBanksOptions';
import { useCardsOptions } from '@/hooks/useCardsOptions';

interface AccountsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  monthFilter: string;
  setMonthFilter: (value: string) => void;
  yearFilter: string;
  setYearFilter: (value: string) => void;
  bankFilter: string;
  setBankFilter: (value: string) => void;
  accounts: any[];
  mode?: 'bank' | 'card';
  cardFilter?: string;
  setCardFilter?: (value: string) => void;
  actionSlot?: React.ReactNode;
  hideTypeFilter?: boolean;
}

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const AccountsFilters: React.FC<AccountsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  monthFilter,
  setMonthFilter,
  yearFilter,
  setYearFilter,
  bankFilter,
  setBankFilter,
  mode = 'bank',
  cardFilter = 'todos',
  setCardFilter,
  actionSlot,
  hideTypeFilter = false,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const { banks } = useBanksOptions();
  const { cards } = useCardsOptions();

  const isShowingAll = monthFilter === 'todos' && yearFilter === 'todos';
  const isAnnualView = monthFilter === 'todos' && yearFilter !== 'todos';
  const isToday =
    monthFilter === today.getMonth().toString() &&
    yearFilter === currentYear.toString();

  const handleToday = () => {
    setMonthFilter(today.getMonth().toString());
    setYearFilter(currentYear.toString());
  };

  const handleAnnual = () => {
    const year = yearFilter === 'todos' ? currentYear.toString() : yearFilter;
    setMonthFilter('todos');
    setYearFilter(year);
  };

  const handleAll = () => {
    setMonthFilter('todos');
    setYearFilter('todos');
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Linha 1: Banco + Status + Tipo + Ano */}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        {mode === 'card' ? (
          <Select value={cardFilter} onValueChange={(v) => setCardFilter?.(v)}>
            <SelectTrigger className="w-full sm:w-56">
              <CreditCard size={16} className="mr-2" />
              <SelectValue placeholder="Todos os Cartões" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Cartões</SelectItem>
              {cards.map((card) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Select value={bankFilter} onValueChange={setBankFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <Landmark size={16} className="mr-2" />
              <SelectValue placeholder="Todos os Bancos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Bancos</SelectItem>
              {banks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

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

        {!hideTypeFilter && (
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Todos os Tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter size={16} className="mr-2" />
            <SelectValue placeholder="Todos os Anos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Anos</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {actionSlot}
      </div>

      {/* Linha 2: Meses Jan a Dez + Hoje / Anual / Todos */}
      <div className="border border-input rounded-md p-3 flex items-center gap-2 flex-wrap">
        <Calendar size={16} className="text-slate-500 mr-1" />
        {MONTHS_SHORT.map((label, index) => {
          const value = index.toString();
          const isActive = monthFilter === value || isAnnualView;
          return (
            <Button
              key={value}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMonthFilter(value)}
              className={`h-8 px-3 text-xs rounded-full transition-colors ${
                isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              {label}
            </Button>
          );
        })}

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <Button
          type="button"
          variant={isToday ? 'default' : 'outline'}
          size="sm"
          onClick={handleToday}
          className={`h-8 px-3 text-xs rounded-full gap-1 ${
            isToday ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'
          }`}
        >
          <Calendar size={12} />
          Hoje
        </Button>

        <Button
          type="button"
          variant={isAnnualView ? 'default' : 'outline'}
          size="sm"
          onClick={handleAnnual}
          className={`h-8 px-3 text-xs rounded-full gap-1 ${
            isAnnualView ? 'bg-purple-600 text-white hover:bg-purple-700' : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
          }`}
        >
          <Calendar size={12} />
          Anual
        </Button>

        <Button
          type="button"
          variant={isShowingAll ? 'default' : 'outline'}
          size="sm"
          onClick={handleAll}
          className={`h-8 px-3 text-xs rounded-full gap-1 ${
            isShowingAll ? 'bg-purple-600 text-white hover:bg-purple-700' : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
          }`}
        >
          <List size={12} />
          Todos
        </Button>
      </div>

      {/* Linha 3: Busca */}
      <div className="relative w-full">
        <Search size={20} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
        <Input
          placeholder="Pesquisar por descrição, categoria, banco ou data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full min-w-0"
        />
      </div>
    </div>
  );
};
