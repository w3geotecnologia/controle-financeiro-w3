import React, { useMemo } from 'react';
import { Account } from '@/contexts/AccountsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/utils/formatters';

interface ReportsListMobileProps {
  accounts: Account[];
}

interface CategoryGroup {
  category: string;
  accounts: Account[];
  total: number;
  type: 'receita' | 'despesa';
}

export const ReportsListMobile: React.FC<ReportsListMobileProps> = ({ accounts }) => {
  const groupedByCategory = useMemo(() => {
    // Separar receitas e despesas
    const receitas = accounts.filter(a => a.type === 'receita');
    const despesas = accounts.filter(a => a.type === 'despesa');

    // Agrupar receitas por categoria
    const receitasGroups: Record<string, CategoryGroup> = {};
    receitas.forEach(account => {
      const category = account.category || 'Sem Categoria';
      if (!receitasGroups[category]) {
        receitasGroups[category] = {
          category,
          accounts: [],
          total: 0,
          type: 'receita'
        };
      }
      receitasGroups[category].accounts.push(account);
      receitasGroups[category].total += Math.abs(account.amount);
    });

    // Agrupar despesas por categoria
    const despesasGroups: Record<string, CategoryGroup> = {};
    despesas.forEach(account => {
      const category = account.category || 'Sem Categoria';
      if (!despesasGroups[category]) {
        despesasGroups[category] = {
          category,
          accounts: [],
          total: 0,
          type: 'despesa'
        };
      }
      despesasGroups[category].accounts.push(account);
      despesasGroups[category].total += Math.abs(account.amount);
    });

    // Ordenar contas por data dentro de cada grupo
    Object.values(receitasGroups).forEach(group => {
      group.accounts.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });
    Object.values(despesasGroups).forEach(group => {
      group.accounts.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    });

    return {
      receitas: Object.values(receitasGroups).sort((a, b) => a.category.localeCompare(b.category)),
      despesas: Object.values(despesasGroups).sort((a, b) => a.category.localeCompare(b.category))
    };
  }, [accounts]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const totalReceitas = groupedByCategory.receitas.reduce((acc, g) => acc + g.total, 0);
  const totalDespesas = groupedByCategory.despesas.reduce((acc, g) => acc + g.total, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'recebido':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago';
      case 'recebido':
        return 'Recebido';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">Nenhuma conta encontrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-480px)]">
      <div className="space-y-4 pr-2">
        {/* RECEITAS */}
        {groupedByCategory.receitas.length > 0 && (
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            {groupedByCategory.receitas.map((group, groupIndex) => (
              <React.Fragment key={`receita-${group.category}-${groupIndex}`}>
                {/* Cabeçalho do grupo - similar ao desktop */}
                <div className="bg-white border-t-2 border-b-2 border-slate-400 px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{group.category}</span>
                    <span className="text-slate-600">-</span>
                    <span className="font-semibold text-sm text-green-700">Receitas</span>
                    <span className="text-xs font-medium text-slate-600">
                      ({group.accounts.length} {group.accounts.length === 1 ? 'item' : 'itens'})
                    </span>
                  </div>
                </div>

                {/* Cabeçalho da tabela */}
                <div className="bg-slate-100 border-b border-slate-300 grid grid-cols-12 gap-1 px-2 py-2">
                  <div className="col-span-5 text-xs font-semibold text-slate-700">Descrição</div>
                  <div className="col-span-3 text-xs font-semibold text-slate-700 text-right">Valor</div>
                  <div className="col-span-2 text-xs font-semibold text-slate-700 text-center">Venc.</div>
                  <div className="col-span-2 text-xs font-semibold text-slate-700 text-center">Status</div>
                </div>

                {/* Linhas de itens */}
                {group.accounts.map((account, index) => (
                  <div 
                    key={`${account.id}-${index}`} 
                    className="border-b border-slate-200 grid grid-cols-12 gap-1 px-2 py-2 hover:bg-slate-50"
                  >
                    <div className="col-span-5 text-xs text-slate-700 truncate">
                      {account.description}
                    </div>
                    <div className="col-span-3 text-xs font-semibold text-green-600 text-right">
                      +{formatCurrency(Math.abs(account.amount))}
                    </div>
                    <div className="col-span-2 text-xs text-slate-600 text-center">
                      {formatDate(account.dueDate).slice(0, 5)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(account.status)}`}>
                        {getStatusLabel(account.status).slice(0, 3)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Total do grupo */}
                <div className="bg-slate-100 border-b-2 border-slate-400 px-3 py-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Total {group.category}:</span>
                    <span className="text-sm font-bold text-green-600">+{formatCurrency(group.total)}</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
            
            {/* Total Geral de Receitas */}
            <div className="bg-green-600 text-white px-3 py-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">TOTAL RECEITAS:</span>
                <span className="font-bold text-sm">+{formatCurrency(totalReceitas)}</span>
              </div>
            </div>
          </div>
        )}

        {/* DESPESAS */}
        {groupedByCategory.despesas.length > 0 && (
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            {groupedByCategory.despesas.map((group, groupIndex) => (
              <React.Fragment key={`despesa-${group.category}-${groupIndex}`}>
                {/* Cabeçalho do grupo - similar ao desktop */}
                <div className="bg-white border-t-2 border-b-2 border-slate-400 px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{group.category}</span>
                    <span className="text-slate-600">-</span>
                    <span className="font-semibold text-sm text-red-700">Despesas</span>
                    <span className="text-xs font-medium text-slate-600">
                      ({group.accounts.length} {group.accounts.length === 1 ? 'item' : 'itens'})
                    </span>
                  </div>
                </div>

                {/* Cabeçalho da tabela */}
                <div className="bg-slate-100 border-b border-slate-300 grid grid-cols-12 gap-1 px-2 py-2">
                  <div className="col-span-5 text-xs font-semibold text-slate-700">Descrição</div>
                  <div className="col-span-3 text-xs font-semibold text-slate-700 text-right">Valor</div>
                  <div className="col-span-2 text-xs font-semibold text-slate-700 text-center">Venc.</div>
                  <div className="col-span-2 text-xs font-semibold text-slate-700 text-center">Status</div>
                </div>

                {/* Linhas de itens */}
                {group.accounts.map((account, index) => (
                  <div 
                    key={`${account.id}-${index}`} 
                    className="border-b border-slate-200 grid grid-cols-12 gap-1 px-2 py-2 hover:bg-slate-50"
                  >
                    <div className="col-span-5 text-xs text-slate-700 truncate">
                      {account.description}
                    </div>
                    <div className="col-span-3 text-xs font-semibold text-red-600 text-right">
                      -{formatCurrency(Math.abs(account.amount))}
                    </div>
                    <div className="col-span-2 text-xs text-slate-600 text-center">
                      {formatDate(account.dueDate).slice(0, 5)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(account.status)}`}>
                        {getStatusLabel(account.status).slice(0, 3)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Total do grupo */}
                <div className="bg-slate-100 border-b-2 border-slate-400 px-3 py-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">Total {group.category}:</span>
                    <span className="text-sm font-bold text-red-600">-{formatCurrency(group.total)}</span>
                  </div>
                </div>
              </React.Fragment>
            ))}
            
            {/* Total Geral de Despesas */}
            <div className="bg-red-600 text-white px-3 py-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">TOTAL DESPESAS:</span>
                <span className="font-bold text-sm">-{formatCurrency(totalDespesas)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
