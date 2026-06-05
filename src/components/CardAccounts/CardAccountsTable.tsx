
import React from 'react';
import { Edit, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardAccount } from '@/hooks/useCardAccounts';
import { formatCurrency } from '@/utils/formatters';

interface CardAccountsTableProps {
  cardAccounts: CardAccount[];
  onEdit: (cardAccount: CardAccount) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: 'pendente' | 'pago' | 'recebido') => void;
  isDeleting?: boolean;
}

export const CardAccountsTable: React.FC<CardAccountsTableProps> = ({
  cardAccounts,
  onEdit,
  onDelete,
  onStatusChange,
  isDeleting = false
}) => {
 const formatDate = (date: string) => {
  if (!date) return "";
  // Garante que pega apenas YYYY-MM-DD sem timezone
  const [year, month, day] = date.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'recebido':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (cardAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-slate-600 mb-4">Nenhuma conta encontrada</div>
        <p className="text-slate-500">Comece adicionando sua primeira conta de cartão.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="font-semibold text-slate-700 min-w-[200px] h-8 py-1">Descrição</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Valor</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Data da Compra</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Vencimento</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Categoria</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Cartão</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Status</TableHead>
            <TableHead className="w-[100px] font-semibold text-slate-700 h-8 py-1">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...cardAccounts].sort((a, b) => {
            const dataContaA = a.data_conta ? new Date(a.data_conta).getTime() : 0;
            const dataContaB = b.data_conta ? new Date(b.data_conta).getTime() : 0;
            if (dataContaA !== dataContaB) return dataContaA - dataContaB;
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          }).map((account) => (
            <TableRow key={account.id} className="hover:bg-slate-50/50 transition-colors h-10">
              <TableCell className="font-medium text-slate-900 min-w-[200px] max-w-[250px] py-1">
                <div className="truncate" title={account.description}>
                  {account.description}
                </div>
              </TableCell>
              <TableCell className="font-semibold text-slate-900 py-1">
                {formatCurrency(account.amount)}
              </TableCell>
              <TableCell className="text-slate-600 py-1">
                {account.data_conta ? formatDate(account.data_conta) : '-'}
              </TableCell>
              <TableCell className="text-slate-600 py-1">
                {formatDate(account.due_date)}
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: account.category_color || '#3B82F6' }}
                  />
                  <span className="text-slate-700">{account.category_name || 'Sem categoria'}</span>
                </div>
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span className="text-slate-700 font-medium">
                    {account.payment_source_name || account.card_name || 'Cartão não encontrado'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-1">
                <Select
                  key={`${account.id}-${account.status}`}
                  value={account.status}
                  onValueChange={(value) => onStatusChange(account.id, value as 'pendente' | 'pago' | 'recebido')}
                >
                  <SelectTrigger className={`w-32 h-6 text-xs border ${getStatusColor(account.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Pendente
                      </div>
                    </SelectItem>
                    <SelectItem value="pago">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Pago
                      </div>
                    </SelectItem>
                    <SelectItem value="recebido">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Recebido
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="py-1">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(account)}
                    className="h-6 w-6 p-0 hover:bg-blue-100 hover:text-blue-700"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(account.id)}
                    disabled={isDeleting}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
