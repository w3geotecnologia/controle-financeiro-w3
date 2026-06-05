
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useUserRoles, AdminUser } from '@/hooks/useUserRoles';
import { UserStatusModal } from '@/components/Admin/UserStatusModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Shield, 
  ShieldCheck, 
  Users, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit,
  UserPlus,
  UserMinus,
  FileText,
  AlertTriangle,
  Menu
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
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

const Admin: React.FC = () => {
  const { 
    loading, 
    isAdmin, 
    users, 
    isUserAdminRole, 
    makeUserAdmin, 
    removeAdminRole, 
    deleteUser, 
    updateUserStatus 
  } = useUserRoles();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const handleMakeAdmin = async (userId: string, userEmail: string) => {
    try {
      await makeUserAdmin(userId);
      toast({
        title: "Sucesso",
        description: `${userEmail} agora é administrador.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao tornar usuário administrador.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAdmin = async (userId: string, userEmail: string) => {
    try {
      await removeAdminRole(userId);
      toast({
        title: "Sucesso",
        description: `${userEmail} não é mais administrador.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover role de administrador.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    try {
      await deleteUser(userId);
      toast({
        title: "Sucesso",
        description: `Usuário ${userEmail} foi deletado.`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao deletar usuário.";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsStatusModalOpen(true);
  };

  const handleSaveUserStatus = async (
    userId: string, 
    isPremium: boolean, 
    isTrialActive: boolean, 
    extendTrialDays: number
  ) => {
    try {
      await updateUserStatus(userId, isPremium, isTrialActive, extendTrialDays);
      toast({
        title: "Sucesso",
        description: "Status do usuário atualizado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do usuário.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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
                Você não tem permissão para acessar esta página. Apenas administradores podem ver esta área.
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

        {/* Summary Cards */}
        {isMobile ? (
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/admin/relatorio')}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Relatório de Acessos
            </Button>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Total Usuários</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{users.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-slate-700">Usuários Ativos</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {users.filter(u => u.is_trial_active || u.is_premium).length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-slate-700">Premium</span>
              </div>
              <span className="text-lg font-bold text-amber-600">
                {users.filter(u => u.is_premium).length}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                Administração
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-slate-600">Gerenciar usuários e permissões do sistema</p>
                <Button
                  onClick={() => navigate('/admin/relatorio')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Relatório de Acessos
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.is_trial_active || u.is_premium).length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Premium</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.is_premium).length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Users List */}
        {isMobile ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-800">Usuários</h2>
            {users.map((user) => (
              <div key={user.user_id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
                    <p className="text-xs text-slate-500">{formatDate(user.created_at)}</p>
                  </div>
                  {isUserAdminRole(user.user_id) && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs ml-2">
                      Admin
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {user.is_premium && (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800 text-xs">
                      Premium
                    </Badge>
                  )}
                  {user.is_trial_active && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Trial - {user.days_remaining} dias
                    </Badge>
                  )}
                  {!user.is_trial_active && !user.is_premium && (
                    <Badge variant="destructive" className="text-xs">
                      Expirado
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditUser(user)}
                    className="flex-1 h-8 text-xs"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  {!isUserAdminRole(user.user_id) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMakeAdmin(user.user_id, user.email)}
                      className="flex-1 h-8 text-xs"
                    >
                      <UserPlus className="h-3 w-3 mr-1" />
                      Admin
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveAdmin(user.user_id, user.email)}
                      className="flex-1 h-8 text-xs"
                    >
                      <UserMinus className="h-3 w-3 mr-1" />
                      Remover
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 text-xs px-2"
                        disabled={isUserAdminRole(user.user_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Confirmar Exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja deletar o usuário <strong>{user.email}</strong>? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user.user_id, user.email)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Deletar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>
                Lista de todos os usuários registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dias Restantes</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.email}
                          {isUserAdminRole(user.user_id) && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Admin
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.is_premium && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              Premium
                            </Badge>
                          )}
                          {user.is_trial_active && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Trial Ativo
                            </Badge>
                          )}
                          {!user.is_trial_active && !user.is_premium && (
                            <Badge variant="destructive">
                              Expirado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_premium ? '∞' : user.days_remaining > 0 ? user.days_remaining : '0'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Editar
                          </Button>
                          
                          {!isUserAdminRole(user.user_id) ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMakeAdmin(user.user_id, user.email)}
                              className="flex items-center gap-1"
                            >
                              <UserPlus className="h-3 w-3" />
                              Admin
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveAdmin(user.user_id, user.email)}
                              className="flex items-center gap-1"
                            >
                              <UserMinus className="h-3 w-3" />
                              Remover
                            </Button>
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex items-center gap-1"
                                disabled={isUserAdminRole(user.user_id)}
                              >
                                <Trash2 className="h-3 w-3" />
                                Deletar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  Confirmar Exclusão
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar o usuário <strong>{user.email}</strong>? 
                                  Esta ação não pode ser desfeita e todos os dados do usuário serão permanentemente removidos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.user_id, user.email)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Sim, Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <UserStatusModal
          user={selectedUser}
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedUser(null);
          }}
          onSave={handleSaveUserStatus}
        />
      </div>
    </Layout>
  );
};

export default Admin;
