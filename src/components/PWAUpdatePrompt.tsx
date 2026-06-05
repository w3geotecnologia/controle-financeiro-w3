import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const PWAUpdatePrompt = () => {
  const isMobile = useIsMobile();
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      console.log('Service Worker registrado:', swUrl);
      
      // Verifica atualizações imediatamente ao abrir
      if (registration) {
        registration.update();
        
        // Verifica atualizações a cada 2 minutos
        setInterval(() => {
          registration.update();
        }, 2 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Erro ao registrar SW:', error);
    },
  });

  useEffect(() => {
    if (needRefresh && !hasShownPrompt) {
      setHasShownPrompt(true);
      
      // Mostra toast e atualiza automaticamente após 3 segundos
      toast(
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-primary animate-spin" />
          <div className="flex-1">
            <p className="font-medium">Atualizando app...</p>
            <p className="text-sm text-muted-foreground">Nova versão sendo instalada</p>
          </div>
        </div>,
        {
          duration: 3000,
        }
      );
      
      // Atualiza automaticamente após mostrar o toast
      setTimeout(() => {
        updateServiceWorker(true);
      }, 2000);
    }
  }, [needRefresh, hasShownPrompt, updateServiceWorker]);

  return null;
};
