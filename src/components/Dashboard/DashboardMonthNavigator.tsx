
import React from 'react';
import { ChevronLeft, ChevronRight, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardMonthNavigatorProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

export const DashboardMonthNavigator: React.FC<DashboardMonthNavigatorProps> = ({
  currentMonth,
  currentYear,
  onMonthChange
}) => {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonth = currentMonth - 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear = currentYear - 1;
      }
    } else {
      newMonth = currentMonth + 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear = currentYear + 1;
      }
    }

    onMonthChange(newMonth, newYear);
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="text-left flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileSearch className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Resumo Financeiro</h1>
            <p className="text-sm text-slate-600">Resumo da sua situação financeira</p>
          </div>
        </div>
        
        {/* Desktop month navigator */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
          >
            <ChevronLeft size={16} />
          </Button>

          <div className="text-xl font-bold text-slate-800 min-w-[180px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Mobile month navigator */}
      <div className="md:hidden flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-200">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronLeft size={16} />
        </Button>

        <div className="text-lg font-bold text-slate-800 min-w-[160px] text-center">
          {monthNames[currentMonth]} {currentYear}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:border-blue-300"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
