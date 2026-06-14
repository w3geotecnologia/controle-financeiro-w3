import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Landmark, Calendar } from 'lucide-react';
import { useBanksOptions } from '@/hooks/useBanksOptions';

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
}

const MONTHS = [
  { value: '0',  label: 'Janeiro'   },
  { value: '1',  label: 'Fevereiro' },
  { value: '2',  label: 'Março'     },
  { value: '3',  label: 'Abril'     },
  { value: '4',  label: 'Maio'      },
  { value: '5',  label: 'Junho'     },
  { value: '6',  label: 'Julho'     },
  { value: '7',  label: 'Agosto'    },
  { value: '8',  label: 'Setembro'  },
  { value: '9',  label: 'Outubro'   },
  { value: '10', label: 'Novembro'  },
  { value: '11', label: 'Dezembro'  },
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
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const { banks } = useBanksOptions();

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Linha 1: Banco + Mês + Ano */}
      <div className="flex flex-col sm:flex-row gap-4">
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

        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Calendar size={16} className="mr-2" />
            <SelectValue placeholder="Todos os Meses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Meses</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-40">
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
      </div>

      {/* Linha 2: Status + Tipo */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
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
          <SelectTrigger className="w-full sm:w-44">
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
