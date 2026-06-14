// pages/Contas.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Menu, Plus, FileText, Search } from 'lucide-react';

import { Layout } from '@/components/Layout';
import { AccessControlWrapper } from '@/components/AccessControlWrapper';
import { AccountsHeader } from '@/components/Accounts/AccountsHeader';
import { AccountsFilters } from '@/components/Accounts/AccountsFilters';
import { AccountsSummaryCards } from '@/components/Accounts/AccountsSummaryCards';
import { AccountsSummaryCardsMobile } from '@/components/Accounts/AccountsSummaryCardsMobile';
import { AccountsListMobile } from '@/components/Accounts/AccountsListMobile';
import { AccountsTable } from '@/components/Accounts/AccountsTable';
import { AccountModal, AccountFormData } from '@/components/Accounts/AccountModal';
import { MonthNavigator } from '@/components/Accounts/MonthNavigator';
import { MonthYearStepperMobile } from '@/components/Accounts/MonthYearStepperMobile';

import { useAccounts } from '@/contexts/AccountsContext';
import { useAccountsReminder } from '@/hooks/useAccountsReminder';
import { useAccountFilters } from '@/hooks/useAccountFilters';
import { useAccountOperations } from '@/hooks/useAccountOperations';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ---------------------------------------------------------------------------
// Helper: parseia "YYYY-MM-DD" sem bug de fuso horário
// (mesmo helper de useAccountFilters — idealmente mover para utils/date.ts)
// ---------------------------------------------------------------------------
function parseDateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const CATEGORIES = [
  'Trabalho', 'Moradia', 'Utilidades',
  'Alimentação', 'Transporte', 'Lazer',
];

// ---------------------------------------------------------------------------
// Hook: avisa sobre contas vencendo amanhã
// (extraído para não poluir o componente)
// ---------------------------------------------------------------------------
function useDueTomorrowToast(accounts: any[]) {
  const { toast } = useToast();

  React.useEffect(() => {
    if (!accounts?.length) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dueTomorrow = accounts.filter((acc) => {
      if (acc.status !== 'pendente' || !acc.dueDate) return false;
      const due = parseDateLocal(acc.dueDate);
      return due.getTime() === tomorrow.getTime();
    });

    if (dueTomorrow.length > 0) {
      toast({
        title: '⚠️ Aviso de Vencimento',
        description: `${dueTomorrow.length} conta(s) vencem amanhã. Verifique!`,
        duration: 4000,
      });
    }
  }, [accounts, toast]);
}

// ---------------------------------------------------------------------------
// Hook: cálculos de saldo centralizados
// ---------------------------------------------------------------------------
function useBalanceCalculations(
  accounts: any[],
  currentMonth: number,
  currentYear: number,
  isShowingAll: boolean,
) {
  // Saldo acumulado até um determinado mês/ano (apenas lançamentos pagos/recebidos)
  const accumulatedBalance = React.useCallback(
    (untilMonth: number, untilYear: number): number => {
      if (!accounts?.length) return 0;
      let received = 0;
      let paid = 0;

      for (const acc of accounts) {
        if (!acc.dueDate || acc.description === 'Saldo Anterior') continue;
        const d = parseDateLocal(acc.dueDate);
        const inRange =
          d.getFullYear() < untilYear ||
          (d.getFullYear() === untilYear && d.getMonth() <= untilMonth);
        if (!inRange) continue;
        if
