
import React from 'react';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { AccessDenied } from '@/components/AccessDenied';
import { Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';

interface AccessControlWrapperProps {
  children: React.ReactNode;
  requiresAccess?: boolean;
}

export const AccessControlWrapper: React.FC<AccessControlWrapperProps> = ({ 
  children, 
  requiresAccess = true 
}) => {
  const { hasAccess, loading } = useTrialStatus();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Verificando acesso...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (requiresAccess && !hasAccess) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
