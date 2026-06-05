
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { InvestmentInstitution, InvestmentType } from '@/hooks/useInvestmentsData';

interface InvestmentFiltersProps {
  institutions: InvestmentInstitution[];
  investmentTypes: InvestmentType[];
  onFiltersChange: (filters: any) => void;
}

export const InvestmentFilters: React.FC<InvestmentFiltersProps> = ({
  institutions,
  investmentTypes,
  onFiltersChange
}) => {
  const [filters, setFilters] = React.useState({
    institution: '',
    type: '',
    dateRange: { from: null, to: null }
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Instituição
          </label>
          <Select
            value={filters.institution}
            onValueChange={(value) => handleFilterChange('institution', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as instituições" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as instituições</SelectItem>
              {institutions.map((institution) => (
                <SelectItem key={institution.id} value={institution.id.toString()}>
                  {institution.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tipo de Investimento
          </label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os tipos</SelectItem>
              {investmentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Data de Compra
          </label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>De</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.from}
                  onSelect={(date) => 
                    handleFilterChange('dateRange', { ...filters.dateRange, from: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.to ? (
                    format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Até</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateRange.to}
                  onSelect={(date) => 
                    handleFilterChange('dateRange', { ...filters.dateRange, to: date })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};
