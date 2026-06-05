import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Download, CheckCircle, ArrowLeft, Share, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capturar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
      <div className="max-w-md mx-auto">
        <Link to="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Menu
        </Link>

        <Card className="border-none shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-xl text-slate-900">Instalar Aplicativo</CardTitle>
            <CardDescription>
              Instale o Controle Financeiro W3 no seu dispositivo para acesso rápido
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {isInstalled ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <p className="text-emerald-700 font-medium">App já instalado!</p>
                <p className="text-sm text-slate-500 mt-2">
                  O aplicativo já está instalado no seu dispositivo.
                </p>
              </div>
            ) : isIOS ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">
                  Para instalar no iPhone/iPad, siga os passos:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        Toque no botão <Share className="inline h-4 w-4" /> <strong>Compartilhar</strong> na barra do Safari
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        Confirme tocando em <strong>"Adicionar"</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : deferredPrompt ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">
                  Clique no botão abaixo para instalar o aplicativo:
                </p>
                <Button 
                  onClick={handleInstallClick}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Instalar Agora
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 text-center">
                  Para instalar no Android, siga os passos:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        Toque no menu <MoreVertical className="inline h-4 w-4" /> do navegador (3 pontinhos)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        Toque em <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">
                        Confirme a instalação
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Vantagens do App:</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Acesso rápido pela tela inicial
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Funciona offline
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Experiência de app nativo
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
