import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface Account {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  bank_id?: number;
  payment_source: 'bank';
  payment_source_id?: number;
  payment_source_name?: string;
}

export interface CreateAccountData extends Omit<Account, 'id' | 'parcela' | 'recorrente_id'> {
  qtd_parcelas?: number;
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  dueDate: string;
  type: 'receita' | 'despesa';
  status: 'pendente' | 'pago' | 'recebido';
  parcela?: string;
  recorrente_id?: string;
  bank_id?: number;
  payment_source: 'bank';
  payment_source_id?: number;
  payment_source_name?: string;
}

export const useAccountsData = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateBanksCache = () => {
    queryClient.invalidateQueries({ queryKey: ['banks'] });
  };

  // Carregar contas do Supabase
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.log('Usuário não autenticado - fetchAccounts');
        setAccounts([]);
        return;
      }

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar contas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as contas.",
          variant: "destructive"
        });
        return;
      }

      // Transformar dados do Supabase para o formato da aplicação
      const transformedAccounts: Account[] = data.map(account => ({
        id: account.id,
        description: account.description,
        amount: parseFloat(account.amount.toString()),
        category: account.category,
        dueDate: account.due_date,
        type: account.type as 'receita' | 'despesa',
        status: account.status as 'pendente' | 'pago' | 'recebido',
        parcela: account.parcela,
        recorrente_id: account.recorrente_id,
        bank_id: account.bank_id,
        payment_source: 'bank',
        payment_source_id: account.payment_source_id,
        payment_source_name: account.payment_source_name
      }));

      setAccounts(transformedAccounts);
      console.log(`Contas carregadas: ${transformedAccounts.length} contas encontradas`);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Criar nova conta
  const addAccount = async (accountData: CreateAccountData) => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }

      // Se tem quantidade de parcelas, criar múltiplas contas
      if (accountData.qtd_parcelas && accountData.qtd_parcelas > 1) {
        const recorrenteId = crypto.randomUUID();
        const registros = [];
        const valorPorParcela = accountData.amount / accountData.qtd_parcelas;

        for (let i = 0; i < accountData.qtd_parcelas; i++) {
          const data = new Date(accountData.dueDate);
          data.setMonth(data.getMonth() + i);

          registros.push({
            description: accountData.description,
            amount: valorPorParcela,
            category: accountData.category,
            due_date: data.toISOString().split('T')[0],
            type: accountData.type,
            status: accountData.status,
            user_id: user.id,
            parcela: `${i + 1}/${accountData.qtd_parcelas}`,
            recorrente_id: recorrenteId,
            bank_id: accountData.bank_id,
            payment_source: 'bank',
            payment_source_id: accountData.payment_source_id,
            payment_source_name: accountData.payment_source_name
          });
        }

        const { data: insertData, error } = await supabase
          .from('accounts')
          .insert(registros)
          .select();

        if (error) {
          console.error('Erro ao criar parcelas:', error);
          toast({
            title: "Erro",
            description: "Não foi possível criar as parcelas.",
            variant: "destructive"
          });
          return;
        }

        // Transformar e adicionar à lista local
        const newAccounts = insertData.map(account => ({
          id: account.id,
          description: account.description,
          amount: parseFloat(account.amount.toString()),
          category: account.category,
          dueDate: account.due_date,
          type: account.type as 'receita' | 'despesa',
          status: account.status as 'pendente' | 'pago' | 'recebido',
          parcela: account.parcela,
          recorrente_id: account.recorrente_id,
          bank_id: account.bank_id,
          payment_source: 'bank' as const,
          payment_source_id: account.payment_source_id,
          payment_source_name: account.payment_source_name
        }));

        setAccounts(prev => [...newAccounts, ...prev]);
        
        // SÓ invalidar cache se a conta for paga/recebida
        if (accountData.status === 'pago' || accountData.status === 'recebido') {
          invalidateBanksCache();
        }
                
        toast({
          title: "Sucesso",
          description: `${accountData.qtd_parcelas} parcelas criadas com sucesso.`,
        });
      } else {
        // Criar conta única
        const { data, error } = await supabase
          .from('accounts')
          .insert([{
            description: accountData.description,
            amount: accountData.amount,
            category: accountData.category,
            due_date: accountData.dueDate,
            type: accountData.type,
            status: accountData.status,
            user_id: user.id,
            bank_id: accountData.bank_id,
            payment_source: 'bank',
            payment_source_id: accountData.payment_source_id,
            payment_source_name: accountData.payment_source_name
          }])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar conta:', error);
          toast({
            title: "Erro",
            description: "Não foi possível criar a conta.",
            variant: "destructive"
          });
          return;
        }

        // Transformar e adicionar à lista local
        const newAccount: Account = {
          id: data.id,
          description: data.description,
          amount: parseFloat(data.amount.toString()),
          category: data.category,
          dueDate: data.due_date,
          type: data.type as 'receita' | 'despesa',
          status: data.status as 'pendente' | 'pago' | 'recebido',
          parcela: data.parcela,
          recorrente_id: data.recorrente_id,
          bank_id: data.bank_id,
          payment_source: 'bank',
          payment_source_id: data.payment_source_id,
          payment_source_name: data.payment_source_name
        };

        setAccounts(prev => [newAccount, ...prev]);
        
        // SÓ invalidar cache se a conta for paga/recebida
        if (accountData.status === 'pago' || accountData.status === 'recebido') {
          invalidateBanksCache();
        }
        
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta.",
        variant: "destructive"
      });
    }
  };

  // Função para atualizar saldos anteriores em cascata
  const updateSubsequentBalances = async (fromDate: string) => {
    try {
      const accountDate = new Date(fromDate + 'T00:00:00');
      const startYear = accountDate.getFullYear();
      const startMonth = accountDate.getMonth();
      
      // Buscar todos os meses que têm contas a partir do mês seguinte
      const { data: nextMonthsData, error } = await supabase
        .from('accounts')
        .select('due_date')
        .eq('user_id', user.id)
        .gte('due_date', new Date(startYear, startMonth + 1, 1).toISOString().split('T')[0])
        .order('due_date');

      if (error) {
        console.error('Erro ao buscar meses subsequentes:', error);
        return;
      }

      // Obter lista única de meses que precisam ser atualizados
      const monthsToUpdate = new Set<string>();
      nextMonthsData?.forEach(row => {
        const date = new Date(row.due_date + 'T00:00:00');
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        monthsToUpdate.add(monthKey);
      });

      // Converter para array ordenado
      const sortedMonths = Array.from(monthsToUpdate)
        .map(monthKey => {
          const [year, month] = monthKey.split('-').map(Number);
          return { year, month };
        })
        .sort((a, b) => a.year - b.year || a.month - b.month);

      // Atualizar cada mês em sequência
      for (const { year, month } of sortedMonths) {
        await updatePreviousBalanceForMonth(year, month);
      }

    } catch (error) {
      console.error('Erro ao atualizar saldos subsequentes:', error);
    }
  };

  // Função para atualizar saldo anterior de um mês específico
  const updatePreviousBalanceForMonth = async (targetYear: number, targetMonth: number) => {
    try {
      // Primeiro remover saldo anterior existente
      const targetDate = new Date(targetYear, targetMonth, 1).toISOString().split('T')[0];
      
      await supabase
        .from('accounts')
        .delete()
        .eq('user_id', user.id)
        .eq('due_date', targetDate)
        .eq('description', 'Saldo Anterior');

      // Calcular saldo do mês anterior
      const prevMonth = targetMonth - 1;
      const prevYear = targetMonth === 0 ? targetYear - 1 : targetYear;
      const prevMonthAdjusted = targetMonth === 0 ? 11 : prevMonth;

      const prevStart = new Date(prevYear, prevMonthAdjusted, 1).toISOString().split('T')[0];
      const prevEnd = new Date(prevYear, prevMonthAdjusted + 1, 0).toISOString().split('T')[0];

      const { data: prevAccounts, error } = await supabase
        .from('accounts')
        .select('amount, type, status, description')
        .eq('user_id', user.id)
        .gte('due_date', prevStart)
        .lte('due_date', prevEnd);

      if (error) {
        console.error('Erro ao buscar contas do mês anterior:', error);
        return;
      }

      const allPrevAccounts = (prevAccounts || []) as any[];

      // Calcular saldo anterior
      let saldoAnteriorPrev = 0;
      const saldoAnteriorRow = allPrevAccounts.find(a => a.description === "Saldo Anterior");
      if (saldoAnteriorRow) {
        saldoAnteriorPrev = saldoAnteriorRow.type === "receita" 
          ? saldoAnteriorRow.amount 
          : -Math.abs(saldoAnteriorRow.amount);
      }

      // Contas reais do mês anterior
      const prevMonthAccounts = allPrevAccounts.filter(a => a.description !== "Saldo Anterior");

      const totalRecebidoPrev = prevMonthAccounts
        .filter(a => a.type === "receita" && a.status === "recebido")
        .reduce((s, a) => s + (a.amount || 0), 0);

      const totalPagoPrev = prevMonthAccounts
        .filter(a => a.type === "despesa" && a.status === "pago")
        .reduce((s, a) => s + Math.abs(a.amount || 0), 0);

      // Saldo final do mês anterior
      const saldoFinalPrev = saldoAnteriorPrev + totalRecebidoPrev - totalPagoPrev;

      // Criar novo saldo anterior se diferente de zero
      if (saldoFinalPrev !== 0) {
        const insertPayload = {
          description: "Saldo Anterior",
          amount: Math.abs(saldoFinalPrev),
          category: "Saldo Anterior",
          due_date: targetDate,
          type: saldoFinalPrev >= 0 ? "receita" : "despesa",
          status: saldoFinalPrev >= 0 ? "recebido" : "pago",
          user_id: user.id,
          payment_source: null,
          payment_source_id: null,
          payment_source_name: null
        };

        await supabase.from("accounts").insert([insertPayload]);
      }

    } catch (error) {
      console.error('Erro ao atualizar saldo anterior do mês:', error);
    }
  };

  // Atualizar conta
  const updateAccount = async (updatedAccount: Account) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          description: updatedAccount.description,
          amount: updatedAccount.amount,
          category: updatedAccount.category,
          due_date: updatedAccount.dueDate,
          type: updatedAccount.type,
          status: updatedAccount.status,
          bank_id: updatedAccount.bank_id,
          payment_source: 'bank',
          payment_source_id: updatedAccount.payment_source_id,
          payment_source_name: updatedAccount.payment_source_name
        })
        .eq('id', updatedAccount.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar conta:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a conta.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar na lista local
      setAccounts(prev => 
        prev.map(account => 
          account.id === updatedAccount.id ? updatedAccount : account
        )
      );

      // SÓ invalidar cache se a conta for paga/recebida
      if (updatedAccount.status === 'pago' || updatedAccount.status === 'recebido') {
        invalidateBanksCache();
      }

      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conta.",
        variant: "destructive"
      });
    }
  };

  // Deletar conta
  const deleteAccount = async (accountId: number) => {
    try {
      // Buscar a conta antes de deletar para verificar se precisa reverter saldo
      const accountToDelete = accounts.find(acc => acc.id === accountId);
      
      console.log('🗑️ Tentando deletar conta:', accountToDelete);
      
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao deletar conta:', error);
        toast({
          title: "Erro",
          description: `Não foi possível deletar a conta: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('✅ Conta deletada com sucesso do banco de dados');

      // Remover da lista local
      setAccounts(prev => prev.filter(account => account.id !== accountId));

      // Se a conta deletada era paga/recebida, invalidar cache para reverter saldo
      if (accountToDelete && (accountToDelete.status === 'pago' || accountToDelete.status === 'recebido')) {
        invalidateBanksCache();
      }

      toast({
        title: "Sucesso",
        description: "Conta deletada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conta.",
        variant: "destructive"
      });
    }
  };

  // Atualizar status da conta
  const updateAccountStatus = async (id: number, status: 'pendente' | 'pago' | 'recebido') => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }
      const { error } = await supabase
        .from('accounts')
        .update({ status })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status.",
          variant: "destructive"
        });
        return;
      }

      // Atualizar na lista local
      setAccounts(prev => prev.map(acc => 
        acc.id === id ? { ...acc, status } : acc
      ));
      
      // SEMPRE invalidar cache quando status muda (pode afetar saldo)
      invalidateBanksCache();
        
      toast({
        title: "Sucesso",
        description: "Status da conta atualizado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [user]);

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    updateAccountStatus,
    refreshAccounts: fetchAccounts
  };
};
