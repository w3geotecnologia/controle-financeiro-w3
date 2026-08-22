import React from 'react';
import { Landmark, BarChart3, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface Props {
  banksTotal: number;
  investmentsTotal: number;
  cardsTotal: number;
  variationPct: number | null;
  previousMonthLabel: string;
}

const Pill: React.FC<{
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: number;
  valueClass: string;
}> = ({ icon: Icon, iconClass, label, value, valueClass }) => (
  <div className="flex items-center gap-3">
    <div className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center ${iconClass}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
      <p className={`text-base sm:text-xl font-semibold ${valueClass}`}>{formatCurrency(value)}</p>
    </div>
  </div>
);

export const ConsolidatedBalance: React.FC<Props> = ({
  banksTotal,
  investmentsTotal,
  cardsTotal,
  variationPct,
  previousMonthLabel,
}) => {
  const consolidated = banksTotal + investmentsTotal - Math.abs(cardsTotal);
  const up = (variationPct ?? 0) >= 0;

  return (
    <section className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_repeat(3,minmax(0,1fr))] gap-5 lg:gap-4 lg:divide-x lg:divide-border">
        <div className="lg:pr-6">
          <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            Saldo consolidado
          </p>
          <p className="mt-1 text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
            {formatCurrency(consolidated)}
          </p>
          {variationPct !== null && (
            <p className={`mt-2 flex items-center gap-1 text-sm font-medium ${up ? 'text-success' : 'text-danger'}`}>
              {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {up ? '+' : ''}{variationPct.toFixed(1).replace('.', ',')}%
              <span className="text-muted-foreground font-normal">em relação a {previousMonthLabel}</span>
            </p>
          )}
        </div>

        <div className="lg:px-6">
          <Pill
            icon={Landmark}
            iconClass="bg-success-soft text-success"
            label="Contas bancárias"
            value={banksTotal}
            valueClass="text-success"
          />
        </div>
        <div className="lg:px-6">
          <Pill
            icon={BarChart3}
            iconClass="bg-brand-soft text-brand"
            label="Investimentos"
            value={investmentsTotal}
            valueClass="text-brand"
          />
        </div>
        <div className="lg:pl-6">
          <Pill
            icon={CreditCard}
            iconClass="bg-danger-soft text-danger"
            label="Cartões"
            value={-Math.abs(cardsTotal)}
            valueClass="text-danger"
          />
        </div>
      </div>
    </section>
  );
};
