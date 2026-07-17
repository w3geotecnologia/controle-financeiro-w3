import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Landmark, Calendar as CalendarIcon, CalendarRange, List, CreditCard, X, SearchIcon } from 'lucide-react';
import { SearchField } from '@/hooks/useAccountFilters';
import { useBanksOptions } from '@/hooks/useBanksOptions';
import { useCardsOptions } from '@/hooks/useCardsOptions';

interface AccountsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  searchField?: SearchField;
  setSearchField?: (value: SearchField) => void;
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
  startDateFilter?: Date;
  setStartDateFilter?: (date: Date | undefined) => void;
  endDateFilter?: Date;
  setEndDateFilter?: (date: Date | undefined) => void;
}

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export const AccountsFilters: React.FC<AccountsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  searchField = 'todos',
  setSearchField,
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
  startDateFilter,
  setStartDateFilter,
  endDateFilter,
  setEndDateFilter,
}) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const { banks } = useBanksOptions();
  const { cards } = useCardsOptions();

  const hasPeriodFilter = Boolean(startDateFilter || endDateFilter);
  const [rangeOpen, setRangeOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(
    startDateFilter || endDateFilter
      ? { from: startDateFilter, to: endDateFilter }
      : undefined
  );

  React.useEffect(() => {
    setTempRange(
      startDateFilter || endDateFilter
        ? { from: startDateFilter, to: endDateFilter }
        : undefined
    );
  }, [startDateFilter, endDateFilter]);

  const handleConfirmRange = () => {
    setStartDateFilter?.(tempRange?.from);
    setEndDateFilter?.(tempRange?.to);
    if (tempRange?.from || tempRange?.to) {
      setMonthFilter('todos');
      setYearFilter('todos');
    }
    setRangeOpen(false);
  };

  const handleClearPeriod = () => {
    setStartDateFilter?.(undefined);
    setEndDateFilter?.(undefined);
    setMonthFilter(today.getMonth().toString());
    setYearFilter(currentYear.toString());
  };

  const isShowingAll = !hasPeriodFilter && monthFilter === 'todos' && yearFilter === 'todos';
  const isAnnualView = !hasPeriodFilter && monthFilter === 'todos' && yearFilter !== 'todos';
  const isToday =
    !hasPeriodFilter &&
    monthFilter === today.getMonth().toString() &&
    yearFilter === currentYear.toString();

  const handleToday = () => {
    setStartDateFilter?.(undefined);
    setEndDateFilter?.(undefined);
    setMonthFilter(today.getMonth().toString());
    setYearFilter(currentYear.toString());
  };

  const handleAnnual = () => {
    const year = yearFilter === 'todos' ? currentYear.toString() : yearFilter;
    setStartDateFilter?.(undefined);
    setEndDateFilter?.(undefined);
    setMonthFilter('todos');
    setYearFilter(year);
  };

  const handleAll = () => {
    setStartDateFilter?.(undefined);
    setEndDateFilter?.(undefined);
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
        <CalendarIcon size={16} className="text-slate-500 mr-1" />
        {MONTHS_SHORT.map((label, index) => {
          const value = index.toString();
          const isActive = !hasPeriodFilter && (monthFilter === value || isAnnualView);
          return (
            <Button
              key={value}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStartDateFilter?.(undefined);
                setEndDateFilter?.(undefined);
                setMonthFilter(value);
              }}
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
          <CalendarIcon size={12} />
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
          <CalendarIcon size={12} />
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

      {/* Linha 3: Filtro por período + Busca */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center w-full">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <CalendarRange size={18} className="text-blue-500 shrink-0" />
          <span className="text-sm text-slate-700 font-medium whitespace-nowrap">Intervalo de datas</span>

          <Popover
            open={rangeOpen}
            onOpenChange={(open) => {
              setRangeOpen(open);
              if (open) {
                setTempRange(
                  startDateFilter || endDateFilter
                    ? { from: startDateFilter, to: endDateFilter }
                    : undefined
                );
              }
            }}
          >
            <PopoverTrigger asChild>
              <div className="relative w-full sm:w-72">
                <Input
                  type="text"
                  readOnly
                  placeholder="dd/mm/aaaa — dd/mm/aaaa"
                  value={
                    startDateFilter || endDateFilter
                      ? `${startDateFilter ? startDateFilter.toLocaleDateString('pt-BR') : '...'} — ${endDateFilter ? endDateFilter.toLocaleDateString('pt-BR') : '...'}`
                      : ''
                  }
                  className="pr-9 h-10 px-3 py-2 w-full cursor-pointer"
                />
                <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-slate-900 pointer-events-none" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex flex-col w-[320px]">
                <Calendar
                  mode="range"
                  selected={tempRange}
                  onSelect={setTempRange}
                  numberOfMonths={1}
                  initialFocus
                  captionLayout="dropdown"
                  fromYear={currentYear - 10}
                  toYear={currentYear + 10}
                  defaultMonth={tempRange?.from ?? new Date()}
                  className="p-3 pointer-events-auto w-[320px] [&_.rdp-months]:justify-center [&_.rdp-month]:w-full"
                  classNames={{
                    caption: 'flex justify-center pt-1 relative items-center mb-2',
                    caption_dropdowns: 'flex gap-2 items-center',
                    dropdown:
                      'h-8 rounded-md border border-input bg-background px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none',
                    dropdown_month: 'min-w-[110px]',
                    dropdown_year: 'min-w-[80px]',
                    nav: 'hidden',
                    day_selected:
                      'bg-blue-700 text-white font-bold hover:bg-blue-800 focus:bg-blue-800 rounded-md',
                    day_range_start:
                      'bg-blue-700 text-white font-bold hover:bg-blue-800 rounded-l-md',
                    day_range_end:
                      'bg-blue-700 text-white font-bold hover:bg-blue-800 rounded-r-md',
                    day_range_middle:
                      'bg-blue-200 text-blue-900 font-bold hover:bg-blue-300 rounded-none',
                  }}
                />
                <div className="border-t p-2 flex justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempRange(undefined)}
                  >
                    Limpar
                  </Button>
                  <Button type="button" size="sm" onClick={handleConfirmRange}>
                    OK
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {(startDateFilter || endDateFilter) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={handleClearPeriod}
              title="Limpar período"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>


        <div className="flex items-center gap-2 w-full md:flex-1">
          <Select
            value={searchField}
            onValueChange={(v) => setSearchField?.(v as SearchField)}
          >
            <SelectTrigger className="w-full sm:w-48 h-10 px-3 py-2">
              <SearchIcon size={16} className="mr-2" />
              <SelectValue placeholder="Pesquisar em..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os campos</SelectItem>
              <SelectItem value="categoria">Categoria</SelectItem>
              <SelectItem value="nome">Nome</SelectItem>
              <SelectItem value="fonte">Fonte de pagamento</SelectItem>
              <SelectItem value="data">Data</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-0">
            <Search size={20} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
            <Input
              placeholder={
                searchField === 'categoria'
                  ? 'Pesquisar por categoria...'
                  : searchField === 'nome'
                  ? 'Pesquisar por nome...'
                  : searchField === 'fonte'
                  ? 'Pesquisar por fonte de pagamento...'
                  : searchField === 'data'
                  ? 'Pesquisar por data...'
                  : 'Pesquisar por nome e categoria...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
