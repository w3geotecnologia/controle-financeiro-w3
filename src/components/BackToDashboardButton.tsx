import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BackToDashboardButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      onClick={() => navigate('/')}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar ao Painel
    </Button>
  );
};

export default BackToDashboardButton;
