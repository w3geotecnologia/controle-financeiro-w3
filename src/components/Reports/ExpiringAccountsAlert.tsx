
import React from 'react';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAccounts } from '@/contexts/AccountsContext';

export const ExpiringAccountsAlert: React.FC = () => {
  const { accounts } = useAccounts();

  // Calcular data de amanhã
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Calcular data de depois de amanhã (2 dias)
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  twoDaysFromNow.setHours(0, 0, 0, 0);

  // Filtrar despesas que vencem amanhã e estão pendentes
  const expiringTomorrow = accounts.filter(account => {
    if (account.type !== 'despesa' || account.status !== 'pendente') {
      return false;
    }

    const dueDate = new Date(account.dueDate + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() === tomorrow.getTime();
  });

  // Filtrar despesas que vencem em dois dias e estão pendentes
  const expiringInTwoDays = accounts.filter(account => {
    if (account.type !== 'despesa' || account.status !== 'pendente') {
      return false;
    }

    const dueDate = new Date(account.dueDate + 'T00:00:00');
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() === twoDaysFromNow.getTime();
  });

  // Se não há contas vencendo, não mostrar nada
  if (expiringTomorrow.length === 0 && expiringInTwoDays.length === 0) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return `R$ ${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      // Trata a data como local para evitar problemas de timezone
      const date = new Date(dateString + 'T00:00:00');
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Alerta para contas vencendo amanhã */}
      {expiringTomorrow.length > 0 && (
        <Alert variant="destructive" className="bg-white">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            <Calendar size={16} />
            Despesas Vencendo Amanhã
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p className="text-sm font-medium">
                {expiringTomorrow.length} despesa{expiringTomorrow.length > 1 ? 's' : ''} vence{expiringTomorrow.length === 1 ? '' : 'm'} amanhã:
              </p>
              <div className="space-y-1">
                {expiringTomorrow.map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-2 bg-red-50 rounded text-sm">
                    <div>
                      <span className="font-medium">{account.description}</span>
                      <span className="text-red-600 ml-2">({account.category})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-red-700">
                        {formatCurrency(account.amount)}
                      </div>
                      <div className="text-xs text-red-600">
                        {formatDate(account.dueDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-red-100 rounded">
                <span className="font-semibold text-red-800">
                  Total a vencer: {formatCurrency(
                    expiringTomorrow.reduce((sum, account) => sum + Math.abs(account.amount), 0)
                  )}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta para contas vencendo em dois dias */}
      {expiringInTwoDays.length > 0 && (
        <Alert className="border-orange-200 bg-white">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertTitle className="flex items-center gap-2 text-orange-800">
            <Calendar size={16} />
            Despesas Vencendo em 2 Dias
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p className="text-sm font-medium text-orange-800">
                {expiringInTwoDays.length} despesa{expiringInTwoDays.length > 1 ? 's' : ''} vence{expiringInTwoDays.length === 1 ? '' : 'm'} em 2 dias:
              </p>
              <div className="space-y-1">
                {expiringInTwoDays.map((account) => (
                  <div key={account.id} className="flex justify-between items-center p-2 bg-orange-100 rounded text-sm">
                    <div>
                      <span className="font-medium text-orange-900">{account.description}</span>
                      <span className="text-orange-700 ml-2">({account.category})</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-800">
                        {formatCurrency(account.amount)}
                      </div>
                      <div className="text-xs text-orange-600">
                        {formatDate(account.dueDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-orange-200 rounded">
                <span className="font-semibold text-orange-900">
                  Total a vencer: {formatCurrency(
                    expiringInTwoDays.reduce((sum, account) => sum + Math.abs(account.amount), 0)
                  )}
                </span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
