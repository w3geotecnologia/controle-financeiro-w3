
import React from 'react';
import { Edit, Trash2, Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bank } from '@/hooks/useBanksData';
import { BankUI } from './BankUI';
import { formatCurrency } from '@/utils/formatters';

interface BankCardProps {
  bank: Bank;
  onEdit: (bank: Bank) => void;
  onDelete: (id: number) => void;
  onAddDeposit: (bank: Bank) => void;
}

export const BankCard: React.FC<BankCardProps> = ({
  bank,
  onEdit,
  onDelete,
  onAddDeposit
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getAccountTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'corrente': 'Corrente',
      'poupanca': 'Poupança',
      'salario': 'Salário',
      'investimento': 'Investimento'
    };
    return types[type] || type;
  };

  const getStatusLabel = (balance: number) => {
    if (balance >= 10000) return 'Saldo Alto';
    if (balance >= 1000) return 'Saldo Médio';
    if (balance >= 0) return 'Saldo OK';
    return 'Saldo Negativo';
  };

  const getStatusColor = (balance: number) => {
    if (balance >= 10000) return 'bg-green-100 text-green-800';
    if (balance >= 1000) return 'bg-blue-100 text-blue-800';
    if (balance >= 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Visual Bank Card */}
      <div className="p-4">
        <BankUI
          bankName={bank.name}
          accountNumber={bank.account_number}
          agency={bank.agency}
          accountType={bank.account_type}
          holderName={bank.nickname}
          balance={bank.balance}
          color={bank.color}
        />
      </div>

      {/* Bank Information */}
      <div className="p-4 pt-0 space-y-4">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-card-foreground">
            {bank.nickname || bank.name}
          </h3>
          <Badge className={getStatusColor(bank.balance)}>
            {getStatusLabel(bank.balance)}
          </Badge>
        </div>

        {/* Account Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo de Conta:</span>
            <span className="font-medium">{getAccountTypeLabel(bank.account_type)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Agência:</span>
            <span className="font-medium">{bank.agency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Conta:</span>
            <span className="font-medium">{bank.account_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Saldo Atual:</span>
            <span className={`font-medium ${bank.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(bank.balance)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Atualizado:</span>
            <span className="font-medium text-xs">{formatDate(bank.updated_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 pt-2 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onAddDeposit(bank)}
            className="h-7 w-7"
            title="Depósito"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(bank)}
            className="h-7 w-7"
            title="Editar"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(bank.id)}
            className="h-7 w-7 text-destructive border-destructive/20 hover:bg-destructive/5"
            title="Excluir"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
