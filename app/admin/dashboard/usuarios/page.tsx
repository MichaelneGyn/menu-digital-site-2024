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
import { Users, UserCheck, UserX, Calendar, Mail, Crown } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  subscription: {
    id: string;
    plan: string;
    status: string;
    start_date: string;
    end_date: string;
    days_remaining: number;
  } | null;
  total_subscriptions: number;
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
        setUsers(data.users);
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
          userId: selectedUser.id,
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

  const getStatusBadge = (user: User) => {
    if (!user.subscription) {
      return <Badge variant="secondary">Sem Assinatura</Badge>;
    }
    
    const { status, plan, days_remaining } = user.subscription;
    
    if (status === 'expired') {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    if (status === 'active') {
      const variant = plan === 'free' ? 'outline' : 'default';
      const label = plan === 'free' ? `Gratuito (${days_remaining}d)` : `Pago (${days_remaining}d)`;
      return <Badge variant={variant}>{label}</Badge>;
    }
    
    return <Badge variant="secondary">{status}</Badge>;
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.subscription?.status === 'active').length,
    paid: users.filter(u => u.subscription?.plan === 'paid' && u.subscription?.status === 'active').length,
    free: users.filter(u => u.subscription?.plan === 'free' && u.subscription?.status === 'active').length
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-6 w-6 text-yellow-600" />
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
        </div>
        <p className="text-gray-600">Visualize e gerencie todos os usuários e suas assinaturas</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Planos Pagos</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Planos Gratuitos</p>
                <p className="text-2xl font-bold">{stats.free}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar usuários</Label>
              <Input
                id="search"
                placeholder="Digite o email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchUsers} variant="outline">
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'Nome não informado'}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      {user.subscription ? (
                        <div className="text-sm">
                          <div className="font-medium capitalize">{user.subscription.plan}</div>
                          <div className="text-gray-600">{user.total_subscriptions} assinatura(s)</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.subscription ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.subscription.end_date).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="text-gray-600">
                            {user.subscription.days_remaining > 0 
                              ? `${user.subscription.days_remaining} dias restantes`
                              : 'Expirado'
                            }
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={isGrantModalOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                          setIsGrantModalOpen(open);
                          if (open) setSelectedUser(user);
                          else setSelectedUser(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <UserCheck className="h-4 w-4 mr-1" />
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
                                <p className="text-sm text-gray-600">{user.email}</p>
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
                                  {actionLoading ? 'Processando...' : 'Conceder Acesso'}
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
                        
                        {user.subscription?.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRevokeAccess(user.id)}
                            disabled={actionLoading}
                          >
                            <UserX className="h-4 w-4 mr-1" />
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
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhum usuário encontrado com os filtros aplicados.' : 'Nenhum usuário cadastrado.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}