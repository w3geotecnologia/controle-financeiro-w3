
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePreviousBalance = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPreviousBalance = async (targetYear: number) => {
    try {
      if (!user) {
        setBalance(null);
        setLoading(false);
        return;
      }

      // Buscar saldo anterior já cadastrado para o ano atual
      const firstDayOfYear = `${targetYear}-01-01`;
      
      const { data: existingBalance, error: existingError } = await supabase
        .from('accounts')
        .select('amount, type')
        .eq('user_id', user.id)
        .eq('due_date', firstDayOfYear)
        .eq('description', 'Saldo Anterior')
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Erro ao buscar saldo anterior existente:', existingError);
        setBalance(0);
        setLoading(false);
        return;
      }

      if (existingBalance) {
        const balanceValue = existingBalance.type === 'receita' 
          ? existingBalance.amount 
          : -Math.abs(existingBalance.amount);
        setBalance(balanceValue);
        setLoading(false);
        return;
      }

      // Se não existe, calcular do ano anterior
      const lastDayPrevYear = `${targetYear - 1}-12-31`;

      // Buscar todas as contas até o último dia do ano anterior
      const { data: prevYearAccounts, error: prevError } = await supabase
        .from('accounts')
        .select('amount, type, status')
        .eq('user_id', user.id)
        .lte('due_date', lastDayPrevYear)
        .neq('description', 'Saldo Anterior');

      if (prevError) {
        console.error('Erro ao buscar contas do ano anterior:', prevError);
        setBalance(0);
        setLoading(false);
        return;
      }

      // Calcular saldo final do ano anterior
      let totalReceitas = 0;
      let totalDespesas = 0;

      (prevYearAccounts || []).forEach(account => {
        if (account.type === 'receita' && account.status === 'recebido') {
          totalReceitas += account.amount;
        } else if (account.type === 'despesa' && account.status === 'pago') {
          totalDespesas += Math.abs(account.amount);
        }
      });

      const calculatedBalance = totalReceitas - totalDespesas;

      // Criar conta de saldo anterior se não for zero
      if (calculatedBalance !== 0) {
        await createPreviousBalanceAccount(calculatedBalance, firstDayOfYear);
      }

      setBalance(calculatedBalance);
    } catch (err) {
      console.error('Erro ao calcular saldo anterior:', err);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const createPreviousBalanceAccount = async (amount: number, date: string) => {
    try {
      const { error } = await supabase.from('accounts').insert({
        user_id: user!.id,
        description: 'Saldo Anterior',
        amount: Math.abs(amount),
        category: 'Saldo Anterior',
        due_date: date,
        data_conta: date,
        type: amount >= 0 ? 'receita' : 'despesa',
        status: amount >= 0 ? 'recebido' : 'pago',
        payment_source: 'bank'
      });

      if (error) {
        console.error('Erro ao criar conta de saldo anterior:', error);
      }
    } catch (err) {
      console.error('Erro ao inserir saldo anterior:', err);
    }
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    fetchPreviousBalance(currentYear);
  }, [user]);

  return {
    balance,
    loading,
    fetchPreviousBalance,
  };
};
