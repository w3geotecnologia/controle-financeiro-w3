import React from 'react';
import { Calendar as CalendarIcon, CalendarRange, CreditCard, Filter, Search, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCardsOptions } from '@/hooks/useCardsOptions';

interface CardAccountsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  cardFilter: string;
  setCardFilter: (value: string) => void;
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
              <SelectItem key={card.id} value={String(card.id)}>
                {card.name}
              </SelectItem>
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

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <CalendarRange size={18} className="text-blue-500 shrink-0" />
          <span className="text-sm text-slate-700 font-medium whitespace-nowrap">Intervalo de datas</span>
          <Popover open={rangeOpen} onOpenChange={setRangeOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full sm:w-72">
                <Input
                  readOnly
                  placeholder="dd/mm/aaaa — dd/mm/aaaa"
                  value={rangeLabel}
                  className="pr-9 h-10 px-3 py-2 w-full cursor-pointer"
                />
                <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-slate-900 pointer-events-none" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={tempRange}
                onSelect={setTempRange}
                numberOfMonths={1}
                initialFocus
                className="pointer-events-auto"
              />
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
          <Input
            placeholder="Pesquisar contas de cartões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default CardAccountsFilters;

export type { CardAccountsFiltersProps };
