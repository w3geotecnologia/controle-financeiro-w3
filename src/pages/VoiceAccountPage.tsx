import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic } from 'lucide-react';
import { VoiceAccountDialog } from '@/components/Accounts/VoiceAccountDialog';
import { useAccounts } from '@/contexts/AccountsContext';

const VoiceAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { addAccount } = useAccounts();

  const handleSubmit = async (data: any) => {
    await addAccount(data);
    navigate('/');
  };

  const handleBack = () => navigate('/');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Cabeçalho ── */}
      <div className="flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3 shrink-0">
        <button
          onClick={handleBack}
          aria-label="Voltar"
          className="
            flex items-center justify-center
            w-9 h-9 rounded-full
            bg-slate-100 hover:bg-slate-200
            text-slate-600 transition-colors
          "
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2563EB] to-[#2a9d8f] flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">Cadastro por Voz</p>
            <p className="text-[11px] text-slate-500 leading-tight">Fale para registrar sua conta</p>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex-1 flex flex-col px-4 py-6">
        {/*
          O VoiceAccountDialog é renderizado com isOpen=true e sem função onClose
          para que ele ocupe a tela normalmente, sem comportamento de modal.
          O botão de voltar do cabeçalho acima faz o papel de fechar/sair.
        */}
        <VoiceAccountDialog
          isOpen={true}
          onClose={handleBack}
          onSubmit={handleSubmit}
        />
      </div>

    </div>
  );
};

export default VoiceAccountPage;
