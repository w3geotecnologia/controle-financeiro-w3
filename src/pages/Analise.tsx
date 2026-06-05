
import React, { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartConfig } from '@/components/ui/chart';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCategoriesData } from '@/hooks/useCategoriesData';
import { useIsMobile } from '@/hooks/use-mobile';
import { TrendingUp, TrendingDown, DollarSign, Menu, Check } from 'lucide-react';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnalysisSummaryCardsMobile } from '@/components/Dashboard/AnalysisSummaryCardsMobile';
import { MonthYearStepperMobile } from '@/components/Accounts/MonthYearStepperMobile';
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

  // Dados para gráfico de pizza - todas as categorias combinadas (receitas + despesas)
  const pieChartData = useMemo(() => {
    const filteredAccounts = accounts.filter(account => {
      const date = parseISO(account.dueDate);
      const accountMonth = getMonth(date);
      const accountYear = getYear(date);
      const matchesDate = selectedMonths.includes(accountMonth) && accountYear === selectedYear;
      const matchesType = typeFilter === 'todos' || account.type === typeFilter;
      return matchesDate && matchesType;
    });
    
    const categoryTotals: { [key: string]: { value: number; type: string } } = {};
    
    filteredAccounts.forEach(account => {
      const category = account.category;
      const key = `${category}-${account.type}`;
      if (!categoryTotals[key]) {
        categoryTotals[key] = { value: 0, type: account.type };
      }
      categoryTotals[key].value += Math.abs(account.amount);
    });

    let receitaIndex = 0;
    let despesaIndex = 0;
    
    const result = Object.entries(categoryTotals)
      .filter(([_, data]) => data.value > 0)
      .sort(([, a], [, b]) => b.value - a.value)
      .map(([key, data]) => {
        const categoryName = key.replace('-receita', '').replace('-despesa', '');
        const isReceita = data.type === 'receita';
        const color = isReceita 
          ? RECEITA_COLORS[receitaIndex++ % RECEITA_COLORS.length]
          : DESPESA_COLORS[despesaIndex++ % DESPESA_COLORS.length];
        return {
          name: categoryName,
          value: data.value,
          type: data.type,
          color,
        };
      });

    return result;
  }, [accounts, selectedYear, selectedMonths, typeFilter]);

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

  const chartConfig = {
    receitas: {
      label: "Recebido",
      color: "#22c55e",
    },
    despesas: {
      label: "Pago",
      color: "#ef4444",
    },
  } satisfies ChartConfig;

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

        {/* Navegador de Mês/Ano - Desktop com seletor de meses */}
        {!isMobile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-6">
                {/* Seletor de Meses */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="min-w-[180px]">
                      {selectedMonths.length === 12 
                        ? "Todos os meses" 
                        : selectedMonths.length === 0 
                          ? "Selecionar meses"
                          : `${selectedMonths.length} mês(es)`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3" align="center">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={selectAllMonths}>
                          Todos
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={clearAllMonths}>
                          Limpar
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {months.map((month) => (
                          <div
                            key={month.value}
                            className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer text-xs hover:bg-slate-100 ${
                              selectedMonths.includes(month.value) ? 'bg-primary/10' : ''
                            }`}
                            onClick={() => toggleMonth(month.value)}
                          >
                            <Checkbox
                              checked={selectedMonths.includes(month.value)}
                              onCheckedChange={() => toggleMonth(month.value)}
                              className="h-3.5 w-3.5"
                            />
                            <span>{month.label.slice(0, 3)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {/* Stepper de Ano */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 mr-1">Ano:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedYear(prev => prev - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-semibold text-slate-800 min-w-[50px] text-center">
                    {selectedYear}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedYear(prev => prev + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
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
            {pieChartData.length > 0 ? (
              <ChartContainer config={chartConfig} className={isMobile ? "min-h-[400px]" : "min-h-[550px]"}>
                <ResponsiveContainer width="100%" height={isMobile ? 400 : 550}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="45%"
                      labelLine={!isMobile}
                      label={isMobile ? false : ({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={isMobile ? 130 : 200}
                      innerRadius={isMobile ? 40 : 60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const tipoLabel = data.type === 'receita' ? 'Receita' : 'Despesa';
                          return (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
                              <p className="font-semibold text-slate-800 text-sm mb-1">{data.name}</p>
                              <p className="text-xs text-slate-600 mb-1">Tipo: {tipoLabel}</p>
                              <p className={`font-bold ${data.type === 'receita' ? 'text-blue-600' : 'text-red-600'}`}>
                                R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: isMobile ? '10px' : '12px' }}
                      formatter={(value) => <span className="text-slate-700">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
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
