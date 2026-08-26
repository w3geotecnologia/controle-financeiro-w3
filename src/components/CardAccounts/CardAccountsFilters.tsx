import React from 'react';
import { Calendar as CalendarIcon, CalendarRange, CreditCard, Filter, List, Search, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  startDateFilter?: Date;
  setStartDateFilter: (date: Date | undefined) => void;
  endDateFilter?: Date;
  setEndDateFilter: (date: Date | undefined) => void;
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
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
  actionSlot,
}) => {
  const { cards } = useCardsOptions();
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(
    startDateFilter || endDateFilter ? { from: startDateFilter, to: endDateFilter } : undefined
  );

  React.useEffect(() => {
    setTempRange(
      startDateFilter || endDateFilter ? { from: startDateFilter, to: endDateFilter } : undefined
    );
  }, [startDateFilter, endDateFilter]);

  const confirmRange = () => {
    setStartDateFilter(tempRange?.from);
    setEndDateFilter(tempRange?.to);
    setRangeOpen(false);
  };

  const clearRange = () => {
    setTempRange(undefined);
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
  };

  const selectMonth = (month: number) => {
    setStartDateFilter(undefined);
    setEndDateFilter(undefined);
    setMonthFilter(String(month));
    if (yearFilter === 'todos') setYearFilter(String(new Date().getFullYear()));
  };

  const handleToday = () => {
    const today = new Date();
    clearRange();
    setMonthFilter(String(today.getMonth()));
    setYearFilter(String(today.getFullYear()));
  };

  const handleAnnual = () => {
    clearRange();
    setMonthFilter('todos');
    setYearFilter(String(new Date().getFullYear()));
  };

  const handleAll = () => {
    clearRange();
    setMonthFilter('todos');
    setYearFilter('todos');
  };

  const isToday = !startDateFilter && !endDateFilter && monthFilter === String(new Date().getMonth()) && yearFilter === String(new Date().getFullYear());
  const isAnnual = !startDateFilter && !endDateFilter && monthFilter === 'todos' && yearFilter !== 'todos';
  const isAll = !startDateFilter && !endDateFilter && monthFilter === 'todos' && yearFilter === 'todos';

  const rangeLabel = startDateFilter || endDateFilter
    ? `${startDateFilter ? startDateFilter.toLocaleDateString('pt-BR') : '...'} — ${endDateFilter ? endDateFilter.toLocaleDateString('pt-BR') : '...'}`
    : '';

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
          const isActive = !startDateFilter && !endDateFilter && monthFilter === String(index);
          return (
            <Button
              key={label}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => selectMonth(index)}
              className={`h-8 px-3 text-xs rounded-full ${isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-blue-50 hover:border-blue-300'}`}
            >
              {label}
            </Button>
          );
        })}

        <div className="mx-1 h-6 w-px bg-slate-200" />

        <Button type="button" variant={isToday ? 'default' : 'outline'} size="sm" onClick={handleToday} className={`h-8 px-3 text-xs rounded-full gap-1 ${isToday ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'}`}>
          <CalendarIcon size={12} />
          Hoje
        </Button>
        <Button type="button" variant={isAnnual ? 'default' : 'outline'} size="sm" onClick={handleAnnual} className={`h-8 px-3 text-xs rounded-full gap-1 ${isAnnual ? 'bg-purple-600 text-white hover:bg-purple-700' : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'}`}>
          <CalendarIcon size={12} />
          Anual
        </Button>
        <Button type="button" variant={isAll ? 'default' : 'outline'} size="sm" onClick={handleAll} className={`h-8 px-3 text-xs rounded-full gap-1 ${isAll ? 'bg-purple-600 text-white hover:bg-purple-700' : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'}`}>
          <List size={12} />
          Todos
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <CalendarRange size={18} className="text-blue-500 shrink-0" />
          <span className="text-sm text-slate-700 font-medium whitespace-nowrap">Intervalo de datas</span>
          <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full sm:w-72">
                <Input readOnly placeholder="dd/mm/aaaa — dd/mm/aaaa" value={rangeLabel} className="pr-9 h-10 px-3 py-2 w-full cursor-pointer" />
                <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-slate-900 pointer-events-none" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="range" selected={tempRange} onSelect={setTempRange} numberOfMonths={1} initialFocus className="pointer-events-auto" />
              <div className="border-t p-2 flex justify-between gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={clearRange}>Limpar</Button>
                <Button type="button" size="sm" onClick={confirmRange}>OK</Button>
              </div>
            </PopoverContent>
          </Popover>
          {(startDateFilter || endDateFilter) && (
            <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={clearRange} title="Limpar período">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="relative flex-1 min-w-0 w-full">
          <Search size={20} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
          <Input placeholder="Pesquisar contas de cartões..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full" />
        </div>
      </div>
    </div>
  );
};

export default CardAccountsFilters;
export type { CardAccountsFiltersProps };
