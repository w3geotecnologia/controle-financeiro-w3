
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TrialStatus {
  is_trial_active: boolean;
  is_premium: boolean;
  days_remaining: number;
  trial_end_date: string;
}

export const useTrialStatus = () => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkTrialStatus();
    }
  }, [user]);

  const checkTrialStatus = async () => {
    try {
      console.log('Verificando status do trial para usuário:', user?.id);
      
      const { data, error } = await supabase.rpc('check_user_trial_status', {
        user_uuid: user?.id
      });

      if (error) {
        console.error('Erro ao verificar status do trial:', error);
        setHasAccess(false);
        return;
      }

      if (data && data.length > 0) {
        const status = data[0];
        setTrialStatus(status);
        
        // Usuário tem acesso se for premium OU se o trial estiver ativo
        const userHasAccess = status.is_premium || status.is_trial_active;
        setHasAccess(userHasAccess);
        
        console.log('Status do trial:', status);
        console.log('Usuário tem acesso:', userHasAccess);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Erro ao verificar status do trial:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    trialStatus,
    loading,
    hasAccess,
    refreshTrialStatus: checkTrialStatus
  };
};
