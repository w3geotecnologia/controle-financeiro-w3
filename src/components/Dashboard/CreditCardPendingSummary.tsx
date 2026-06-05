import React from 'react';
import { CreditCard, Calendar } from 'lucide-react';
import { useCardAccounts } from '@/hooks/useCardAccounts';
import { formatCurrency } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CreditCardPendingSummary: React.FC = () => {
  const { cardAccounts, loading } = useCardAccounts();

  // Agrupar contas pendentes por cartão e calcular totais
  const cardSummary = React.useMemo(() => {
    const today = new Date();
    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Filtrar contas pendentes com vencimento do mês atual em diante
    const pendingAccounts = cardAccounts.filter(acc => {
      const dueDate = new Date(acc.due_date);
      return acc.status === 'pendente' && dueDate >= startOfCurrentMonth;
    });
    
    const summary = pendingAccounts.reduce((acc, account) => {
      const cardName = account.card_name || 'Cartão sem nome';
      
      if (!acc[cardName]) {
        acc[cardName] = {
          cardName,
          total: 0,
          count: 0,
          nearestDueDate: account.due_date
        };
      }
      
      acc[cardName].total += account.amount;
      acc[cardName].count += 1;
      
      // Atualizar para a data de vencimento mais próxima
      if (new Date(account.due_date) < new Date(acc[cardName].nearestDueDate)) {
        acc[cardName].nearestDueDate = account.due_date;
      }
      
      return acc;
    }, {} as Record<string, { cardName: string; total: number; count: number; nearestDueDate: string }>);
    
    return Object.values(summary).sort((a, b) => b.total - a.total);
  }, [cardAccounts]);

  const totalPending = cardSummary.reduce((sum, card) => sum + card.total, 0);

  if (loading) {
    return (
      <Card className="bg-white shadow-lg border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Valores Pendentes por Cartão
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center text-slate-500">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (cardSummary.length === 0) {
    return (
      <Card className="bg-white shadow-lg border border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Valores Pendentes por Cartão
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
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          Valores Pendentes por Cartão
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-6 p-3 sm:p-6">
        <div className="space-y-2 sm:space-y-4">
          {cardSummary.map((card) => {
            const dueDate = new Date(card.nearestDueDate);
            const today = new Date();
            const isOverdue = dueDate < today;
            
            return (
              <div
                key={card.cardName}
                className="flex items-center gap-1.5 sm:gap-3 p-2 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <div className="p-1 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <CreditCard className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-xs sm:text-base truncate">{card.cardName}</p>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {card.count} {card.count === 1 ? 'conta' : 'contas'}
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
                  <p className="text-sm sm:text-lg font-bold text-red-600">
                    {formatCurrency(card.total)}
                  </p>
                </div>
              </div>
            );
          })}
          
          <div className="pt-2 sm:pt-4 mt-2 sm:mt-4 border-t-2 border-slate-300">
            <div className="flex items-center justify-between p-2 sm:p-4 bg-blue-50 rounded-lg">
              <p className="font-bold text-slate-800 text-sm sm:text-lg">Total Geral</p>
              <p className="text-base sm:text-xl font-bold text-blue-600">
                {formatCurrency(totalPending)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
