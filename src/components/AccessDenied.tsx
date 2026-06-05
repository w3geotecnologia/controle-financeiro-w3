
import React from 'react';
import { Layout } from '@/components/Layout';
import { AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showUpgradeButton?: boolean;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = "Acesso Negado",
  message = "Você não tem permissão para acessar esta página. Apenas usuários ativos podem ver esta área.",
  showUpgradeButton = true
}) => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            {title}
          </h1>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            {message}
          </p>
          
          {showUpgradeButton && (
            <div className="space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={() => {
                  // Aqui pode implementar a lógica para upgrade no futuro
                  console.log('Upgrade requested');
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                Fazer Upgrade para Premium
              </Button>
              
              <p className="text-sm text-slate-500">
                Obtenha acesso completo a todas as funcionalidades
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
