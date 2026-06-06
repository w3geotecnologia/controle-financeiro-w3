import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Landmark } from 'lucide-react';
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
  accounts
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const { banks } = useBanksOptions();

  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      {/* Campo de pesquisa com largura fixa em telas maiores */}
      <div className="relative w-full lg:w-80 lg:flex-shrink-0">
        <Search size={20} className="absolute left-3 top-3 text-slate-400 pointer-events-none z-10" />
        <Input
          placeholder="Pesquisar contas..."
          value={searchTerm}
          onChange={(e) => {
            console.log('Pesquisa digitada:', e.target.value);
            setSearchTerm(e.target.value);
          }}
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
              <SelectItem key={bank.id} value={bank.name}>
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
  );
};
