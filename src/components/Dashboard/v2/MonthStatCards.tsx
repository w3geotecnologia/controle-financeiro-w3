import React from 'react';
import { Wallet, ArrowDown, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface StatProps {
  label: string;
  value: number;
  variation: number | null;
  previousMonthLabel: string;
  tone: 'success' | 'danger' | 'brand';
  icon: React.ElementType;
  onClick?: () => void;
}

const toneMap = {
  success: { text: 'text-success', bg: 'bg-success-soft', icon: 'text-success' },
  danger: { text: 'text-danger', bg: 'bg-danger-soft', icon: 'text-danger' },
  brand: { text: 'text-brand', bg: 'bg-brand-soft', icon: 'text-brand' },
};

const Stat: React.FC<StatProps> = ({ label, value, variation, previousMonthLabel, tone, icon: Icon, onClick }) => {
  const t = toneMap[tone];
  const up = (variation ?? 0) >= 0;
  return (
    <div
      onClick={onClick}
      className={`rounded-lg bg-card border border-border shadow-sm p-4 flex min-h-[104px] items-start justify-between gap-3 transition-shadow ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div>
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
        <p className={`mt-1 text-xl font-bold leading-tight tabular-nums ${t.text}`}>{formatCurrency(value)}</p>
        {variation !== null && (
          <p className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${up ? 'text-success' : 'text-danger'}`}>
            {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {up ? '+' : ''}{variation.toFixed(1).replace('.', ',')}%
            <span className="text-muted-foreground font-normal">em relação a {previousMonthLabel}</span>
          </p>
        )}
      </div>
      <div className={`h-9 w-9 shrink-0 rounded-md flex items-center justify-center ${t.bg}`}>
        <Icon className={`h-4 w-4 ${t.icon}`} />
      </div>
    </div>
  );
};

interface Props {
  receitas: number;
  despesas: number;
  resultado: number;
  varReceitas: number | null;
  varDespesas: number | null;
  varResultado: number | null;
  previousMonthLabel: string;
  onReceitasClick?: () => void;
  onDespesasClick?: () => void;
}

export const MonthStatCards: React.FC<Props> = ({
  receitas,
  despesas,
  resultado,
  varReceitas,
  varDespesas,
  varResultado,
  previousMonthLabel,
  onReceitasClick,
  onDespesasClick,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
    <Stat
      label="Receitas do mês"
      value={receitas}
      variation={varReceitas}
      previousMonthLabel={previousMonthLabel}
      tone="success"
      icon={Wallet}
      onClick={onReceitasClick}
    />
    <Stat
      label="Despesas do mês"
      value={despesas}
      variation={varDespesas}
      previousMonthLabel={previousMonthLabel}
      tone="danger"
      icon={ArrowDown}
      onClick={onDespesasClick}
    />
    <Stat
      label="Resultado do mês"
      value={resultado}
      variation={varResultado}
      previousMonthLabel={previousMonthLabel}
      tone={resultado >= 0 ? 'brand' : 'danger'}
      icon={DollarSign}
    />
  </div>
);
