'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  Zap,
  ShoppingBag,
  Truck,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';

// Plataformas disponíveis
const PLATFORMS = [
  {
    id: 'ifood',
    name: 'iFood',
    icon: '🍔',
    color: '#EA1D2C',
    description: 'Maior plataforma de delivery do Brasil',
    docsUrl: 'https://developer.ifood.com.br',
    fields: ['client_id', 'client_secret', 'store_id']
  },
  {
    id: '99food',
    name: '99Food',
    icon: '🚗',
    color: '#FFD500',
    description: 'Delivery com taxas reduzidas',
    docsUrl: 'https://merchant.99app.com',
    fields: ['api_key', 'merchant_id']
  },
  {
    id: 'rappi',
    name: 'Rappi',
    icon: '🛵',
    color: '#FF4D00',
    description: 'Delivery rápido e confiável',
    docsUrl: 'https://partners.rappi.com',
    fields: ['client_id', 'client_secret', 'store_id']
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    icon: '🚙',
    color: '#06C167',
    description: 'Delivery global da Uber',
    docsUrl: 'https://developer.uber.com',
    fields: ['client_id', 'client_secret', 'store_id']
  },
  {
    id: 'aiqfome',
    name: 'aiqfome',
    icon: '🍕',
    color: '#FF6B00',
    description: 'Delivery regional forte',
    docsUrl: 'https://aiqfome.com',
    fields: ['api_key', 'store_id']
  }
];

interface Integration {
  id: string;
  platform: string;
  display_name: string;
  is_active: boolean;
  sync_status: string;
  last_sync_at: string | null;
  auto_accept_orders: boolean;
  auto_sync_menu: boolean;
}

