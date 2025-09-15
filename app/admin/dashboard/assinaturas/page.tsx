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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { Calendar, Crown, TrendingUp, Users, DollarSign, Clock, Filter, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  start_date: string;
  end_date: string;
  days_remaining: number;
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
  };
}

interface SubscriptionStats {
  total_subscriptions: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  free_plans: number;
  paid_plans: number;
  revenue_current_month: number;
  revenue_last_month: number;
  new_subscriptions_this_month: number;
  expiring_soon: number;
}

export default function SubscriptionsManagement() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [extendDays, setExtendDays] = useState('30');
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

    fetchSubscriptions();
    fetchStats();
  }, [user, router]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/subscriptions');
      const data = await response.json();
      
      if (response.ok) {
        setSubscriptions(data.subscriptions);
      } else {
        toast.error(data.error || 'Erro ao carregar assinaturas');
      }
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      toast.error('Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.stats);
      } else {
        console.error('Erro ao carregar estatísticas:', data.error);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleExtendSubscription = async () => {
    if (!selectedSubscription) return;
    
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: selectedSubscription.id,
          action: 'extend',
          days: parseInt(extendDays)
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Assinatura estendida com sucesso!');
        setIsExtendModalOpen(false);
        setSelectedSubscription(null);
        fetchSubscriptions();
        fetchStats();
      } else {
        toast.error(data.error || 'Erro ao estender assinatura');
      }
    } catch (error) {
      console.error('Erro ao estender assinatura:', error);
      toast.error('Erro ao estender assinatura');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) {
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          action: 'cancel'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Assinatura cancelada com sucesso!');
        fetchSubscriptions();
        fetchStats();
      } else {
        toast.error(data.error || 'Erro ao cancelar assinatura');
      }
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast.error('Erro ao cancelar assinatura');
    } finally {
      setActionLoading(false);
    }
  };

  const exportSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `assinaturas_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const getStatusBadge = (subscription: Subscription) => {
    const { status, plan, days_remaining } = subscription;
    
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

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesPlan = planFilter === 'all' || subscription.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando assinaturas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Assinaturas</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportSubscriptions} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={() => { fetchSubscriptions(); fetchStats(); }} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-gray-600">Visualize e gerencie todas as assinaturas do sistema</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total de Assinaturas</p>
                      <p className="text-2xl font-bold">{stats.total_subscriptions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Assinaturas Ativas</p>
                      <p className="text-2xl font-bold">{stats.active_subscriptions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Planos Pagos</p>
                      <p className="text-2xl font-bold">{stats.paid_plans}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Expirando em Breve</p>
                      <p className="text-2xl font-bold">{stats.expiring_soon}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Resumo Rápido */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assinaturas por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ativas</span>
                    <Badge variant="default">{stats?.active_subscriptions || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expiradas</span>
                    <Badge variant="destructive">{stats?.expired_subscriptions || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expirando em 7 dias</span>
                    <Badge variant="outline">{stats?.expiring_soon || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assinaturas por Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Planos Gratuitos</span>
                    <Badge variant="outline">{stats?.free_plans || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Planos Pagos</span>
                    <Badge variant="default">{stats?.paid_plans || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Novas este mês</span>
                    <Badge variant="secondary">{stats?.new_subscriptions_this_month || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Buscar usuário</Label>
                  <Input
                    id="search"
                    placeholder="Email ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plan">Plano</Label>
                  <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="paid">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setPlanFilter('all');
                    }} 
                    variant="outline"
                    className="w-full"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de assinaturas */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Assinaturas ({filteredSubscriptions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subscription.user.full_name || 'Nome não informado'}</div>
                            <div className="text-sm text-gray-600">{subscription.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subscription.plan === 'paid' ? 'default' : 'outline'}>
                            {subscription.plan === 'paid' ? 'Pago' : 'Gratuito'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(subscription)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(subscription.start_date).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(subscription.end_date).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-gray-600">
                              {subscription.days_remaining > 0 
                                ? `${subscription.days_remaining} dias restantes`
                                : 'Expirado'
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={isExtendModalOpen && selectedSubscription?.id === subscription.id} onOpenChange={(open) => {
                              setIsExtendModalOpen(open);
                              if (open) setSelectedSubscription(subscription);
                              else setSelectedSubscription(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Estender
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Estender Assinatura</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Usuário</Label>
                                    <p className="text-sm text-gray-600">{subscription.user.email}</p>
                                  </div>
                                  
                                  <div>
                                    <Label>Vencimento Atual</Label>
                                    <p className="text-sm text-gray-600">
                                      {new Date(subscription.end_date).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="days">Estender por (dias)</Label>
                                    <Select value={extendDays} onValueChange={setExtendDays}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="7">7 dias</SelectItem>
                                        <SelectItem value="15">15 dias</SelectItem>
                                        <SelectItem value="30">30 dias</SelectItem>
                                        <SelectItem value="60">60 dias</SelectItem>
                                        <SelectItem value="90">90 dias</SelectItem>
                                        <SelectItem value="365">1 ano</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-4">
                                    <Button 
                                      onClick={handleExtendSubscription} 
                                      disabled={actionLoading}
                                      className="flex-1"
                                    >
                                      {actionLoading ? 'Processando...' : 'Estender'}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => setIsExtendModalOpen(false)}
                                      disabled={actionLoading}
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {subscription.status === 'active' && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleCancelSubscription(subscription.id)}
                                disabled={actionLoading}
                              >
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredSubscriptions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                      ? 'Nenhuma assinatura encontrada com os filtros aplicados.' 
                      : 'Nenhuma assinatura cadastrada.'
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análises Detalhadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="mb-2">Análises avançadas em desenvolvimento</p>
                <p className="text-sm">Em breve: gráficos de crescimento, análise de churn, previsões de receita</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}