import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Landmark, CalendarRange, X } from 'lucide-react';
import { useBanksOptions } from '@/hooks/useBanksOptions';

interface AccountsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
  bankFilter: string;
  setBankFilter: (value: string) => void;
  yearFilter: string;
  setYearFilter: (value: string) => void;
  startDate?: string;
  setStartDate?: (value: string) => void;
  endDate?: string;
  setEndDate?: (value: string) => void;
  accounts: any[];
}

export const AccountsFilters: React.FC<AccountsFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  bankFilter,
  setBankFilter,
  yearFilter,
  setYearFilter,
  startDate = '',
  setStartDate,
  endDate = '',
  setEndDate,
  accounts
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const { banks } = useBanksOptions();

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Campo de pesquisa com largura fixa em telas maiores */}
        <div className="relative w-full lg:w-80 lg:flex-shrink-0">
          <Search size={20} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
          <Input
            placeholder="Pesquisar contas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full min-w-0"
          />
        </div>

        {/* Container para os filtros */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Select value={bankFilter} onValueChange={setBankFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Landmark size={16} className="mr-2" />
              <SelectValue placeholder="Filtrar por banco" />
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

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Filtrar por ano" />
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtro por intervalo de datas */}
      {setStartDate && setEndDate && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-muted/40 border rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground sm:flex-shrink-0">
            <CalendarRange size={16} className="text-slate-500" />
            <span>Intervalo de datas</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-12 sm:w-auto">De</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-full sm:w-44"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-12 sm:w-auto">Até</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-full sm:w-44"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="h-9 sm:ml-auto"
              >
                <X size={14} className="mr-1" /> Limpar
              </Button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
