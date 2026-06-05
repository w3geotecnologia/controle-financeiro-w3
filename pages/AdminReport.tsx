import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Shield, 
  FileText,
  ArrowLeft,
  LogIn,
  LogOut,
  Calendar,
  Clock,
  User,
  Menu,
  Trash2
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface AccessLog {
  id: string;
  user_id: string;
  user_email: string;
  event_type: 'login' | 'logout';
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

interface UserWithLogs {
  user_id: string;
  email: string;
  is_premium: boolean;
  is_trial_active: boolean;
  days_remaining: number;
  logs: AccessLog[];
}

const AdminReport: React.FC = () => {
  const { loading, isAdmin, users } = useUserRoles();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');

  useEffect(() => {
    const fetchAccessLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('user_access_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);

        if (error) throw error;
        setAccessLogs((data as AccessLog[]) || []);
      } catch (error) {
        console.error('Error fetching access logs:', error);
      } finally {
        setLogsLoading(false);
      }
    };

    if (isAdmin) {
      fetchAccessLogs();
    }
  }, [isAdmin]);

  const handleClearHistory = async () => {
    try {
      const { error } = await supabase
        .from('user_access_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;
      
      setAccessLogs([]);
      toast({
        title: "Sucesso",
        description: "Histórico de acessos limpo com sucesso."
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar histórico de acessos.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (user: UserWithLogs['logs'][0] extends never ? never : { is_premium: boolean; is_trial_active: boolean }) => {
    if (user.is_premium) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Premium</Badge>;
    }
    if (user.is_trial_active) {
      return <Badge className="bg-green-100 text-green-800 text-xs">Trial</Badge>;
    }
    return <Badge variant="destructive" className="text-xs">Expirado</Badge>;
  };

  const filteredLogs = selectedUserId === 'all' 
    ? accessLogs 
    : accessLogs.filter(log => log.user_id === selectedUserId);

  // Group logs by user for summary
  const userLogsMap = new Map<string, { email: string; logins: number; lastLogin: string | null }>();
  accessLogs.forEach(log => {
    if (!userLogsMap.has(log.user_id)) {
      userLogsMap.set(log.user_id, { email: log.user_email, logins: 0, lastLogin: null });
    }
    const userData = userLogsMap.get(log.user_id)!;
    if (log.event_type === 'login') {
      userData.logins++;
      if (!userData.lastLogin || new Date(log.created_at) > new Date(userData.lastLogin)) {
        userData.lastLogin = log.created_at;
      }
    }
  });

  if (loading || logsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg text-slate-600">Carregando...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar esta página.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={isMobile ? "space-y-4 p-4" : "space-y-6"}>
        {/* Mobile: Menu Principal button */}
        {isMobile && (
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Menu className="h-5 w-5" />
            Menu Principal
          </Button>
        )}

        {/* Back button */}
        <Button
          onClick={() => navigate('/admin')}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Administração
        </Button>

        {/* Header */}
        {!isMobile && (
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Relatório de Acessos
            </h1>
            <p className="text-slate-600">Histórico de login/logout dos usuários</p>
          </div>
        )}

        {/* Summary Cards */}
        {isMobile ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Total Logins</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {accessLogs.filter(l => l.event_type === 'login').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-slate-700">Usuários com Acesso</span>
              </div>
              <span className="text-lg font-bold text-amber-600">{userLogsMap.size}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Logins</CardTitle>
                <LogIn className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accessLogs.filter(l => l.event_type === 'login').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Logouts</CardTitle>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {accessLogs.filter(l => l.event_type === 'logout').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários com Acesso</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userLogsMap.size}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">Filtrar por usuário:</span>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Todos os usuários" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              {users.map(user => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                disabled={accessLogs.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Limpar Histórico
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja limpar todo o histórico de acessos? 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearHistory}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Limpar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Access Logs */}
        {isMobile ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Histórico de Acessos</h2>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Nenhum registro de acesso encontrado.
              </div>
            ) : (
              filteredLogs.map((log) => {
                const user = users.find(u => u.user_id === log.user_id);
                return (
                  <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{log.user_email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{formatDate(log.created_at)}</span>
                          <Clock className="h-3 w-3 text-slate-400 ml-2" />
                          <span className="text-xs text-slate-500">{formatTime(log.created_at)}</span>
                        </div>
                      </div>
                      <Badge 
                        className={`text-xs ${log.event_type === 'login' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.event_type === 'login' ? (
                          <><LogIn className="h-3 w-3 mr-1" /> Login</>
                        ) : (
                          <><LogOut className="h-3 w-3 mr-1" /> Logout</>
                        )}
                      </Badge>
                    </div>
                    {user && (
                      <div className="flex gap-1 mt-2">
                        {user.is_premium && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Premium</Badge>
                        )}
                        {user.is_trial_active && !user.is_premium && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Trial - {user.days_remaining}d
                          </Badge>
                        )}
                        {!user.is_trial_active && !user.is_premium && (
                          <Badge variant="destructive" className="text-xs">Expirado</Badge>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Acessos</CardTitle>
              <CardDescription>
                Registros de login e logout dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Nenhum registro de acesso encontrado.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => {
                      const user = users.find(u => u.user_id === log.user_id);
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.user_email}</TableCell>
                          <TableCell>
                            {user && (
                              <div className="flex gap-1">
                                {user.is_premium && (
                                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Premium</Badge>
                                )}
                                {user.is_trial_active && !user.is_premium && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">Trial</Badge>
                                )}
                                {!user.is_trial_active && !user.is_premium && (
                                  <Badge variant="destructive" className="text-xs">Expirado</Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={`${log.event_type === 'login' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {log.event_type === 'login' ? (
                                <><LogIn className="h-3 w-3 mr-1" /> Login</>
                              ) : (
                                <><LogOut className="h-3 w-3 mr-1" /> Logout</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(log.created_at)}</TableCell>
                          <TableCell>{formatTime(log.created_at)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AdminReport;
