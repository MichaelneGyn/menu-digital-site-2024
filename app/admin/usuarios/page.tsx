'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Mail, 
  Calendar,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  whatsapp: string | null;
  createdAt: string;
  trialEndsAt: string | null;
  subscriptionStatus: string | null;
  subscriptionPlan: string | null;
  restaurant: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

const ADMIN_EMAIL = 'michaeldouglasqueiroz@gmail.com';

export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'trial' | 'active' | 'canceled'>('all');

  // Verificar se é admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.email !== ADMIN_EMAIL) {
      toast.error('Acesso negado! Apenas administradores podem acessar esta página.');
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  // Carregar usuários
  useEffect(() => {
    if (session?.user?.email === ADMIN_EMAIL) {
      fetchUsers();
    }
  }, [session]);

  // Filtrar usuários
  useEffect(() => {
    let filtered = users;

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (filterStatus === 'trial') {
          return user.trialEndsAt && new Date(user.trialEndsAt) > new Date();
        }
        if (filterStatus === 'active') {
          return user.subscriptionStatus === 'active';
        }
        if (filterStatus === 'canceled') {
          return user.subscriptionStatus === 'canceled' || user.subscriptionStatus === null;
        }
        return true;
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterStatus, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Erro ao carregar usuários');
      const data = await response.json();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`⚠️ ATENÇÃO!\n\nTem certeza que deseja DELETAR o usuário:\n${userEmail}\n\nIsso vai deletar:\n- Conta do usuário\n- Restaurante\n- Todos os pedidos\n- Todos os dados\n\nEsta ação NÃO pode ser desfeita!`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar usuário');

      toast.success('Usuário deletado com sucesso!');
      fetchUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      toast.error('Erro ao deletar usuário');
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Email', 'Nome', 'WhatsApp', 'Restaurante', 'Status', 'Plano', 'Cadastro', 'Trial Termina'].join(','),
      ...filteredUsers.map(user => [
        user.email,
        user.name || 'Sem nome',
        user.whatsapp || 'Sem WhatsApp',
        user.restaurant?.name || 'Sem restaurante',
        getUserStatusState(user).label,
        user.subscriptionPlan || 'Trial',
        new Date(user.createdAt).toLocaleDateString('pt-BR'),
        user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('pt-BR') : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Usuários exportados com sucesso!');
  };

  const getUserStatusState = (user: User) => {
    const now = new Date();
    
    if (user.subscriptionStatus === 'active') {
        return { label: 'Assinante', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', isExpired: false };
    }
    
    if (user.subscriptionStatus === 'canceled') {
        return { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', isExpired: true };
    }

    if (user.trialEndsAt) {
        const trialEnd = new Date(user.trialEndsAt);
        if (trialEnd > now) {
             const days = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
             // Se faltar menos de 3 dias, fica amarelo/laranja para alertar
             const isWarning = days <= 3;
             return { 
                 label: 'Trial', 
                 daysLeft: days, 
                 color: isWarning ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200', 
                 dot: isWarning ? 'bg-orange-500' : 'bg-emerald-500',
                 isExpired: false
             };
        } else {
             return { label: 'Expirado', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500', isExpired: true };
        }
    }

    return { label: 'Inativo', color: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-500', isExpired: true };
   };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (session?.user?.email !== ADMIN_EMAIL) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👥 Gerenciar Usuários</h1>
              <p className="text-gray-600 mt-1">
                Total: <strong>{filteredUsers.length}</strong> usuários
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={exportUsers} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar por email, nome ou restaurante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Status */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'trial' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('trial')}
              >
                Trial
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Ativos
              </Button>
              <Button
                variant={filterStatus === 'canceled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('canceled')}
              >
                Cancelados
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name || 'Sem nome'}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          {user.whatsapp && (
                            <div className="text-xs text-gray-400">📱 {user.whatsapp}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.restaurant ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.restaurant.name}</div>
                          <div className="text-xs text-gray-500">/{user.restaurant.slug}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sem restaurante</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const status = getUserStatusState(user);
                        return (
                          <div className="flex flex-col gap-2 items-start">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`}></span>
                              {status.label}
                            </div>
                            
                            {status.daysLeft !== undefined && (
                              <span className={`text-xs font-semibold ${status.daysLeft <= 3 ? 'text-orange-600' : 'text-emerald-600'}`}>
                                {status.daysLeft} dias restantes
                              </span>
                            )}
                            
                            {user.subscriptionPlan && (
                              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                                {user.subscriptionPlan}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(user.id, user.email)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
