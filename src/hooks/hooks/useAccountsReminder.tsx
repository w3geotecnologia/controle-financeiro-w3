
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Account } from '@/contexts/AccountsContext';

export const useAccountsReminder = (accounts: Account[]) => {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReminderActive, setIsReminderActive] = useState(true);
  const lastCheckRef = useRef<string>('');

  const checkDueAccounts = () => {
    if (!isReminderActive || accounts.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Filtrar apenas despesas pendentes que vencem hoje
    const dueExpenses = accounts.filter(account => 
      account.type === 'despesa' && 
      account.status === 'pendente' && 
      account.dueDate === today
    );

    // Evitar alertas duplicados - só mostrar se houver despesas e não foi mostrado recentemente
    const checkKey = `${today}-${dueExpenses.length}`;
    if (dueExpenses.length > 0 && lastCheckRef.current !== checkKey) {
      lastCheckRef.current = checkKey;
      
      const expenseNames = dueExpenses.map(acc => acc.description).join(', ');
      
      console.log(`📅 Lembrete: ${dueExpenses.length} despesa(s) vencem hoje: ${expenseNames}`);
      
      toast({
        title: "⚠️ Lembrete de Pagamento",
        description: `Hoje é a data para Pagamento desta Despesa!! ${expenseNames}`,
        duration: 2000, // 2 segundos
      });
    }
  };

  useEffect(() => {
    if (!isReminderActive) return;

    // Verificar imediatamente ao carregar
    checkDueAccounts();

    // Configurar intervalo de 30 minutos (30 * 60 * 1000 ms)
    intervalRef.current = setInterval(checkDueAccounts, 30 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [accounts, isReminderActive]);

  const reactivateReminder = () => {
    setIsReminderActive(true);
  };

  return {
    isReminderActive,
    reactivateReminder
  };
};
