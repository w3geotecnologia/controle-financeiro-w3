import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { VoiceAccountDialog } from '@/components/Accounts/VoiceAccountDialog';
import { useAccounts } from '@/contexts/AccountsContext';
import type { AccountFormData } from '@/components/Accounts/AccountModal';

const VoiceAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { addAccount, refreshAccounts } = useAccounts();
  const [isSaving, setIsSaving] = React.useState(false);

  const handleClose = () => navigate('/');

  const handleSubmit = async (data: AccountFormData) => {
    try {
      setIsSaving(true);
      const { id, ...payload } = data as any;
      await addAccount(payload);
      await refreshAccounts();
    } catch (error) {
      console.error('Erro ao salvar conta por voz:', error);
    } finally {
      setIsSaving(false);
      navigate('/contas');
    }
  };

  return (
    <Layout>
      <div className="min-h-[60vh]">
        <h1 className="sr-only">Cadastro de contas por voz</h1>
        <VoiceAccountDialog
          isOpen
          onClose={handleClose}
          onSubmit={handleSubmit}
          isLoading={isSaving}
        />
      </div>
    </Layout>
  );
};

export default VoiceAccountPage;
