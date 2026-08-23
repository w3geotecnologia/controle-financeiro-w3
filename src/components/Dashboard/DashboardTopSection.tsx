import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Bell, RefreshCw,
  Landmark, BarChart3, CreditCard, Wallet, TrendingDown, DollarSign, Eye, EyeOff, Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAccounts } from '@/contexts/AccountsContext';
import { formatCurrency } from '@/utils/formatters';

interface DashboardTopSectionProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const DashboardTopSection: React.FC<DashboardTopSectionProps> = ({
  currentMonth, currentYear, onMonthChange
}) => {
  const { accounts } = useAccounts();
  const [hideValues, setHideValues] = useState(false);
  const [banksTotal, setBanksTotal] = useState(0);
  const [investmentsTotal, setInvestmentsTotal] = useState(0);
  const [cardsAvailable, setCardsAvailable] = useState(0);
  const [loadingTotals, setLoadingTotals] = useState(true);
  const [now, setNow] = useState(new Date());

  // Fetch banks, investments, credit cards totals
  useEffect(() => {
    let cancelled = false;
    const fetchTotals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setLoadingTotals(false); return; }

      const [banksRes, invRes, cardsRes] = await Promise.all([
        supabase.from('banks').select('balance').eq('user_id', user.id),
        supabase.from('investments').select('current_value').eq('user_id', user.id),
        supabase.from('creditcards').select('credit_limit,current_value').eq('user_id', user.id).eq('is_active', true),
      ]);

      if (cancelled) return;

      const banks = (banksRes.data || []).reduce((s, b) => s + (Number(b.balance) || 0), 0);
      const inv = (invRes.data || []).reduce((s, i) => s + (Number(i.current_value) || 0), 0);
      const cards = (cardsRes.data || []).reduce(
        (s, c) => s + ((Number(c.credit_limit) || 0) - (Number(c.current_value) || 0)), 0
      );

      setBanksTotal(banks);
      setInvestmentsTotal(inv);
      setCardsAvailable(cards);
      setLoadingTotals(false);
    };
    fetchTotals();
    return () => { cancelled = true; };
  }, []);

  // Update "Atualizado em" every minute
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Monthly receitas / despesas for selected month and previous month
  const { receitasMes, despesasMes, receitasPrev, despesasPrev } = useMemo(() => {
    const inMonth = (dueDate: string, m: number, y: number) => {
      const d = new Date(dueDate + 'T00:00:00');
      return d.getMonth() === m && d.getFullYear() === y;
    };
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const r = accounts
      .filter(a => a.type === 'receita' && a.status?.toLowerCase() === 'recebido' && a.dueDate && inMonth(a.dueDate, currentMonth, currentYear))
      .reduce((s, a) => s + (a.amount || 0), 0);
    const d = accounts
      .filter(a => a.type === 'despesa' && a.status?.toLowerCase() === 'pago' && a.dueDate && inMonth(a.dueDate, currentMonth, currentYear))
      .reduce((s, a) => s + Math.abs(a.amount || 0), 0);
    const rp = accounts
      .filter(a => a.type === 'receita' && a.status?.toLowerCase() === 'recebido' && a.dueDate && inMonth(a.dueDate, prevMonth, prevYear))
      .reduce((s, a) => s + (a.amount || 0), 0);
    const dp = accounts
      .filter(a => a.type === 'despesa' && a.status?.toLowerCase() === 'pago' && a.dueDate && inMonth(a.dueDate, prevMonth, prevYear))
      .reduce((s, a) => s + Math.abs(a.amount || 0), 0);

    return { receitasMes: r, despesasMes: d, receitasPrev: rp, despesasPrev: dp };
  }, [accounts, currentMonth, currentYear]);

  const resultadoMes = receitasMes - despesasMes;
  const resultadoPrev = receitasPrev - despesasPrev;

  const saldoConsolidado = banksTotal + investmentsTotal;

  const pct = (curr: number, prev: number) => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const fmt = (v: number) => hideValues ? 'R$ ••••••' : formatCurrency(v);
  const fmtSigned = (v: number) => hideValues ? 'R$ ••••••' : `${v < 0 ? '-' : ''}${formatCurrency(Math.abs(v))}`;

  const varText = (curr: number, prev: number, invert = false) => {
    const p = pct(curr, prev);
    const isUp = invert ? p < 0 : p > 0;
    const arrow = p > 0 ? '↑' : p < 0 ? '↓' : '–';
    const color = isUp ? 'text-green-600' : p === 0 ? 'text-slate-400' : 'text-red-600';
    const sign = p > 0 ? '+' : '';
    const prevLabel = currentMonth === 0 ? `Dez/${currentYear - 1}` : `${monthNames[currentMonth - 1].slice(0, 3)}/${currentYear}`;
    return { text: `${arrow} ${sign}${p.toFixed(1)}% em relação a ${prevLabel}`, color };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    let m = currentMonth, y = currentYear;
    if (direction === 'prev') { m = m - 1; if (m < 0) { m = 11; y = y - 1; } }
    else { m = m + 1; if (m > 11) { m = 0; y = y + 1; } }
    onMonthChange(m, y);
  };

  const updatedAt = now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Pending count for notification badge
  const pendingCount = accounts.filter(a => a.status === 'pendente').length;

  const recVar = varText(receitasMes, receitasPrev);
  const despVar = varText(despesasMes, despesPrev, true); // despesa up is bad
  const resVar = varText(resultadoMes, resultadoPrev);

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Painel Financeiro</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão geral da sua vida financeira</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Navegador de mês */}
          <div className="flex items-center gap-1 bg-white rounded-full shadow-sm border border-slate-200 px-2 py-1.5">
            <Calendar className="h-4 w-4 text-slate-400 ml-1" />
            <span className="text-sm font-semibold text-slate-700 min-w-[120px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center">
              <button onClick={() => navigateMonth('prev')} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="w-px h-4 bg-slate-200" />
              <button onClick={() => navigateMonth('next')} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notificações */}
          <div className="relative">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
              <Bell className="h-5 w-5 text-slate-500" />
            </div>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {pendingCount}
              </span>
            )}
          </div>

          {/* Atualizado em */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw className="h-3.5 w-3.5" />
            <div>
              <span className="text-slate-400">Atualizado em</span>
              <p className="font-medium text-slate-700">{updatedAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primeira linha: Saldo Consolidado */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Saldo Consolidado */}
          <div className="p-5 lg:border-r border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Saldo Consolidado</span>
                <Info className="h-3 w-3 text-slate-300" />
              </div>
              <button onClick={() => setHideValues(v => !v)} className="text-slate-300 hover:text-slate-500">
                {hideValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-2xl font-bold text-slate-900">{loadingTotals ? '...' : fmt(saldoConsolidado)}</p>
            <p className="text-xs text-slate-400 mt-1">Bancos + Investimentos</p>
          </div>

          {/* Contas bancárias */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <Landmark className="h-5 w-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Contas bancárias</p>
              <p className="text-lg font-bold text-green-600 truncate">{loadingTotals ? '...' : fmt(banksTotal)}</p>
            </div>
          </div>

          {/* Investimentos */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Investimentos</p>
              <p className="text-lg font-bold text-blue-600 truncate">{loadingTotals ? '...' : fmt(investmentsTotal)}</p>
            </div>
          </div>

          {/* Cartões */}
          <div className="p-5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cartões</p>
              <p className="text-lg font-bold text-red-600 truncate">
                {loadingTotals ? '...' : fmtSigned(cardsAvailable)}
              </p>
              <p className="text-[10px] text-slate-400">crédito disponível</p>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda linha: Resumo mensal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Receitas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Receitas do Mês</p>
            <p className="text-2xl font-bold text-green-600 mt-1 truncate">{fmt(receitasMes)}</p>
            <p className={`text-xs mt-1 ${recVar.color}`}>{recVar.text}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center shrink-0 ml-3">
            <Wallet className="h-6 w-6 text-green-600" />
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Despesas do Mês</p>
            <p className="text-2xl font-bold text-red-600 mt-1 truncate">{fmt(despesasMes)}</p>
            <p className={`text-xs mt-1 ${despVar.color}`}>{despVar.text}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0 ml-3">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
        </div>

        {/* Resultado */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Resultado do Mês</p>
            <p className={`text-2xl font-bold mt-1 truncate ${resultadoMes >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {fmtSigned(resultadoMes)}
            </p>
            <p className={`text-xs mt-1 ${resVar.color}`}>{resVar.text}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0 ml-3">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
};
