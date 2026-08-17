import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus, CheckCircle, Mail, Shield, AlertCircle } from 'lucide-react';

const MAX_ATTEMPTS = 5;

type LockState = { attempts: number; lockedUntil: number };

const EMPTY_LOCK: LockState = { attempts: 0, lockedUntil: 0 };

const toLockState = (row: any): LockState => {
  const seconds = Number(row?.seconds_remaining) || 0;
  return {
    attempts: Number(row?.attempts) || 0,
    lockedUntil: row?.locked && seconds > 0 ? Date.now() + seconds * 1000 : 0,
  };
};

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lock, setLock] = useState<LockState>(EMPTY_LOCK);
  const [now, setNow] = useState(Date.now());
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isLocked = lock.lockedUntil > now;
  const remainingMs = Math.max(0, lock.lockedUntil - now);
  const remainingLabel = `${String(Math.floor(remainingMs / 60000)).padStart(2, '0')}:${String(
    Math.floor((remainingMs % 60000) / 1000)
  ).padStart(2, '0')}`;

  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  useEffect(() => {
    if (lock.lockedUntil && lock.lockedUntil <= now) {
      setLock(EMPTY_LOCK);
    }
  }, [now, lock.lockedUntil]);

  // Consulta o bloqueio no banco de dados (nao depende do navegador)
  useEffect(() => {
    const value = email.trim();
    if (!value.includes('@')) {
      setLock(EMPTY_LOCK);
      return;
    }
    let active = true;
    const id = setTimeout(async () => {
      const { data, error } = await supabase.rpc('check_login_lock', { _email: value });
      if (!active || error) return;
      const row = Array.isArray(data) ? data[0] : data;
      setLock(toLockState(row));
      setNow(Date.now());
    }, 500);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [email]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);


  const getCustomErrorMessage = (error: any) => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
      return {
        title: "🔐 Credenciais Inválidas",
        message: "Email ou senha incorretos. Verifique suas informações e tente novamente.",
       };
    }
    
    if (errorMessage.includes('email not confirmed')) {
      return {
        title: "📧 Email Não Confirmado",
        message: "Verificação necessária: Acesse sua caixa de entrada e clique no link de confirmação para ativar sua conta.",
        icon: Mail
      };
    }
    
    if (errorMessage.includes('user already registered') || errorMessage.includes('already registered')) {
      return {
        title: "👤 Email Já Cadastrado",
        message: "Este email já possui uma conta ativa. Faça login ou solicite recuperação de senha se necessário.",
        icon: AlertCircle
      };
    }
    
    if (errorMessage.includes('password') && errorMessage.includes('weak')) {
      return {
        title: "🔒 Senha Insegura",
        message: "A senha deve ter pelo menos 6 caracteres. Recomendamos usar letras, números e símbolos para maior segurança.",
        icon: Shield
      };
    }
    
    if (errorMessage.includes('invalid email')) {
      return {
        title: "📮 Email Inválido",
        message: "Por favor, verifique o formato do email digitado (exemplo: usuario@email.com).",
        icon: AlertCircle
      };
    }
    
    if (errorMessage.includes('signup disabled')) {
      return {
        title: "🚫 Cadastro Temporariamente Indisponível",
        message: "O sistema está em manutenção. Tente novamente em alguns minutos.",
        icon: AlertCircle
      };
    }
    
    if (errorMessage.includes('too many requests')) {
      return {
        title: "⏱️ Muitas Tentativas",
        message: "Por segurança, aguarde alguns minutos antes de tentar novamente.",
        icon: AlertCircle
      };
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        title: "🌐 Erro de Conexão",
        message: "Verifique sua conexão com a internet e tente novamente.",
        icon: AlertCircle
      };
    }
    
    return {
      title: "⚠️ Erro Inesperado",
      message: "Algo deu errado. Nossa equipe foi notificada. Tente novamente em alguns minutos.",
      icon: AlertCircle
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast({
        title: "🔒 Acesso Temporariamente Bloqueado",
        description: `Muitas tentativas incorretas. Aguarde ${remainingLabel} para ${
          isLogin ? 'tentar novamente' : 'criar uma nova conta'
        }.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);

        if (error) {
          const attempts = lock.attempts + 1;
          const next: LockState =
            attempts >= MAX_ATTEMPTS
              ? { attempts, lockedUntil: Date.now() + LOCK_MS }
              : { attempts, lockedUntil: 0 };
          setLock(next);
          setNow(Date.now());
          writeLock(next);

          if (next.lockedUntil) {
            toast({
              title: "🔒 Acesso Bloqueado por 15 Minutos",
              description: "Você excedeu 5 tentativas de login. Tente novamente após 15 minutos.",
              variant: "destructive"
            });
          } else {
            const errorInfo = getCustomErrorMessage(error);
            toast({
              title: errorInfo.title,
              description: `${errorInfo.message} (tentativa ${attempts} de ${MAX_ATTEMPTS})`,
              variant: "destructive"
            });
          }
        } else {
          const reset = { attempts: 0, lockedUntil: 0 };
          setLock(reset);
          writeLock(reset);
          toast({
            title: "🎉 Login Realizado com Sucesso!",
            description: "Bem-vindo de volta! Redirecionando para seu painel de controle...",
            className: "bg-green-50 border-green-200"
          });
          setTimeout(() => navigate('/'), 1200);
        }

      } else {
        const { error } = await signUp(email, password);

        if (error) {
          const errorInfo = getCustomErrorMessage(error);
          toast({
            title: errorInfo.title,
            description: errorInfo.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "✅ Cadastro Realizado com Sucesso!",
            description: "Enviamos um email de confirmação para " + email + ". Verifique sua caixa de entrada e spam para ativar sua conta.",
            className: "bg-blue-50 border-blue-200"
          });
          setEmail('');
          setPassword('');
        }
      }
    } catch (error: any) {
      toast({
        title: "💥 Sistema Temporariamente Indisponível",
        description: "Nossos servidores estão enfrentando dificuldades. Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-3">
          <div className="w-16 h-16 flex items-center justify-center mx-auto">
            <img 
              src="/lovable-uploads/99771e97-fa49-4958-8701-cb3dd88dad1a.png" 
              alt="Controle Financeiro W3" 
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Sistema de Controle Financeiro
          </CardTitle>
          <CardDescription className="text-slate-600">
            {isLogin ? 'Acesse sua conta para continuar' : '✨ Crie sua conta e organize suas finanças'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLocked && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                {isLogin
                  ? `Login bloqueado após ${MAX_ATTEMPTS} tentativas incorretas.`
                  : `Cadastro bloqueado após ${MAX_ATTEMPTS} tentativas incorretas de login.`}{' '}
                Aguarde <strong>{remainingLabel}</strong> para{' '}
                {isLogin ? 'tentar novamente' : 'criar uma nova conta'}.
              </span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-2">
              <p className="text-slate-700 font-medium text-sm flex items-center gap-1"><Mail size={14} /> Email</p>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || isLocked}
                className="h-11 border-slate-300 focus:border-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-slate-700 font-medium text-sm flex items-center gap-1"><Shield size={14} /> Senha</p>
              <Input
                id="password"
                type="password"
                placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading || isLocked}
                className="h-11 border-slate-300 focus:border-blue-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading || isLocked}
            >
              {isLocked ? (
                <>Bloqueado — aguarde {remainingLabel}</>
              ) : loading ? (

                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {isLogin ? 'Validando credenciais...' : 'Criando sua conta...'}
                </>
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Entrar na Plataforma
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Criar Conta Gratuita
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                if (isLocked) {
                  toast({
                    title: "🔒 Cadastro Temporariamente Bloqueado",
                    description: `Você só pode criar uma nova conta após passar os 15 minutos de bloqueio. Aguarde ${remainingLabel}.`,
                    variant: "destructive"
                  });
                  return;
                }
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
              disabled={loading}
            >
              {isLogin 
                ? '🆕 Não tem uma conta? Criar conta gratuita' 
                : '👋 Já tem uma conta? Fazer login'
              }
            </button>
          </div>

          {isLogin && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  toast({
                    title: "🔄 Recuperação de Senha",
                    description: "Digite seu email acima e entre em contato conosco para receber instruções de recuperação.",
                    className: "bg-amber-50 border-amber-200"
                  });
                }}
                className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors"
                disabled={loading}
              >
                🔑 Esqueceu sua senha?
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
