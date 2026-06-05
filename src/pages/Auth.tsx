import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, UserPlus, CheckCircle, Mail, Shield, AlertCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);

        if (error) {
          const errorInfo = getCustomErrorMessage(error);
          toast({
            title: errorInfo.title,
            description: errorInfo.message,
            variant: "destructive"
          });
        } else {
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
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">📧 Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 border-slate-300 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">🔒 Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="h-11 border-slate-300 focus:border-blue-500"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
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
