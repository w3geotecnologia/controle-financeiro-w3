
import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
} from 'recharts';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useIsMobile } from '@/hooks/use-mobile';
import { TrendingUp, TrendingDown, DollarSign, Menu } from 'lucide-react';
import { parseISO, getMonth, getYear } from 'date-fns';
import { AnalysisSummaryCardsMobile } from '@/components/Dashboard/AnalysisSummaryCardsMobile';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

const Analise: React.FC = () => {
  const { accounts } = useAccounts();
  const { categories } = useCategoriesData();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonths, setSelectedMonths] = useState<number[]>([currentMonth]);
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');

  const handleMonthChange = (startDate: Date, endDate: Date, month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  // Cores para RECEITAS (azuis, verdes, roxos - sem vermelho/laranja/amarelo)
  const RECEITA_COLORS = [
    '#3B82F6', '#22C55E', '#8B5CF6', '#06B6D4', '#10B981',
    '#6366F1', '#14B8A6', '#0EA5E9', '#84CC16', '#A855F7',
    '#2DD4BF', '#4ADE80', '#818CF8', '#38BDF8', '#34D399'
  ];

  // Cores para DESPESAS (vermelhos, laranjas, amarelos, rosas)
  const DESPESA_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#EC4899', '#FB7185',
    '#DC2626', '#EA580C', '#D97706', '#DB2777', '#F43F5E',
    '#B91C1C', '#C2410C', '#B45309', '#BE185D', '#E11D48'
  ];

  // Gerar opções de meses e anos
  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' },
  ];

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    accounts.forEach(account => {
      const year = getYear(parseISO(account.dueDate));
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [accounts]);

  const toggleMonth = (monthValue: number) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthValue)) {
        return prev.filter(m => m !== monthValue);
      } else {
        return [...prev, monthValue].sort((a, b) => a - b);
      }
    });
  };

  const selectAllMonths = () => {
    setSelectedMonths([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  };

  const clearAllMonths = () => {
    setSelectedMonths([]);
  };

  // Dados para o gráfico de barras: evolução mensal no ano selecionado.
  const barChartData = useMemo(() => {
    const monthlyValues = months
      .filter(month => selectedMonths.includes(month.value))
      .map(month => {
        const monthlyAccounts = accounts.filter(account => {
          const date = parseISO(account.dueDate);
          return getYear(date) === selectedYear && getMonth(date) === month.value;
        });

        return {
          name: month.label.slice(0, 3),
          receitas: monthlyAccounts
            .filter(account => account.type === 'receita' && (typeFilter === 'todos' || typeFilter === 'receita'))
            .reduce((sum, account) => sum + Math.abs(account.amount), 0),
          despesas: monthlyAccounts
            .filter(account => account.type === 'despesa' && (typeFilter === 'todos' || typeFilter === 'despesa'))
            .reduce((sum, account) => sum + Math.abs(account.amount), 0),
        };
      });

    const totalReceitas = monthlyValues.reduce((sum, item) => sum + item.receitas, 0);
    const totalDespesas = monthlyValues.reduce((sum, item) => sum + item.despesas, 0);

    return monthlyValues.map(item => ({
      ...item,
      receitasPercentual: totalReceitas > 0 ? (item.receitas / totalReceitas) * 100 : 0,
      despesasPercentual: totalDespesas > 0 ? (item.despesas / totalDespesas) * 100 : 0,
    }));
  }, [accounts, selectedYear, selectedMonths, typeFilter, months]);

  // Dados para despesas por categoria - filtrar por meses selecionados
  const despesasPorCategoria = useMemo(() => {
    const filteredAccounts = accounts.filter(account => {
      const date = parseISO(account.dueDate);
      const accountMonth = getMonth(date);
      const accountYear = getYear(date);
      return account.type === 'despesa' && selectedMonths.includes(accountMonth) && accountYear === selectedYear;
    });
    
    const categoryTotals: { [key: string]: number } = {};
    filteredAccounts.forEach(account => {
      const category = account.category;
      if (!categoryTotals[category]) categoryTotals[category] = 0;
      categoryTotals[category] += Math.abs(account.amount);
    });

    const result = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], index) => ({
        name,
        value,
        color: DESPESA_COLORS[index % DESPESA_COLORS.length],
        percentage: 0
      }));

    const total = result.reduce((sum, item) => sum + item.value, 0);
    result.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });
    
    return result;
  }, [accounts, selectedMonths, selectedYear]);

  // Dados para receitas por categoria - filtrar por meses selecionados
  const receitasPorCategoria = useMemo(() => {
    const filteredAccounts = accounts.filter(account => {
      const date = parseISO(account.dueDate);
      const accountMonth = getMonth(date);
      const accountYear = getYear(date);
      return account.type === 'receita' && selectedMonths.includes(accountMonth) && accountYear === selectedYear;
    });
    
    const categoryTotals: { [key: string]: number } = {};
    filteredAccounts.forEach(account => {
      const category = account.category;
      if (!categoryTotals[category]) categoryTotals[category] = 0;
      categoryTotals[category] += account.amount;
    });

    const result = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value], index) => ({
        name,
        value,
        color: RECEITA_COLORS[index % RECEITA_COLORS.length],
        percentage: 0
      }));

    const total = result.reduce((sum, item) => sum + item.value, 0);
    result.forEach(item => {
      item.percentage = total > 0 ? (item.value / total) * 100 : 0;
    });
    
    return result;
  }, [accounts, selectedMonths, selectedYear]);

  // Calcular totais - baseado nos meses selecionados
  const totals = useMemo(() => {
    const filteredAccounts = accounts.filter(account => {
      const date = parseISO(account.dueDate);
      const accountMonth = getMonth(date);
      return getYear(date) === selectedYear && selectedMonths.includes(accountMonth);
    });

    const receitas = filteredAccounts
      .filter(account => account.type === 'receita')
      .reduce((sum, account) => sum + account.amount, 0);
    
    const despesas = filteredAccounts
      .filter(account => account.type === 'despesa')
      .reduce((sum, account) => sum + Math.abs(account.amount), 0);

    return { receitas, despesas, saldo: receitas - despesas };
  }, [accounts, selectedMonths, selectedYear]);


  return (
    <Layout>
      <div className="space-y-4 pb-8">
        {/* Card Menu Principal */}
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

        {/* Card Título */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl md:text-3xl font-bold text-slate-800">
              Análise Gráfica
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Navegador de Mês/Ano - Desktop (padrão Contas) */}
        {!isMobile && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Ano:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full"
                  onClick={() => setSelectedYear(prev => prev - 1)}
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
                  onClick={() => setSelectedYear(prev => prev + 1)}
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
                        isActive
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      {month.label.slice(0, 3)}
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


        {/* Cards de Resumo */}
        {isMobile ? (
          <AnalysisSummaryCardsMobile
            receitas={totals.receitas}
            despesas={totals.despesas}
            saldo={totals.saldo}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Receitas</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">
                  R$ {totals.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Despesas</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-red-600">
                  R$ {totals.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${totals.saldo >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Saldo</CardTitle>
                <DollarSign className={`h-4 w-4 ${totals.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${totals.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráfico de Pizza */}
        <Card>
          <CardHeader className={isMobile ? "pb-3 space-y-2" : ""}>
            <div className="space-y-2">
              <CardTitle className={isMobile ? "text-base" : "text-lg md:text-xl"}>
                {selectedMonths.length === 12 
                  ? `Distribuição por Categoria - ${selectedYear}` 
                  : selectedMonths.length === 1
                    ? `Distribuição por Categoria - ${months[selectedMonths[0]].label}/${selectedYear}`
                    : `Distribuição por Categoria - ${selectedMonths.length} meses/${selectedYear}`}
              </CardTitle>
              {/* Filtro de Tipo */}
              <div className="flex gap-1">
                <Button
                  variant={typeFilter === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('todos')}
                  className="text-xs h-7 px-2"
                >
                  Todos
                </Button>
                <Button
                  variant={typeFilter === 'receita' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('receita')}
                  className="text-xs h-7 px-2"
                >
                  Receitas
                </Button>
                <Button
                  variant={typeFilter === 'despesa' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypeFilter('despesa')}
                  className="text-xs h-7 px-2"
                >
                  Despesas
                </Button>
              </div>
            </div>
            {isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    {selectedMonths.length === 12 
                      ? "Todos os meses" 
                      : selectedMonths.length === 0 
                        ? "Selecionar meses"
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedYear(prev => prev - 1)}
                          className="h-7 w-7 p-0"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-semibold min-w-[40px] text-center">{selectedYear}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedYear(prev => prev + 1)}
                          className="h-7 w-7 p-0"
                        >
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
                          <span>{month.label.slice(0, 3)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </CardHeader>
          <CardContent className={isMobile ? "px-2 pb-3" : "px-4"}>
            {barChartData.length > 0 ? (
              <div className={isMobile ? "h-[400px] w-full" : "h-[550px] w-full"}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 24, right: 12, left: 4, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                    <YAxis
                      width={isMobile ? 48 : 64}
                      tick={{ fontSize: isMobile ? 10 : 11 }}
                      tickFormatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted) / 0.45)' }}
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg text-xs space-y-1.5">
                            <p className="font-semibold text-sm">{label} / {selectedYear}</p>
                            <p className="text-green-600 font-medium">
                              Receitas: R$ {data.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({data.receitasPercentual.toFixed(1)}%)
                            </p>
                            <p className="text-red-600 font-medium">
                              Despesas: R$ {data.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({data.despesasPercentual.toFixed(1)}%)
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }} />
                    <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-slate-500">
                <p className="text-sm font-medium mb-1">Nenhum dado encontrado</p>
                <p className="text-xs text-center">Não há contas cadastradas para o período selecionado.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receitas e Despesas por Categoria - Duas colunas em Desktop */}
        {isMobile ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              {despesasPorCategoria.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-700 mb-2">
                    {selectedMonths.length === 12 
                      ? `Ano ${selectedYear}` 
                      : selectedMonths.length === 1 
                        ? `${months[selectedMonths[0]].label} de ${selectedYear}`
                        : `${selectedMonths.length} meses de ${selectedYear}`}
                  </div>
                  {despesasPorCategoria.map((category, index) => (
                    <div key={index} className="bg-card border rounded-lg p-2.5 flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: category.color }}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate mb-0.5">{category.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span className="text-xs font-medium text-slate-600">{category.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[150px] text-slate-500">
                  <p className="text-sm font-medium mb-1">Nenhuma despesa encontrada</p>
                  <p className="text-xs text-center">Não há despesas para o período selecionado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Receitas por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-green-600">Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {receitasPorCategoria.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-700 mb-4">
                      {selectedMonths.length === 12 
                        ? `Ano ${selectedYear}` 
                        : selectedMonths.length === 1 
                          ? `${months[selectedMonths[0]].label} de ${selectedYear}`
                          : `${selectedMonths.length} meses de ${selectedYear}`}
                    </div>
                    {receitasPorCategoria.map((category, index) => (
                      <div key={index} className="bg-card border rounded-lg p-2.5 flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: category.color }}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 truncate mb-0.5">{category.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600">R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span className="text-xs font-medium text-slate-600">{category.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[150px] text-slate-500">
                    <p className="text-sm font-medium mb-1">Nenhuma receita encontrada</p>
                    <p className="text-xs text-center">Não há receitas para o período selecionado.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Despesas por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-red-600">Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                {despesasPorCategoria.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-slate-700 mb-4">
                      {selectedMonths.length === 12 
                        ? `Ano ${selectedYear}` 
                        : selectedMonths.length === 1 
                          ? `${months[selectedMonths[0]].label} de ${selectedYear}`
                          : `${selectedMonths.length} meses de ${selectedYear}`}
                    </div>
                    {despesasPorCategoria.map((category, index) => (
                      <div key={index} className="bg-card border rounded-lg p-2.5 flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: category.color }}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 truncate mb-0.5">{category.name}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-600">R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span className="text-xs font-medium text-slate-600">{category.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[150px] text-slate-500">
                    <p className="text-sm font-medium mb-1">Nenhuma despesa encontrada</p>
                    <p className="text-xs text-center">Não há despesas para o período selecionado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Analise;
