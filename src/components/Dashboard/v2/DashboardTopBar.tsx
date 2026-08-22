import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Bell, RefreshCw } from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

interface Props {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  notifications?: number;
  onRefresh?: () => void;
}

export const DashboardTopBar: React.FC<Props> = ({
  month,
  year,
  onChange,
  notifications = 0,
  onRefresh,
}) => {
  const prev = () => (month === 0 ? onChange(11, year - 1) : onChange(month - 1, year));
  const next = () => (month === 11 ? onChange(0, year + 1) : onChange(month + 1, year));

  const now = new Date();
  const updatedAt = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Visão geral da sua vida financeira</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 h-11 rounded-xl bg-card border border-border shadow-sm px-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {MONTH_NAMES[month]} de {year}
          </span>
          <button
            onClick={prev}
            aria-label="Mês anterior"
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            aria-label="Próximo mês"
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <button
            aria-label="Notificações"
            className="h-11 w-11 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-brand"
          >
            <Bell className="h-[18px] w-[18px]" />
          </button>
          {notifications > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-danger text-[10px] font-bold text-danger-foreground flex items-center justify-center">
              {notifications}
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="text-right leading-tight">
            <p className="text-[11px] text-muted-foreground">Atualizado em</p>
            <p className="text-[11px] font-semibold text-foreground tabular-nums">{updatedAt}</p>
          </div>
          <button
            onClick={onRefresh}
            aria-label="Atualizar"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-brand"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
