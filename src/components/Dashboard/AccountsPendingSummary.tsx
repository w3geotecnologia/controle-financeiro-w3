import React from 'react';
import { Receipt, Calendar, ArrowDown, ArrowUp } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountsContext';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AccountsPendingSummary: React.FC = () => {
  const { accounts, loading } = useAccounts();

  const accountSummary = React.useMemo(() => {
    const today = new Date();
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const pendingAccounts = accounts.filter(acc => {
      if (!acc.dueDate || acc.description === 'Saldo Anterior') return false;
      const dueDate = new Date(acc.dueDate + 'T00:00:00');
      return acc.status === 'pendente' && dueDate >= startOfCurrentMonth;
    });

    const summary = pendingAccounts.reduce((acc, account) => {
      const key = account.description || 'Conta sem nome';

      if (!acc[key]) {
        acc[key] = {
          name: key,
          total: 0,
          count: 0,
          nearestDueDate: account.dueDate,
          type: account.type,
        };
      }

      acc[key].total += account.amount;
      acc[key].count += 1;

      if (new Date(account.dueDate + 'T00:00:00') < new Date(acc[key].nearestDueDate + 'T00:00:00')) {
        acc[key].nearestDueDate = account.dueDate;
      }

      return acc;
    }, {} as Record<string, { name: string; total: number; count: number; nearestDueDate: string; type: 'receita' | 'despesa' }>);

    return Object.values(summary).sort((a, b) => b.total - a.total);
  }, [accounts]);

  const totalPending = accountSummary.reduce((sum, acc) => sum + acc.total, 0);

  if (loading) {
    return (
      <Card className="bg-white shadow-lg border border-slate-200 rounded-xl sm:rounded-2xl">
        <CardHeader className="border-b border-slate-200 p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Valores Pendentes por Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (accountSummary.length === 0) {
    return (
      <Card className="bg-white shadow-lg border border-slate-200 rounded-xl sm:rounded-2xlxlc">
        <CardHeader className="border-b border-slate-200 p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
            <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Valores Pendentes por Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">Nenhuma conta pendente</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border border-slate-200 rounded-xl sm:rounded-2xl">
      <CardHeader className="border-b border-slate-200 p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-slate-800 text-base sm:text-lg">
          <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          Valores Pendentes por Conta
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-6 p-3 sm:p-6">
        <div className="space-y-2 sm:space-y-4">
          {accountSummary.map((acc) => {
            const dueDate = new Date(acc.nearestDueDate + 'T00:00:00');
            const today = new Date();
            const isOverdue = dueDate < today;
            const isReceita = acc.type === 'receita';

            return (
              <div
                key={acc.name}
                className="flex items-center gap-1.5 sm:gap-3 p-2 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <div className={`p-1 sm:p-2 rounded-lg flex-shrink-0 ${isReceita ? 'bg-green-100' : 'bg-red-100'}`}>
                  {isReceita ? (
                    <ArrowUp className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-600" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-xs sm:text-base truncate">{acc.name}</p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {acc.count} {acc.count === 1 ? 'conta' : 'contas'}
                  </p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Calendar className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-slate-500 flex-shrink-0" />
                    <p className={`text-[10px] sm:text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'} truncate`}>
                      Venc: {format(dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                      {isOverdue && ' (Vencida)'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm sm:text-lg font-bold ${isReceita ? 'text-green-600' : 'text-red-600'}`}>
                    {isReceita ? '+' : '-'}{formatCurrency(Math.abs(acc.total))}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t-2 border-slate-300">
            <div className="flex items-center justify-between p-2 sm:p-4 bg-blue-50 rounded-lg">
              <p className="font-bold text-slate-800 text-sm sm:text-lg">Total Geral</p>
              <p className={`text-base sm:text-xl font-bold ${totalPending >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalPending >= 0 ? '+' : '-'}{formatCurrency(Math.abs(totalPending))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
