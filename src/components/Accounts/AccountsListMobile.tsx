import React, { useState } from 'react';
import { Account } from '@/contexts/AccountsContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/utils/formatters';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AccountsListMobileProps {
  accounts: Account[];
  onEdit?: (account: Account) => void;
  onDelete?: (id: number) => void;
}

export const AccountsListMobile: React.FC<AccountsListMobileProps> = ({ accounts, onEdit, onDelete }) => {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'recebido':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'receita' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusLabel = (status: string, type: string) => {
    if (status === 'pago') return 'Pago';
    if (status === 'recebido') return 'Recebido';
    return 'Pendente';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 text-sm">Nenhuma conta encontrada</p>
      </div>
    );
  }

  const handleEdit = () => {
    if (selectedAccount) {
      onEdit?.(selectedAccount);
      setSelectedAccount(null);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedAccount) {
      onDelete?.(selectedAccount.id);
    }
    setShowDeleteDialog(false);
    setSelectedAccount(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <ScrollArea className="h-[calc(100vh-480px)]">
        <div className="space-y-2 pr-4">
          {[...accounts]
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map((account, index) => (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm cursor-pointer hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-medium text-slate-900 text-sm line-clamp-2 flex-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-200 text-slate-700 text-xs font-bold rounded-full mr-2">
                    {index + 1}
                  </span>
                  {account.description}
                </h3>
                <span className={`font-bold text-base whitespace-nowrap ${getTypeColor(account.type)}`}>
                  {formatCurrency(Math.abs(account.amount))}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                <span>Data: {formatDate(account.dueDate)}</span>
                <span>{account.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(account.status)}`}>
                  {getStatusLabel(account.status, account.type)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Sheet para opções de editar/deletar */}
      <Sheet open={!!selectedAccount} onOpenChange={(open) => !open && setSelectedAccount(null)}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle className="text-left">Opções</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 mt-6 pb-4">
            <Button
              onClick={handleEdit}
              variant="outline"
              className="w-full h-14 justify-start gap-3 text-base"
            >
              <Pencil className="h-5 w-5" />
              Editar Conta
            </Button>
            <Button
              onClick={handleDeleteClick}
              variant="outline"
              className="w-full h-14 justify-start gap-3 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-5 w-5" />
              Excluir Conta
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && handleCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
