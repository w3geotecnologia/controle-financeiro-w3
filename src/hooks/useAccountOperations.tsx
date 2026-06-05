// src/hooks/useAccountOperations.tsx

import { useState } from 'react';
import { Account, CreateAccountData, useAccounts } from '@/contexts/AccountsContext';

export const useAccountOperations = () => {
  const { addAccount, updateAccount, deleteAccount, updateAccountStatus } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();

  const handleSave = async (accountData: CreateAccountData | Account) => {
    try {
      console.log('Contas: Dados recebidos para salvar:', accountData);
      
      if (editingAccount?.id) {
        console.log('Contas: Atualizando conta existente');
        const accountToUpdate: Account = {
          ...accountData,
          id: editingAccount.id
        };
        await updateAccount(accountToUpdate);
      } else {
        console.log('Contas: Criando nova conta');
        const { id, ...accountWithoutId } = accountData as any;
        await addAccount(accountWithoutId as CreateAccountData);
      }
      
      setEditingAccount(undefined);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
    }
  };

  // --- FUNÇÃO CORRIGIDA ---
  const handleEdit = (account: Account) => {
    console.log('=== handleEdit chamado ===');
    console.log('Conta original:', account);
    
    // AQUI ESTÁ A CORREÇÃO:
    // Copiar todas as propriedades da conta original para o estado de edição.
    // Isso inclui `payment_source` e `payment_source_id`, que estavam faltando antes.
    const accountToEdit: Account = {
      ...account
    };
    
    console.log('Conta preparada para edição:', accountToEdit);
    
    setEditingAccount(accountToEdit);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    await deleteAccount(id);
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateAccountStatus(id, status as 'pendente' | 'pago' | 'recebido');
  };

  const handleNewAccount = () => {
    console.log('=== handleNewAccount chamado ===');
    setEditingAccount(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    console.log('=== Modal fechando ===');
    setEditingAccount(undefined);
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    editingAccount,
    handleSave,
    handleEdit,
    handleDelete,
    handleStatusChange,
    handleNewAccount,
    handleModalClose
  };
};
