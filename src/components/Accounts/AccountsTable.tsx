
import React from 'react';
import { Edit, Trash2, Calendar, CreditCard, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Account } from '@/contexts/AccountsContext';
import { useBanksData } from '@/hooks/useBanksData';

interface AccountsTableProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  isDeleting?: boolean;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  onEdit,
  onDelete,
  onStatusChange,
  isDeleting = false
}) => {
  const { banks } = useBanksData();
  
  // Criar mapeamento de bank_id para cor (memoizado para performance)
  const bankColorMap = React.useMemo(() => {
    const map = new Map<number, string>();
    banks.forEach(bank => {
      map.set(bank.id, bank.color || '#475569');
    });
    return map;
  }, [banks]);
  
  const getBankColor = (bankId: number | null) => {
    if (!bankId) return '#475569';
    return bankColorMap.get(bankId) || '#475569';
  };
  const formatDate = (date: string) => {
  if (!date) return "";
  // Garante que pega apenas YYYY-MM-DD sem timezone
  const [year, month, day] = date.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'recebido':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'receita' ? 'text-green-600' : 'text-red-600';
  };

  const getPaymentSourceIcon = (paymentSource: string) => {
    switch (paymentSource) {
      case 'bank':
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case 'creditcard':
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-lg text-slate-600 mb-4">Nenhuma conta encontrada</div>
        <p className="text-slate-500">Use os filtros acima ou adicione uma nova conta.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="font-semibold text-slate-700 w-[50px] h-8 py-1 text-center">#</TableHead>
            <TableHead className="font-semibold text-slate-700 min-w-[200px] h-8 py-1">Descrição</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Tipo</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Valor</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Vencimento</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Categoria</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Fonte Pagamento</TableHead>
            <TableHead className="font-semibold text-slate-700 h-8 py-1">Status</TableHead>
            <TableHead className="w-[100px] font-semibold text-slate-700 h-8 py-1">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...accounts].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((account, index) => (
            <TableRow key={account.id} className="hover:bg-slate-50/50 transition-colors h-10">
              <TableCell className="text-center text-slate-600 font-medium py-1">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium text-slate-900 min-w-[200px] max-w-[250px] py-1">
                <div className="truncate" title={account.description}>
                  {account.description}
                </div>
              </TableCell>
              <TableCell className="py-1">
                <span className={`font-medium capitalize ${getTypeColor(account.type)}`}>
                  {account.type}
                </span>
              </TableCell>
              <TableCell className="font-semibold text-slate-900 py-1">
                <span className={getTypeColor(account.type)}>
                  {formatCurrency(Math.abs(account.amount))}
                </span>
              </TableCell>
              <TableCell className="text-slate-600 py-1">
                {formatDate(account.dueDate)}
              </TableCell>
              <TableCell className="text-slate-700 py-1">
                {account.category}
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center gap-2">
                  {getPaymentSourceIcon(account.payment_source || '')}
                  <span 
                    className="font-medium"
                    style={{ 
                      color: getBankColor(account.bank_id || null) || '#475569'
                    }}
                  >
                    {account.payment_source_name || 'Não definido'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-1">
                <Select
                  value={account.status}
                  onValueChange={(value) => onStatusChange(account.id, value)}
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
                    {account.type === 'receita' ? (
                      <SelectItem value="recebido">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Recebido
                        </div>
                      </SelectItem>
                    ) : (
                      <SelectItem value="pago">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Pago
                        </div>
                      </SelectItem>
                    )}
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
