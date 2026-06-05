import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthYearStepperMobileProps {
  currentMonth: number; // 0-11
  currentYear: number;
  onMonthChange: (startDate: Date, endDate: Date, month: number, year: number) => void;
  isShowingAll: boolean;
}

export const MonthYearStepperMobile: React.FC<MonthYearStepperMobileProps> = ({
  currentMonth,
  currentYear,
  onMonthChange,
  isShowingAll
}) => {
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const handleMonthChange = (month: number, year: number) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    onMonthChange(startDate, endDate, month, year);
  };

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

    handleMonthChange(newMonth, newYear);
  };

  const navigateYear = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? currentYear - 1 : currentYear + 1;
    handleMonthChange(currentMonth, newYear);
  };

  if (isShowingAll) {
    return null;
  }

  return (
    <div className="bg-card border rounded-lg p-2 flex items-center justify-between gap-1 w-full">
      {/* Stepper de Mês */}
      <div className="flex items-center gap-0.5 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs font-semibold text-center flex-1">
          {monthNames[currentMonth]}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Stepper de Ano */}
      <div className="flex items-center gap-0.5 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateYear('prev')}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-xs font-semibold text-center flex-1">
          {currentYear}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateYear('next')}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