export default function IntegrationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [configuring, setConfiguring] = useState(false);

  // Form state
  const [formData, setFormData] = useState<any>({});

  // Verificar se é admin
  const ADMIN_EMAIL = 'michaeldouglasqueiroz@gmail.com';
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (!isAdmin) {
      toast.error('Acesso negado! Área em desenvolvimento.');
      router.push('/admin/dashboard');
      return;
    }

    loadIntegrations();
  }, [session, status, isAdmin, router]);

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      }
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigurePlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    const existing = integrations.find(i => i.platform === platformId);
    if (existing) {
      // Carregar dados existentes
      setFormData({ platform: platformId });
    } else {
      setFormData({ platform: platformId });
    }
  };

  const handleSaveIntegration = async () => {
    setConfiguring(true);
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Integração configurada com sucesso!');
        setSelectedPlatform(null);
        setFormData({});
        loadIntegrations();
      } else {
        const error = await response.text();
        toast.error(error || 'Erro ao configurar integração');
      }
    } catch (error) {
      toast.error('Erro ao salvar integração');
    } finally {
      setConfiguring(false);
    }
  };

  const handleToggleActive = async (integrationId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });

      if (response.ok) {
        toast.success(isActive ? 'Integração ativada!' : 'Integração desativada!');
        loadIntegrations();
      }
    } catch (error) {
      toast.error('Erro ao atualizar integração');
    }
  };

  const handleSyncNow = async (integrationId: string) => {
    try {
      toast.loading('Sincronizando...');
      const response = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: 'POST'
      });

      if (response.ok) {
        toast.dismiss();
        toast.success('Sincronização concluída!');
        loadIntegrations();
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Erro ao sincronizar');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      synced: { label: 'Sincronizado', color: 'bg-green-100 text-green-800' },
      syncing: { label: 'Sincronizando', color: 'bg-blue-100 text-blue-800' },
      error: { label: 'Erro', color: 'bg-red-100 text-red-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' }
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Aviso de Desenvolvimento */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🚧</span>
          <h2 className="text-xl font-bold text-blue-900">Área em Desenvolvimento</h2>
        </div>
        <p className="text-blue-700 mb-2">
          Esta funcionalidade está sendo desenvolvida e estará disponível em breve para todos os clientes.
        </p>
        <p className="text-sm text-blue-600">
          ✅ Interface pronta • 🔄 Integrações com APIs em desenvolvimento • 🚀 Upgrade gratuito quando disponível
        </p>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integrações de Delivery</h1>
        <p className="text-gray-600">
          Conecte seu restaurante com as principais plataformas de delivery e receba todos os pedidos em um só lugar.
        </p>
      </div>

      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="platforms">
            <ShoppingBag className="mr-2" size={16} />
            Plataformas
          </TabsTrigger>
          <TabsTrigger value="active">
            <Zap className="mr-2" size={16} />
            Ativas ({integrations.filter(i => i.is_active).length})
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="mr-2" size={16} />
            Pedidos Externos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Plataformas Disponíveis */}
        <TabsContent value="platforms">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORMS.map((platform) => {
              const integration = integrations.find(i => i.platform === platform.id);
              const isConfigured = !!integration;
              const isActive = integration?.is_active || false;

              return (
                <Card key={platform.id} className="relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 right-0 h-2"
                    style={{ backgroundColor: platform.color }}
                  />
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{platform.icon}</div>
                        <div>
                          <CardTitle className="text-xl">{platform.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {platform.description}
                          </CardDescription>
                        </div>
                      </div>
                      {isConfigured && (
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {isConfigured && integration ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          {getStatusBadge(integration.sync_status)}
                        </div>

                        {integration.last_sync_at && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Última sinc:</span>
                            <span className="font-medium">
                              {new Date(integration.last_sync_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Ativa:</span>
                          <Switch
                            checked={isActive}
                            onCheckedChange={(checked) => handleToggleActive(integration.id, checked)}
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleConfigurePlatform(platform.id)}
                          >
                            <Settings size={16} className="mr-2" />
                            Configurar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncNow(integration.id)}
                          >
                            <RefreshCw size={16} />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          Configure esta integração para receber pedidos automaticamente.
                        </p>
                        <Button
                          className="w-full"
                          onClick={() => handleConfigurePlatform(platform.id)}
                        >
                          <Settings size={16} className="mr-2" />
                          Configurar Integração
                        </Button>
                        <a
                          href={platform.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center text-sm text-blue-600 hover:underline"
                        >
                          Ver documentação
                          <ExternalLink size={14} className="ml-1" />
                        </a>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab: Integrações Ativas */}
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Integrações Ativas</CardTitle>
              <CardDescription>
                Gerencie suas integrações ativas e monitore o status de sincronização
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrations.filter(i => i.is_active).length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600">Nenhuma integração ativa</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Configure uma integração na aba "Plataformas"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {integrations.filter(i => i.is_active).map((integration) => {
                    const platform = PLATFORMS.find(p => p.id === integration.platform);
                    return (
                      <div
                        key={integration.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{platform?.icon}</div>
                          <div>
                            <h3 className="font-semibold">{platform?.name}</h3>
                            <p className="text-sm text-gray-600">
                              {integration.auto_accept_orders ? 'Aceita pedidos automaticamente' : 'Requer confirmação manual'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(integration.sync_status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSyncNow(integration.id)}
                          >
                            <RefreshCw size={16} className="mr-2" />
                            Sincronizar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pedidos Externos */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos de Plataformas</CardTitle>
              <CardDescription>
                Visualize todos os pedidos recebidos das plataformas integradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">Em desenvolvimento</p>
                <p className="text-sm text-gray-500 mt-2">
                  Os pedidos das plataformas aparecerão aqui automaticamente
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Configuração */}
      {selectedPlatform && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {PLATFORMS.find(p => p.id === selectedPlatform)?.icon}
                  </div>
                  <div>
                    <CardTitle>
                      Configurar {PLATFORMS.find(p => p.id === selectedPlatform)?.name}
                    </CardTitle>
                    <CardDescription>
                      Insira as credenciais da API para conectar
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlatform(null)}
                >
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campos dinâmicos baseados na plataforma */}
              {PLATFORMS.find(p => p.id === selectedPlatform)?.fields.map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field.replace('_', ' ').toUpperCase()}
                  </Label>
                  <Input
                    id={field}
                    type="text"
                    placeholder={`Digite o ${field}`}
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  />
                </div>
              ))}

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aceitar pedidos automaticamente</Label>
                    <p className="text-sm text-gray-500">
                      Pedidos serão aceitos sem confirmação manual
                    </p>
                  </div>
                  <Switch
                    checked={formData.auto_accept_orders || false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, auto_accept_orders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sincronizar cardápio automaticamente</Label>
                    <p className="text-sm text-gray-500">
                      Alterações no cardápio serão enviadas para a plataforma
                    </p>
                  </div>
                  <Switch
                    checked={formData.auto_sync_menu !== false}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, auto_sync_menu: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedPlatform(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveIntegration}
                  disabled={configuring}
                >
                  {configuring ? (
                    <>
                      <RefreshCw className="mr-2 animate-spin" size={16} />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2" size={16} />
                      Salvar Integração
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
