import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Bell,
  RefreshCw,
  Landmark,
  BarChart3,
  CreditCard,
  Wallet,
  TrendingDown,
  DollarSign,
  Eye,
  EyeOff,
  Info
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
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

export const DashboardTopSection: React.FC<DashboardTopSectionProps> = ({
  currentMonth,
  currentYear,
  onMonthChange
}) => {
  const { accounts } = useAccounts();

  const [hideValues, setHideValues] = useState(false);
  const [banksTotal, setBanksTotal] = useState(0);
  const [investmentsTotal, setInvestmentsTotal] = useState(0);
  const [cardsAvailable, setCardsAvailable] = useState(0);
  const [loadingTotals, setLoadingTotals] = useState(true);
  const [now, setNow] = useState(new Date());

  // =========================================================
  // Buscar totais de bancos, investimentos e cartões
  // =========================================================
  useEffect(() => {
    let cancelled = false;

    const fetchTotals = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setLoadingTotals(false);
        }
        return;
      }

      const [banksRes, invRes, cardsRes] = await Promise.all([
        supabase
          .from('banks')
          .select('balance')
          .eq('user_id', user.id),

        supabase
          .from('investments')
          .select('current_value')
          .eq('user_id', user.id),

        supabase
          .from('creditcards')
          .select('credit_limit,current_value')
          .eq('user_id', user.id)
          .eq('is_active', true)
      ]);

      if (cancelled) return;

      const banks = (banksRes.data || []).reduce(
        (s, b) => s + (Number(b.balance) || 0),
        0
      );

      const inv = (invRes.data || []).reduce(
        (s, i) => s + (Number(i.current_value) || 0),
        0
      );

      const cards = (cardsRes.data || []).reduce(
        (s, c) =>
          s +
          ((Number(c.credit_limit) || 0) -
            (Number(c.current_value) || 0)),
        0
      );

      setBanksTotal(banks);
      setInvestmentsTotal(inv);
      setCardsAvailable(cards);
      setLoadingTotals(false);
    };

    fetchTotals();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // Atualizar "Atualizado em" a cada minuto
  // =========================================================
  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(t);
  }, []);

  // =========================================================
  // Receitas / despesas do mês atual e anterior
  // =========================================================
  const {
    receitasMes,
    despesasMes,
    receitasPrev,
    despesasPrev
  } = useMemo(() => {
    const inMonth = (
      dueDate: string,
      m: number,
      y: number
    ) => {
      const d = new Date(
        dueDate + 'T00:00:00'
      );

      return (
        d.getMonth() === m &&
        d.getFullYear() === y
      );
    };

    const prevMonth =
      currentMonth === 0
        ? 11
        : currentMonth - 1;

    const prevYear =
      currentMonth === 0
        ? currentYear - 1
        : currentYear;

    const r = accounts
      .filter(
        a =>
          a.type === 'receita' &&
          a.status?.toLowerCase() === 'recebido' &&
          a.dueDate &&
          inMonth(
            a.dueDate,
            currentMonth,
            currentYear
          )
      )
      .reduce(
        (s, a) =>
          s + (a.amount || 0),
        0
      );

    const d = accounts
      .filter(
        a =>
          a.type === 'despesa' &&
          a.status?.toLowerCase() === 'pago' &&
          a.dueDate &&
          inMonth(
            a.dueDate,
            currentMonth,
            currentYear
          )
      )
      .reduce(
        (s, a) =>
          s + Math.abs(a.amount || 0),
        0
      );

    const rp = accounts
      .filter(
        a =>
          a.type === 'receita' &&
          a.status?.toLowerCase() === 'recebido' &&
          a.dueDate &&
          inMonth(
            a.dueDate,
            prevMonth,
            prevYear
          )
      )
      .reduce(
        (s, a) =>
          s + (a.amount || 0),
        0
      );

    const dp = accounts
      .filter(
        a =>
          a.type === 'despesa' &&
          a.status?.toLowerCase() === 'pago' &&
          a.dueDate &&
          inMonth(
            a.dueDate,
            prevMonth,
            prevYear
          )
      )
      .reduce(
        (s, a) =>
          s + Math.abs(a.amount || 0),
        0
      );

    return {
      receitasMes: r,
      despesasMes: d,
      receitasPrev: rp,
      despesasPrev: dp
    };
  }, [
    accounts,
    currentMonth,
    currentYear
  ]);

  // =========================================================
  // Resultados
  // =========================================================
  const resultadoMes =
    receitasMes - despesasMes;

  const resultadoPrev =
    receitasPrev - despesasPrev;

  const saldoConsolidado =
    banksTotal + investmentsTotal;

  // =========================================================
  // Percentual de variação
  // =========================================================
  const pct = (
    curr: number,
    prev: number
  ) => {
    if (prev === 0) {
      return curr === 0
        ? 0
        : 100;
    }

    return (
      ((curr - prev) /
        Math.abs(prev)) *
      100
    );
  };

  // =========================================================
  // Formatação dos valores
  // =========================================================
  const fmt = (v: number) =>
    hideValues
      ? 'R$ ••••••'
      : formatCurrency(v);

  const fmtSigned = (v: number) =>
    hideValues
      ? 'R$ ••••••'
      : `${v < 0 ? '-' : ''}${formatCurrency(
          Math.abs(v)
        )}`;

  // =========================================================
  // Variações
  //
  // IMPORTANTE:
  // Somente seta + percentual recebem cor.
  // O texto "em relação a..." permanece neutro.
  // =========================================================
  const varText = (
    curr: number,
    prev: number,
    invert = false
  ) => {
    const p = pct(curr, prev);

    const isPositive = invert
      ? p < 0
      : p > 0;

    const arrow =
      p > 0
        ? '↑'
        : p < 0
        ? '↓'
        : '–';

    const color =
      isPositive
        ? 'text-[#16A34A]'
        : p === 0
        ? 'text-[#64748B]'
        : 'text-[#DC263D]';

    const sign =
      p > 0
        ? '+'
        : '';

    const prevLabel =
      currentMonth === 0
        ? `Dez/${currentYear - 1}`
        : `${monthNames[
            currentMonth - 1
          ].slice(0, 3)}/${currentYear}`;

    return {
      arrow,
      percentage: `${sign}${p.toFixed(
        1
      )}%`,
      label: `em relação a ${prevLabel}`,
      color
    };
  };

  // =========================================================
  // Navegação dos meses
  // =========================================================
  const navigateMonth = (
    direction: 'prev' | 'next'
  ) => {
    let m = currentMonth;
    let y = currentYear;

    if (direction === 'prev') {
      m = m - 1;

      if (m < 0) {
        m = 11;
        y = y - 1;
      }
    } else {
      m = m + 1;

      if (m > 11) {
        m = 0;
        y = y + 1;
      }
    }

    onMonthChange(m, y);
  };

  // =========================================================
  // Data/hora de atualização
  // =========================================================
  const updatedAt =
    now.toLocaleString(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  // =========================================================
  // Notificações
  // =========================================================
  const pendingCount =
    accounts.filter(
      a =>
        a.status === 'pendente'
    ).length;

  const recVar = varText(
    receitasMes,
    receitasPrev
  );

  const despVar = varText(
    despesasMes,
    despesasPrev,
    true
  );

  const resVar = varText(
    resultadoMes,
    resultadoPrev
  );

  // =========================================================
  // Cores dinâmicas
  // =========================================================

  // Contas bancárias:
  // positivo = verde
  // negativo = vermelho
  const banksValueColor =
    banksTotal >= 0
      ? 'text-[#16A34A]'
      : 'text-[#DC263D]';

  // Investimentos:
  // positivo = azul
  // negativo = vermelho
  const investmentsValueColor =
    investmentsTotal >= 0
      ? 'text-[#2563EB]'
      : 'text-[#DC263D]';

  // Cartões:
  // crédito disponível = verde
  // crédito negativo = vermelho
  const cardsValueColor =
    cardsAvailable >= 0
      ? 'text-[#16A34A]'
      : 'text-[#DC263D]';

  // Resultado:
  // positivo = azul
  // negativo = vermelho
  const resultadoValueColor =
    resultadoMes >= 0
      ? 'text-[#2563EB]'
      : 'text-[#DC263D]';

  return (
    <div className="space-y-4">

      {/* =====================================================
          CABEÇALHO
      ===================================================== */}
      <div className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        justify-between
        gap-4
        px-1
      ">

        <div>

          {/* =================================================
              PAINEL FINANCEIRO
              Degradê azul → azul/verde → verde
          ================================================= */}
          <h1 className="
            text-2xl
            sm:text-3xl
            font-bold
            bg-gradient-to-r
            from-[#2563EB]
            via-[#1687B0]
            to-[#16A34A]
            bg-clip-text
            text-transparent
          ">
            Painel Financeiro
          </h1>

          <p className="
            text-sm
            text-[#475569]
            mt-0.5
          ">
            Visão geral da sua vida financeira
          </p>

        </div>

        <div className="
          flex
          flex-wrap
          items-center
          gap-3
        ">

          {/* =================================================
              NAVEGADOR DE MÊS
          ================================================= */}
          <div className="
            flex
            items-center
            gap-1
            bg-white
            rounded-full
            shadow-sm
            border
            border-slate-200
            px-2
            py-1.5
          ">

            <Calendar className="
              h-4
              w-4
              text-[#64748B]
              ml-1
            " />

            <span className="
              text-sm
              font-semibold
              text-[#0F172A]
              min-w-[120px]
              text-center
            ">
              {monthNames[currentMonth]}{' '}
              {currentYear}
            </span>

            <div className="
              flex
              items-center
            ">

              <button
                onClick={() =>
                  navigateMonth('prev')
                }
                className="
                  p-1
                  rounded-full
                  hover:bg-slate-100
                  text-[#64748B]
                "
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="
                w-px
                h-4
                bg-slate-200
              " />

              <button
                onClick={() =>
                  navigateMonth('next')
                }
                className="
                  p-1
                  rounded-full
                  hover:bg-slate-100
                  text-[#64748B]
                "
              >
                <ChevronRight className="h-4 w-4" />
              </button>

            </div>
          </div>

          {/* =================================================
              NOTIFICAÇÕES
          ================================================= */}
          <div className="relative">

            <div className="
              bg-white
              rounded-xl
              shadow-sm
              border
              border-slate-200
              p-2
            ">
              <Bell className="
                h-5
                w-5
                text-[#475569]
              " />
            </div>

            {pendingCount > 0 && (
              <span className="
                absolute
                -top-1
                -right-1
                bg-[#DC263D]
                text-white
                text-[10px]
                font-bold
                rounded-full
                min-w-[18px]
                h-[18px]
                flex
                items-center
                justify-center
                px-1
              ">
                {pendingCount}
              </span>
            )}

          </div>

          {/* =================================================
              ATUALIZADO EM
          ================================================= */}
          <div className="
            flex
            items-center
            gap-2
            text-xs
            text-[#64748B]
          ">

            <RefreshCw className="
              h-3.5
              w-3.5
            " />

            <div>

              <span className="
                text-[#64748B]
              ">
                Atualizado em
              </span>

              <p className="
                font-medium
                text-[#1E293B]
              ">
                {updatedAt}
              </p>

            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          PRIMEIRA LINHA — SALDO CONSOLIDADO
      ===================================================== */}
      <div className="
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-slate-200
        overflow-hidden
      ">

        <div className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-4
          divide-y
          md:divide-y-0
          md:divide-x
          divide-slate-100
        ">

          {/* =================================================
              SALDO CONSOLIDADO
          ================================================= */}
          <div className="
            p-5
            lg:border-r
            border-slate-100
          ">

            <div className="
              flex
              items-center
              justify-between
              mb-2
            ">

              <div className="
                flex
                items-center
                gap-1.5
              ">

                {/* Mesmo tamanho dos outros títulos */}
                <span className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#1E293B]
                ">
                  Saldo Consolidado
                </span>

                <Info className="
                  h-3
                  w-3
                  text-[#CBD5E1]
                " />

              </div>

              <button
                onClick={() =>
                  setHideValues(v => !v)
                }
                className="
                  text-[#94A3B8]
                  hover:text-[#475569]
                "
              >
                {hideValues ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>

            </div>

            <p className="
              text-2xl
              font-bold
              text-[#0F172A]
            ">
              {loadingTotals
                ? '...'
                : fmt(saldoConsolidado)}
            </p>

            <p className="
              text-xs
              text-[#64748B]
              mt-1
            ">
              Bancos + Investimentos
            </p>

          </div>

          {/* =================================================
              CONTAS BANCÁRIAS
          ================================================= */}
          <div className="
            p-5
            flex
            items-center
            gap-3
          ">

            <div className="
              w-11
              h-11
              rounded-full
              bg-[#DCF3E2]
              flex
              items-center
              justify-center
              shrink-0
            ">
              <Landmark className="
                h-5
                w-5
                text-[#16A34A]
              " />
            </div>

            <div className="min-w-0">

              <p className="
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                text-[#1E293B]
              ">
                Contas bancárias
              </p>

              <p className={`
                text-lg
                font-bold
                truncate
                ${banksValueColor}
              `}>
                {loadingTotals
                  ? '...'
                  : fmtSigned(banksTotal)}
              </p>

            </div>

          </div>

          {/* =================================================
              INVESTIMENTOS
          ================================================= */}
          <div className="
            p-5
            flex
            items-center
            gap-3
          ">

            <div className="
              w-11
              h-11
              rounded-full
              bg-[#E3ECFD]
              flex
              items-center
              justify-center
              shrink-0
            ">
              <BarChart3 className="
                h-5
                w-5
                text-[#2563EB]
              " />
            </div>

            <div className="min-w-0">

              <p className="
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                text-[#1E293B]
              ">
                Investimentos
              </p>

              <p className={`
                text-lg
                font-bold
                truncate
                ${investmentsValueColor}
              `}>
                {loadingTotals
                  ? '...'
                  : fmtSigned(investmentsTotal)}
              </p>

            </div>

          </div>

          {/* =================================================
              CARTÕES
          ================================================= */}
          <div className="
            p-5
            flex
            items-center
            gap-3
          ">

            <div className="
              w-11
              h-11
              rounded-full
              bg-[#E3ECFD]
              flex
              items-center
              justify-center
              shrink-0
            ">
              <CreditCard className="
                h-5
                w-5
                text-[#2563EB]
              " />
            </div>

            <div className="min-w-0">

              <p className="
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                text-[#1E293B]
              ">
                Cartões
              </p>

              <p className={`
                text-lg
                font-bold
                truncate
                ${cardsValueColor}
              `}>
                {loadingTotals
                  ? '...'
                  : fmtSigned(cardsAvailable)}
              </p>

              <p className="
                text-[11px]
                text-[#64748B]
              ">
                crédito disponível
              </p>

            </div>

          </div>

        </div>
      </div>

      {/* =====================================================
          SEGUNDA LINHA — RESUMO MENSAL
      ===================================================== */}
      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-4
      ">

        {/* ===================================================
            RECEITAS
        =================================================== */}
        <div className="
          bg-white
          rounded-2xl
          shadow-sm
          border
          border-slate-200
          p-5
          flex
          items-center
          justify-between
        ">

          <div className="min-w-0">

            <p className="
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-[#1E293B]
            ">
              Receitas do Mês
            </p>

            <p className="
              text-2xl
              font-bold
              text-[#16A34A]
              mt-1
              truncate
            ">
              {fmt(receitasMes)}
            </p>

            {/* Somente seta + percentual coloridos */}
            <p className="
              text-xs
              mt-1
              text-[#64748B]
            ">
              <span className={recVar.color}>
                {recVar.arrow}{' '}
                {recVar.percentage}
              </span>{' '}
              {recVar.label}
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-full
            bg-[#DCF3E2]
            flex
            items-center
            justify-center
            shrink-0
            ml-3
          ">
            <Wallet className="
              h-6
              w-6
              text-[#16A34A]
            " />
          </div>

        </div>

        {/* ===================================================
            DESPESAS
        =================================================== */}
        <div className="
          bg-white
          rounded-2xl
          shadow-sm
          border
          border-slate-200
          p-5
          flex
          items-center
          justify-between
        ">

          <div className="min-w-0">

            <p className="
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-[#1E293B]
            ">
              Despesas do Mês
            </p>

            <p className="
              text-2xl
              font-bold
              text-[#DC263D]
              mt-1
              truncate
            ">
              {fmt(despesasMes)}
            </p>

            {/* Somente seta + percentual coloridos */}
            <p className="
              text-xs
              mt-1
              text-[#64748B]
            ">
              <span className={despVar.color}>
                {despVar.arrow}{' '}
                {despVar.percentage}
              </span>{' '}
              {despVar.label}
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-full
            bg-[#FCDBDB]
            flex
            items-center
            justify-center
            shrink-0
            ml-3
          ">
            <TrendingDown className="
              h-6
              w-6
              text-[#DC263D]
            " />
          </div>

        </div>

        {/* ===================================================
            RESULTADO
        =================================================== */}
        <div className="
          bg-white
          rounded-2xl
          shadow-sm
          border
          border-slate-200
          p-5
          flex
          items-center
          justify-between
          sm:col-span-2
          lg:col-span-1
        ">

          <div className="min-w-0">

            <p className="
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-[#1E293B]
            ">
              Resultado do Mês
            </p>

            <p className={`
              text-2xl
              font-bold
              mt-1
              truncate
              ${resultadoValueColor}
            `}>
              {fmtSigned(resultadoMes)}
            </p>

            {/* Somente seta + percentual coloridos */}
            <p className="
              text-xs
              mt-1
              text-[#64748B]
            ">
              <span className={resVar.color}>
                {resVar.arrow}{' '}
                {resVar.percentage}
              </span>{' '}
              {resVar.label}
            </p>

          </div>

          <div className="
            w-12
            h-12
            rounded-full
            bg-[#E3ECFD]
            flex
            items-center
            justify-center
            shrink-0
            ml-3
          ">
            <DollarSign className="
              h-6
              w-6
              text-[#2563EB]
            " />
          </div>

        </div>

      </div>
    </div>
  );
};
