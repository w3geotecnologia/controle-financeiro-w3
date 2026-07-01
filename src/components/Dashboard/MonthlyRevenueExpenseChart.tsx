import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccounts } from '@/contexts/AccountsContext';
import { formatCurrency } from '@/utils/formatters';

interface Props {
  year: number;
}

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_FULL = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export const MonthlyRevenueExpenseChart: React.FC<Props> = ({ year }) => {
  const { accounts } = useAccounts();

  const { data, totalReceitas, totalDespesas, totalSaldoAnterior } = useMemo(() => {
    const base = MONTHS_SHORT.map((m, i) => ({
      month: m,
      monthIndex: i,
      receita: 0,
      despesa: 0,
      saldoAnterior: 0,
    }));

    accounts.forEach((acc) => {
      if (!acc.dueDate) return;
      const d = new Date(acc.dueDate + 'T00:00:00');
      if (d.getFullYear() !== year) return;
      const idx = d.getMonth();

      if (acc.description === 'Saldo Anterior') {
        const val = acc.type === 'receita' ? (acc.amount || 0) : -(Math.abs(acc.amount || 0));
        base[idx].saldoAnterior += val;
        return;
      }

      if (acc.type === 'receita' && acc.status === 'recebido') {
        base[idx].receita += acc.amount || 0;
      } else if (acc.type === 'despesa' && acc.status === 'pago') {
        base[idx].despesa += Math.abs(acc.amount || 0);
      }
    });

    const totalReceitas = base.reduce((s, r) => s + r.receita, 0);
    const totalDespesas = base.reduce((s, r) => s + r.despesa, 0);
    const totalSaldoAnterior = base.reduce((s, r) => s + r.saldoAnterior, 0);

    return { data: base, totalReceitas, totalDespesas, totalSaldoAnterior };
  }, [accounts, year]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const idx = MONTHS_SHORT.indexOf(label);
    const monthFull = idx >= 0 ? MONTHS_FULL[idx] : label;
    const row = data[idx];
    const pctR = totalReceitas > 0 ? (row.receita / totalReceitas) * 100 : 0;
    const pctD = totalDespesas > 0 ? (row.despesa / totalDespesas) * 100 : 0;
    const pctS = totalSaldoAnterior !== 0 ? (row.saldoAnterior / Math.abs(totalSaldoAnterior)) * 100 : 0;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1">
        <div className="font-semibold text-sm">{monthFull} / {year}</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
          <span>Receitas: <strong>{formatCurrency(row.receita)}</strong> ({pctR.toFixed(1)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span>Despesas: <strong>{formatCurrency(row.despesa)}</strong> ({pctD.toFixed(1)}%)</span>
        </div>
        {row.saldoAnterior !== 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span>Saldo Anterior: <strong>{formatCurrency(row.saldoAnterior)}</strong> ({Math.abs(pctS).toFixed(1)}%)</span>
          </div>
        )}
        <div className="pt-1 border-t border-border/50">
          Saldo: <strong className={row.receita - row.despesa + row.saldoAnterior >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCurrency(row.receita - row.despesa + row.saldoAnterior)}
          </strong>
        </div>
      </div>
    );
  };

  const renderPctReceita = (props: any) => {
    const { x, y, width, value } = props;
    if (!value || totalReceitas <= 0) return null;
    const pct = (value / totalReceitas) * 100;
    if (pct < 1) return null;
    return (
      <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="#059669" fontWeight={600}>
        {pct.toFixed(1)}%
      </text>
    );
  };

  const renderPctDespesa = (props: any) => {
    const { x, y, width, value } = props;
    if (!value || totalDespesas <= 0) return null;
    const pct = (value / totalDespesas) * 100;
    if (pct < 1) return null;
    return (
      <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="#dc2626" fontWeight={600}>
        {pct.toFixed(1)}%
      </text>
    );
  };

  const renderPctSaldo = (props: any) => {
    const { x, y, width, value } = props;
    if (!value || totalSaldoAnterior === 0) return null;
    const pct = (value / Math.abs(totalSaldoAnterior)) * 100;
    if (Math.abs(pct) < 1) return null;
    return (
      <text x={x + width / 2} y={value >= 0 ? y - 4 : y + 12} textAnchor="middle" fontSize={10} fill="#2563eb" fontWeight={600}>
        {Math.abs(pct).toFixed(1)}%
      </text>
    );
  };

  const currencyAxis = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return String(v);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg flex flex-wrap items-center justify-between gap-2">
          <span>Receitas x Despesas — {year}</span>
          <span className="text-xs sm:text-sm font-normal text-muted-foreground">
            <span className="text-green-600 font-semibold">{formatCurrency(totalReceitas)}</span>
            {' · '}
            <span className="text-red-600 font-semibold">{formatCurrency(totalDespesas)}</span>
            {' · '}
            <span className="text-blue-600 font-semibold">{formatCurrency(totalSaldoAnterior)}</span>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="w-full h-[300px] sm:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={currencyAxis} tick={{ fontSize: 11 }} width={50} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="receita" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="receita" content={renderPctReceita} />
              </Bar>
              <Bar dataKey="despesa" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="despesa" content={renderPctDespesa} />
              </Bar>
              <Bar dataKey="saldoAnterior" name="Saldo Anterior" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="saldoAnterior" content={renderPctSaldo} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyRevenueExpenseChart;
