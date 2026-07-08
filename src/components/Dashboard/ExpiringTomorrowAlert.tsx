import React from 'react';
import { AlertTriangle, CreditCard, FileText } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAccounts } from '@/contexts/AccountsContext';
import { useCardAccounts } from '@/hooks/useCardAccounts';
import { formatCurrency } from '@/utils/formatters';

export const ExpiringTomorrowAlert: React.FC = () => {
  const { accounts } = useAccounts();
  const { cardAccounts } = useCardAccounts();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowTime = tomorrow.getTime();

  const isTomorrow = (dateString: string) => {
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

  if (expiringAccounts.length === 0 && expiringCards.length === 0) return null;

  const totalAccounts = expiringAccounts.reduce((s, a) => s + Math.abs(a.amount), 0);
  const totalCards = expiringCards.reduce((s, c) => s + Math.abs(c.amount), 0);

  return (
    <Alert variant="destructive" className="bg-white border-red-300">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="text-red-700 font-bold">
        Atenção: Vencimentos para Amanhã
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-3">
          {expiringAccounts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-red-800">
                <FileText className="h-4 w-4" />
                Contas Pendentes ({expiringAccounts.length})
              </div>
              <div className="space-y-1">
                {expiringAccounts.map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center p-2 bg-red-50 rounded text-sm"
                  >
                    <span className="font-medium truncate">{a.description}</span>
                    <span className="font-semibold text-red-700 ml-2">
                      {formatCurrency(Math.abs(a.amount))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 p-2 bg-red-100 rounded text-sm font-semibold text-red-800">
                Total: {formatCurrency(totalAccounts)}
              </div>
            </div>
          )}

          {expiringCards.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-1 text-sm font-semibold text-red-800">
                <CreditCard className="h-4 w-4" />
                Cartões Vencendo ({expiringCards.length})
              </div>
              <div className="space-y-1">
                {expiringCards.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-2 bg-red-50 rounded text-sm"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{c.description}</div>
                      {c.card_name && (
                        <div className="text-xs text-red-600 truncate">{c.card_name}</div>
                      )}
                    </div>
                    <span className="font-semibold text-red-700 ml-2">
                      {formatCurrency(Math.abs(c.amount))}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 p-2 bg-red-100 rounded text-sm font-semibold text-red-800">
                Total: {formatCurrency(totalCards)}
              </div>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
