import { useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCardAccounts } from '@/hooks/useCardAccounts';

/**
 * Agenda notificações locais no celular para contas e cartões
 * que vencem amanhã (status pendente). Somente executa em app nativo.
 */
export const useLocalNotifications = () => {
  const { accounts } = useAccounts();
  const { cardAccounts } = useCardAccounts();
  const scheduledRef = useRef<string>('');

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const run = async () => {
      try {
        // Pedir permissão
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          const req = await LocalNotifications.requestPermissions();
          if (req.display !== 'granted') {
            console.log('Permissão de notificações negada');
            return;
          }
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const tomorrowTime = tomorrow.getTime();

        const isTomorrow = (dateString?: string) => {
          if (!dateString) return false;
          const d = new Date(dateString + 'T00:00:00');
          d.setHours(0, 0, 0, 0);
          return d.getTime() === tomorrowTime;
        };

        const expiringAccounts = accounts.filter(
          (a) => a.type === 'despesa' && a.status === 'pendente' && isTomorrow(a.dueDate)
        );
        const expiringCards = cardAccounts.filter(
          (c) => c.status === 'pendente' && isTomorrow(c.due_date)
        );

        // Evitar reagendamento idêntico
        const key = `${tomorrow.toDateString()}|${expiringAccounts.length}|${expiringCards.length}`;
        if (scheduledRef.current === key) return;
        scheduledRef.current = key;

        // Cancelar notificações agendadas anteriores
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }

        if (expiringAccounts.length === 0 && expiringCards.length === 0) return;

        // Agendar para hoje às 09:00 (se já passou, agendar em 10s)
        const scheduleAt = new Date();
        scheduleAt.setHours(9, 0, 0, 0);
        if (scheduleAt.getTime() <= Date.now()) {
          scheduleAt.setTime(Date.now() + 10 * 1000);
        }

        const notifications = [];
        let id = 1;

        if (expiringAccounts.length > 0) {
          const total = expiringAccounts.reduce((s, a) => s + Math.abs(a.amount), 0);
          notifications.push({
            id: id++,
            title: '⚠️ Contas vencendo amanhã',
            body: `${expiringAccounts.length} conta(s) pendente(s) · Total: R$ ${total.toFixed(2)}`,
            schedule: { at: scheduleAt },
            smallIcon: 'ic_stat_icon_config_sample',
          });
        }

        if (expiringCards.length > 0) {
          const total = expiringCards.reduce((s, c) => s + Math.abs(c.amount), 0);
          notifications.push({
            id: id++,
            title: '💳 Cartão vencendo amanhã',
            body: `${expiringCards.length} fatura(s) pendente(s) · Total: R$ ${total.toFixed(2)}`,
            schedule: { at: new Date(scheduleAt.getTime() + 60 * 1000) },
            smallIcon: 'ic_stat_icon_config_sample',
          });
        }

        await LocalNotifications.schedule({ notifications });
        console.log(`✅ ${notifications.length} notificação(ões) agendada(s)`);
      } catch (err) {
        console.error('Erro ao agendar notificações locais:', err);
      }
    };

    run();
  }, [accounts, cardAccounts]);
};
