'use client';

import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { Users, UserCheck, UserX, Calendar, Mail, Crown, Loader2 } from 'lucide-react';

interface User {
  user_id: string;
  email: string;
  signup_date: string;
  status_assinatura: string;
  plan: string;
  end_date: string | null;
  dias_restantes: number;
  restaurant_name?: string;
  role: string;
}

export default function UsersManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantDays, setGrantDays] = useState('30');
  const [grantPlan, setGrantPlan] = useState('paid');
  const [actionLoading, setActionLoading] = useState(false);
  const supabase = createClientComponentClient();

  // Verificar se é admin
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const adminEmails = [
      "michaeldouglasqueiroz@gmail.com",
      "admin@onpedido.com"
    ];

    if (!adminEmails.includes(user.email || "")) {
      router.push('/admin/dashboard');
      return;
    }

    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);
      } else {
        toast.error(data.error || 'Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.user_id,
          action: 'grant_access',
          plan: grantPlan,
          days: parseInt(grantDays)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Acesso concedido com sucesso!');
        setIsGrantModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || 'Erro ao conceder acesso');
      }
    } catch (error) {
      console.error('Erro ao conceder acesso:', error);
      toast.error('Erro ao conceder acesso');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    if (!confirm('Tem certeza que deseja revogar o acesso deste usuário?')) {
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'revoke_access'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Acesso revogado com sucesso!');
        fetchUsers();
      } else {
        toast.error(data.error || 'Erro ao revogar acesso');
      }
    } catch (error) {
      console.error('Erro ao revogar acesso:', error);
      toast.error('Erro ao revogar acesso');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (usuario: User) => {
    const status = usuario.status_assinatura?.toLowerCase();
    
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ativa</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Trial</Badge>;
      case 'expirada':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Expirada</Badge>;
      case 'sem assinatura':
        return <Badge variant="secondary">Sem Assinatura</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getPlanBadge = (plano: string) => {
    const planLower = plano?.toLowerCase();
    
    switch (planLower) {
      case 'free':
        return <Badge variant="outline" className="text-gray-600">Gratuito</Badge>;
      case 'paid':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pago</Badge>;
      default:
        return <Badge variant="secondary">---</Badge>;
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.status_assinatura?.toLowerCase() === 'ativa' || u.status_assinatura?.toLowerCase() === 'trial').length,
    paid: users.filter(u => u.plan?.toLowerCase() === 'paid').length,
    trial: users.filter(u => u.status_assinatura?.toLowerCase() === 'trial').length
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-6 w-6 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        </div>
        <p className="text-gray-600">Visualize e gerencie todos os usuários e suas assinaturas</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Planos Pagos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserX className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Em Trial</p>
                <p className="text-2xl font-bold text-gray-900">{stats.trial}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium">Buscar usuários</Label>
              <Input
                id="search"
                placeholder="Digite o email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchUsers} variant="outline" className="gap-2">
                <Loader2 className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Usuários ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Usuário</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Plano</TableHead>
                  <TableHead className="font-semibold">Vencimento</TableHead>
                  <TableHead className="font-semibold">Cadastro</TableHead>
                  <TableHead className="font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((usuario) => (
                  <TableRow key={usuario.user_id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{usuario.restaurant_name || 'Restaurante não informado'}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {usuario.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(usuario)}
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(usuario.plan)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {usuario.end_date ? (
                          <div className="flex items-center gap-1 text-gray-900">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            {new Date(usuario.end_date).toLocaleDateString("pt-BR")}
                          </div>
                        ) : (
                          <span className="text-gray-400">---</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {new Date(usuario.signup_date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={isGrantModalOpen && selectedUser?.user_id === usuario.user_id} onOpenChange={(open) => {
                          setIsGrantModalOpen(open);
                          if (open) setSelectedUser(usuario);
                          else setSelectedUser(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1">
                              <UserCheck className="h-4 w-4" />
                              Conceder
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Conceder Acesso Manual</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Usuário</Label>
                                <p className="text-sm text-gray-600">{usuario.email}</p>
                              </div>
                              
                              <div>
                                <Label htmlFor="plan">Tipo de Plano</Label>
                                <Select value={grantPlan} onValueChange={setGrantPlan}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="free">Gratuito</SelectItem>
                                    <SelectItem value="paid">Pago</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div>
                                <Label htmlFor="days">Duração (dias)</Label>
                                <Select value={grantDays} onValueChange={setGrantDays}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="3">3 dias</SelectItem>
                                    <SelectItem value="7">7 dias</SelectItem>
                                    <SelectItem value="15">15 dias</SelectItem>
                                    <SelectItem value="30">30 dias</SelectItem>
                                    <SelectItem value="90">90 dias</SelectItem>
                                    <SelectItem value="365">1 ano</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex gap-2 pt-4">
                                <Button 
                                  onClick={handleGrantAccess} 
                                  disabled={actionLoading}
                                  className="flex-1"
                                >
                                  {actionLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Processando...
                                    </>
                                  ) : (
                                    'Conceder Acesso'
                                  )}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setIsGrantModalOpen(false)}
                                  disabled={actionLoading}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {(usuario.status_assinatura?.toLowerCase() === 'ativa' || usuario.status_assinatura?.toLowerCase() === 'trial') && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRevokeAccess(usuario.user_id)}
                            disabled={actionLoading}
                            className="gap-1"
                          >
                            <UserX className="h-4 w-4" />
                            Revogar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Nenhum usuário encontrado com os filtros aplicados.' : 'Nenhum usuário cadastrado.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}