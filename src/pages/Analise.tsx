
import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ReferenceLine,
} from 'recharts';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { useAccounts } from '@/contexts/AccountsContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  TrendingUp, TrendingDown, DollarSign, Menu, ChevronLeft, ChevronRight,
  Wallet, Receipt,
} from 'lucide-react';
import { parseISO, getMonth, getYear } from 'date-fns';
import { AnalysisSummaryCardsMobile } from '@/components/Dashboard/AnalysisSummaryCardsMobile';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { GaugeKpi } from '@/components/Dashboard/GaugeKpi';
import { RankingBars } from '@/components/Dashboard/RankingBars';
import { formatCurrency } from '@/utils/formatters';

const compact = (v: number): string => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (abs >= 1_000) return `${Math.round(v / 1_000)}K`;
  return v.toFixed(0);
};

const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const COLORS = {
  entradas: '#17a398',
  saidas: '#f2545b',
  saldo: '#1c3b6e',
};

const Analise: React.FC = () => {
  const { accounts } = useAccounts();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([currentMonth]);
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');

  const RECEITA_COLORS = [
    '#17a398', '#3B82F6', '#22C55E', '#8B5CF6', '#06B6D4', '#10B981',
    '#6366F1', '#14B8A6', '#0EA5E9', '#84CC16', '#A855F7',
  ];
  const DESPESA_COLORS = [
    '#f2545b', '#EF4444', '#F97316', '#F59E0B', '#EC4899', '#FB7185',
    '#DC2626', '#EA580C', '#D97706', '#DB2777', '#F43F5E',
  ];

  const months = MONTHS_SHORT.map((m, i) => ({
    value: i,
    label: m.charAt(0).toUpperCase() + m.slice(1),
  }));
  const monthsFull = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    accounts.forEach((account) => {
      if (!account.dueDate) return;
      years.add(getYear(parseISO(account.dueDate)));
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [accounts]);

  const toggleMonth = (monthValue: number) => {
    setSelectedMonths((prev) =>
      prev.includes(monthValue)
        ? prev.filter((m) => m !== monthValue)
        : [...prev, monthValue].sort((a, b) => a - b)
    );
  };
  const selectAllMonths = () => setSelectedMonths([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const clearAllMonths = () => setSelectedMonths([]);

  const periodLabel = selectedMonths.length === 12
    ? `${selectedYear}`
    : selectedMonths.length === 1
      ? `${monthsFull[selectedMonths[0]]}/${selectedYear}`
      : `${selectedMonths.length} meses/${selectedYear}`;

  // Contas do período selecionado
  const periodAccounts = useMemo(() => {
    return accounts.filter((account) => {
      if (!account.dueDate) return false;
      const date = parseISO(account.dueDate);
      return getYear(date) === selectedYear && selectedMonths.includes(getMonth(date));
    });
  }, [accounts, selectedYear, selectedMonths]);

  // KPIs
  const kpis = useMemo(() => {
    const receitas = periodAccounts
      .filter((a) => a.type === 'receita')
      .reduce((s, a) => s + Math.abs(a.amount || 0), 0);
    const despesas = periodAccounts
      .filter((a) => a.type === 'despesa')
      .reduce((s, a) => s + Math.abs(a.amount || 0), 0);
    const recebido = periodAccounts
      .filter((a) => a.type === 'receita' && a.status === 'recebido')
      .reduce((s, a) => s + Math.abs(a.amount || 0), 0);
    const pago = periodAccounts
      .filter((a) => a.type === 'despesa' && a.status === 'pago')
      .reduce((s, a) => s + Math.abs(a.amount || 0), 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      recebido,
      pago,
      pctCAR: receitas > 0 ? (recebido / receitas) * 100 : 0,
      pctCAP: despesas > 0 ? (pago / despesas) * 100 : 0,
    };
  }, [periodAccounts]);

  // Entradas x Saídas x Saldo por mês (ano inteiro)
  const monthlyData = useMemo(() => {
    const rows = MONTHS_SHORT.map((m) => ({ month: m, entradas: 0, saidas: 0, saldo: 0 }));
    accounts.forEach((a) => {
      if (!a.dueDate) return;
      const d = parseISO(a.dueDate);
      if (getYear(d) !== selectedYear) return;
      const idx = getMonth(d);
      if (a.type === 'receita') rows[idx].entradas += Math.abs(a.amount || 0);
      else rows[idx].saidas += Math.abs(a.amount || 0);
    });
    rows.forEach((r) => { r.saldo = r.entradas - r.saidas; });
    return rows;
  }, [accounts, selectedYear]);

  // Saldo acumulado (curva de evolução)
  const accumulatedData = useMemo(() => {
    let running = 0;
    return monthlyData.map((r) => {
      running += r.saldo;
      return {
        month: r.month,
        acumulado: running,
        positivo: running >= 0 ? running : 0,
        negativo: running < 0 ? running : 0,
      };
    });
  }, [monthlyData]);

  // Rankings por categoria
  const buildRanking = (type: 'receita' | 'despesa', limit: number) => {
    const totals: Record<string, number> = {};
    periodAccounts
      .filter((a) => a.type === type)
      .forEach((a) => {
        const key = a.category || 'Sem categoria';
        totals[key] = (totals[key] || 0) + Math.abs(a.amount || 0);
      });
    const list = Object.entries(totals)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a);
    const total = list.reduce((s, [, v]) => s + v, 0);
    return list.slice(0, limit).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
  };

  const topReceitas = useMemo(() => buildRanking('receita', 10), [periodAccounts]);
  const topDespesas = useMemo(() => buildRanking('despesa', 10), [periodAccounts]);

  // Pizza de distribuição
  const pieChartData = useMemo(() => {
    const filtered = periodAccounts.filter((a) => typeFilter === 'todos' || a.type === typeFilter);
    const totals: Record<string, { value: number; type: string }> = {};
    filtered.forEach((a) => {
      const key = `${a.category || 'Sem categoria'}|${a.type}`;
      if (!totals[key]) totals[key] = { value: 0, type: a.type };
      totals[key].value += Math.abs(a.amount || 0);
    });
    let ri = 0;
    let di = 0;
    return Object.entries(totals)
      .filter(([, d]) => d.value > 0)
      .sort(([, a], [, b]) => b.value - a.value)
      .map(([key, d]) => ({
        name: key.split('|')[0],
        value: d.value,
        type: d.type,
        color: d.type === 'receita'
          ? RECEITA_COLORS[ri++ % RECEITA_COLORS.length]
          : DESPESA_COLORS[di++ % DESPESA_COLORS.length],
      }));
  }, [periodAccounts, typeFilter]);

  const chartConfig = {
    entradas: { label: 'Entradas', color: COLORS.entradas },
    saidas: { label: 'Saídas', color: COLORS.saidas },
    saldo: { label: 'Saldo', color: COLORS.saldo },
  } satisfies ChartConfig;

  const KpiCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactNode;
    valueClass?: string;
  }> = ({ title, value, icon, valueClass }) => (
    <Card className="shadow-sm">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-100 text-[#1c3b6e]">{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 truncate">{title}</p>
          <p className={`text-lg font-bold leading-tight ${valueClass || 'text-[#1c3b6e]'}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  const GaugeCard: React.FC<{ title: string; percent: number; value: number; color: string }> = ({
    title, percent, value, color,
  }) => (
    <Card className="shadow-sm">
      <CardContent className="p-3 flex items-center gap-3">
        <GaugeKpi percent={percent} color={color} size={48} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 truncate">{title}</p>
          <p className="text-lg font-bold leading-tight" style={{ color }}>
            {percent.toFixed(0)}%
            <span className="ml-2 text-sm font-semibold text-slate-600">{formatCurrency(value)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-3 pb-8">
        
        {isMobile && (
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Menu className="h-5 w-5" />
            Menu Principal
          </Button>
        )}

        {/* Faixa de título estilo BI */}
        <div className="rounded-xl bg-gradient-to-r from-[#1c3b6e] to-[#2563a8] px-4 py-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <h1 className="text-lg md:text-2xl font-extrabold tracking-wide text-white uppercase">
            Painel Análise Gerencial
          </h1>
          <span className="text-[11px] md:text-xs text-white/80">Período: {periodLabel}</span>
        </div>

        {/* Filtros: ano + meses */}
        {!isMobile && (
          <Card>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Ano:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full"
                  onClick={() => setSelectedYear((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                  <SelectTrigger className="h-9 w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set([...availableYears, selectedYear, new Date().getFullYear()]))
                      .sort((a, b) => b - a)
                      .map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full"
                  onClick={() => setSelectedYear((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border border-slate-200 p-2">
                {months.map((month) => {
                  const isActive = selectedMonths.length !== 12 && selectedMonths.includes(month.value);
                  return (
                    <Button
                      key={month.value}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMonths([month.value])}
                      className={`h-8 px-3 text-xs rounded-full transition-colors shrink-0 ${
                        isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {month.label}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedYear(new Date().getFullYear());
                    setSelectedMonths([new Date().getMonth()]);
                  }}
                  className="h-8 px-3 text-xs rounded-full shrink-0 hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                >
                  Hoje
                </Button>

                <Button
                  variant={selectedMonths.length === 12 ? 'default' : 'outline'}
                  size="sm"
                  onClick={selectAllMonths}
                  className={`h-8 px-3 text-xs rounded-full shrink-0 transition-colors ${
                    selectedMonths.length === 12
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                  }`}
                >
                  Anual
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPIs */}
        {isMobile ? (
          <AnalysisSummaryCardsMobile
            receitas={kpis.receitas}
            despesas={kpis.despesas}
            saldo={kpis.saldo}
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <KpiCard
              title="Receitas Totais"
              value={formatCurrency(kpis.receitas)}
              icon={<TrendingUp className="h-5 w-5" />}
              valueClass="text-[#17a398]"
            />
            <KpiCard
              title="Despesas e Custos"
              value={formatCurrency(kpis.despesas)}
              icon={<TrendingDown className="h-5 w-5" />}
              valueClass="text-[#f2545b]"
            />
            <KpiCard
              title="Saldo"
              value={formatCurrency(kpis.saldo)}
              icon={<DollarSign className="h-5 w-5" />}
              valueClass={kpis.saldo >= 0 ? 'text-[#1c3b6e]' : 'text-[#f2545b]'}
            />
            <GaugeCard title="% Realizado - Receitas" percent={kpis.pctCAR} value={kpis.recebido} color={COLORS.entradas} />
            <GaugeCard title="% Realizado - Despesas" percent={kpis.pctCAP} value={kpis.pago} color={COLORS.saidas} />
          </div>
        )}

        {/* Linha 1: Evolução do Saldo | Entradas x Saídas x Saldo | Top Receitas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <Card className="lg:col-span-6">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-bold text-[#1c3b6e] flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-[#1c3b6e]" />
                Evolução do Saldo
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={accumulatedData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="saldoPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.entradas} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={COLORS.entradas} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="saldoNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.saidas} stopOpacity={0.05} />
                      <stop offset="100%" stopColor={COLORS.saidas} stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => compact(v)} tick={{ fontSize: 10 }} width={44} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const acumulado = payload[0].payload.acumulado;
                        return (
                          <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-2">
                            <p className="text-xs text-slate-500 capitalize">{label}</p>
                            <p className={`font-bold text-sm ${acumulado < 0 ? 'text-[#f2545b]' : 'text-[#17a398]'}`}>
                              Saldo acumulado: {formatCurrency(acumulado)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="positivo" name="Saldo" stroke={COLORS.entradas} strokeWidth={2} fill="url(#saldoPos)" baseValue={0} />
                  <Area type="monotone" dataKey="negativo" name="Saldo" stroke={COLORS.saidas} strokeWidth={2} fill="url(#saldoNeg)" baseValue={0} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-6">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-bold text-[#1c3b6e]">
                Entradas x Saídas x Saldo — {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3">
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyData} margin={{ top: 8, right: 6, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => compact(v)} tick={{ fontSize: 10 }} width={44} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value: number, name: string) => [formatCurrency(value), name]}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="entradas" name="Entradas" fill={COLORS.entradas} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="saidas" name="Saídas" fill={COLORS.saidas} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="saldo" name="Saldo" radius={[3, 3, 0, 0]}>
                      {monthlyData.map((entry, i) => (
                        <Cell key={`saldo-${i}`} fill={entry.saldo < 0 ? '#f2545b' : COLORS.saldo} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          </div>

        {/* Linha 2: Pizza | Evolução do saldo | Top Receitas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          <Card className="lg:col-span-6">
            <CardHeader className="pb-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-sm font-bold text-[#1c3b6e]">
                  Distribuição por Categoria — {periodLabel}
                </CardTitle>
                <div className="flex gap-1">
                  {(['todos', 'receita', 'despesa'] as const).map((t) => (
                    <Button
                      key={t}
                      variant={typeFilter === t ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTypeFilter(t)}
                      className="text-[11px] h-6 px-2"
                    >
                      {t === 'todos' ? 'Todos' : t === 'receita' ? 'Receitas' : 'Despesas'}
                    </Button>
                  ))}
                </div>
              </div>
              {isMobile && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full text-xs mt-2">
                      {selectedMonths.length === 12
                        ? 'Todos os meses'
                        : selectedMonths.length === 0
                          ? 'Selecionar meses'
                          : `${selectedMonths.length} mês(es) selecionado(s)`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-3" align="center">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={selectAllMonths}>
                          Todos
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={clearAllMonths}>
                          Limpar
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" onClick={() => setSelectedYear((p) => p - 1)} className="h-7 w-7 p-0">
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <span className="text-xs font-semibold min-w-[40px] text-center">{selectedYear}</span>
                          <Button variant="outline" size="sm" onClick={() => setSelectedYear((p) => p + 1)} className="h-7 w-7 p-0">
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {months.map((month) => (
                          <div
                            key={month.value}
                            className={`flex items-center gap-1 p-1.5 rounded cursor-pointer text-xs hover:bg-slate-100 ${
                              selectedMonths.includes(month.value) ? 'bg-primary/10' : ''
                            }`}
                            onClick={() => toggleMonth(month.value)}
                          >
                            <Checkbox
                              checked={selectedMonths.includes(month.value)}
                              onCheckedChange={() => toggleMonth(month.value)}
                              className="h-3 w-3"
                            />
                            <span>{month.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </CardHeader>
            <CardContent className="px-2 pb-3">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={isMobile ? 300 : 300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={false}
                      label={isMobile ? false : ({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={isMobile ? 90 : 100}
                      innerRadius={isMobile ? 40 : 50}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data: any = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-slate-800 text-sm mb-1">{data.name}</p>
                              <p className="text-xs text-slate-600 mb-1">
                                Tipo: {data.type === 'receita' ? 'Receita' : 'Despesa'}
                              </p>
                              <p className={`font-bold ${data.type === 'receita' ? 'text-[#17a398]' : 'text-[#f2545b]'}`}>
                                {formatCurrency(data.value)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: isMobile ? '10px' : '11px' }}
                      formatter={(value) => <span className="text-slate-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-slate-500">
                  <p className="text-sm font-medium mb-1">Nenhum dado encontrado</p>
                  <p className="text-xs text-center">Não há contas para o período selecionado.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#1c3b6e] flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-[#f2545b]" />
                Top 10 — Despesas/Custos
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <RankingBars
                items={topDespesas}
                color={COLORS.saidas}
                formatValue={compact}
                emptyLabel="Nenhuma despesa no período"
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-[#1c3b6e] flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-[#17a398]" />
                Top 10 — Receitas
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <RankingBars
                items={topReceitas}
                color={COLORS.entradas}
                formatValue={compact}
                emptyLabel="Nenhuma receita no período"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Analise;
