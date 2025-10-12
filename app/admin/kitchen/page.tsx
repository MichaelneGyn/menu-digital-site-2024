'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChefHat,
  Package,
  Truck,
  ArrowLeft,
  RefreshCw,
  Bell
} from 'lucide-react';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

type Order = {
  id: string;
  code: string;
  status: OrderStatus;
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  estimatedTime?: number;
  orderItems: Array<{
    id: string;
    quantity: number;
    menuItem: {
      name: string;
    };
    notes?: string;
  }>;
};

const STATUS_CONFIG = {
  PENDING: {
    label: 'Aguardando',
    color: 'bg-yellow-500',
    icon: Clock,
    textColor: 'text-yellow-600',
    bgLight: 'bg-yellow-50',
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'bg-blue-500',
    icon: CheckCircle,
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50',
  },
  PREPARING: {
    label: 'Preparando',
    color: 'bg-purple-500',
    icon: ChefHat,
    textColor: 'text-purple-600',
    bgLight: 'bg-purple-50',
  },
  READY: {
    label: 'Pronto',
    color: 'bg-green-500',
    icon: Package,
    textColor: 'text-green-600',
    bgLight: 'bg-green-50',
  },
  DELIVERED: {
    label: 'Entregue',
    color: 'bg-gray-500',
    icon: Truck,
    textColor: 'text-gray-600',
    bgLight: 'bg-gray-50',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-500',
    icon: XCircle,
    textColor: 'text-red-600',
    bgLight: 'bg-red-50',
  },
};

export default function KitchenDisplayPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Busca pedidos
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    fetchOrders();
    
    if (autoRefresh) {
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Atualiza status do pedido
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, estimatedTime?: number) => {
    setUpdatingOrderId(orderId);
    
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          estimatedTime,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Atualiza lista local
        await fetchOrders();

        // Abre WhatsApp se houver notificação
        if (data.notification?.whatsappUrl) {
          // Abre WhatsApp DIRETO na conversa com mensagem pré-preenchida
          window.open(data.notification.whatsappUrl, '_blank');
          
          // Feedback para o usuário
          alert('✅ WhatsApp aberto!\n📱 Mensagem já está pronta, só clicar em Enviar!');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do pedido');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Calcula tempo desde criação
  const getTimeSinceCreation = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}min`;
  };

  // Filtra pedidos
  const filteredOrders = activeFilter === 'ALL' 
    ? orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
    : orders.filter(o => o.status === activeFilter);

  // Agrupa por status para o layout em colunas
  const ordersByStatus = {
    PENDING: orders.filter(o => o.status === 'PENDING'),
    CONFIRMED: orders.filter(o => o.status === 'CONFIRMED'),
    PREPARING: orders.filter(o => o.status === 'PREPARING'),
    READY: orders.filter(o => o.status === 'READY'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <ChefHat className="w-6 h-6" />
                Painel de Comandos
              </h1>
              <p className="text-sm text-gray-600">
                Gerencie pedidos em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Bell className="w-4 h-4 mr-2" />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Layout em Colunas - Kanban Style */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Coluna: Aguardando */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Aguardando
              </h3>
              <Badge variant="outline">{ordersByStatus.PENDING.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {ordersByStatus.PENDING.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  isUpdating={updatingOrderId === order.id}
                  getTimeSinceCreation={getTimeSinceCreation}
                />
              ))}
              
              {ordersByStatus.PENDING.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum pedido aguardando
                </p>
              )}
            </div>
          </div>

          {/* Coluna: Confirmado */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Confirmado
              </h3>
              <Badge variant="outline">{ordersByStatus.CONFIRMED.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {ordersByStatus.CONFIRMED.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  isUpdating={updatingOrderId === order.id}
                  getTimeSinceCreation={getTimeSinceCreation}
                />
              ))}
              
              {ordersByStatus.CONFIRMED.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum pedido confirmado
                </p>
              )}
            </div>
          </div>

          {/* Coluna: Preparando */}
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-purple-600" />
                Preparando
              </h3>
              <Badge variant="outline">{ordersByStatus.PREPARING.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {ordersByStatus.PREPARING.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  isUpdating={updatingOrderId === order.id}
                  getTimeSinceCreation={getTimeSinceCreation}
                />
              ))}
              
              {ordersByStatus.PREPARING.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum pedido em preparo
                </p>
              )}
            </div>
          </div>

          {/* Coluna: Pronto */}
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-green-600" />
                Pronto
              </h3>
              <Badge variant="outline">{ordersByStatus.READY.length}</Badge>
            </div>
            
            <div className="space-y-2">
              {ordersByStatus.READY.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={updateOrderStatus}
                  isUpdating={updatingOrderId === order.id}
                  getTimeSinceCreation={getTimeSinceCreation}
                />
              ))}
              
              {ordersByStatus.READY.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum pedido pronto
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Card de Pedido
function OrderCard({
  order,
  onUpdateStatus,
  isUpdating,
  getTimeSinceCreation,
}: {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus, estimatedTime?: number) => void;
  isUpdating: boolean;
  getTimeSinceCreation: (createdAt: string) => string;
}) {
  const config = STATUS_CONFIG[order.status];
  const timeSince = getTimeSinceCreation(order.createdAt);

  // Define próximo status
  const getNextStatus = (): OrderStatus | null => {
    switch (order.status) {
      case 'PENDING': return 'CONFIRMED';
      case 'CONFIRMED': return 'PREPARING';
      case 'PREPARING': return 'READY';
      case 'READY': return 'DELIVERED';
      default: return null;
    }
  };

  const nextStatus = getNextStatus();
  const nextConfig = nextStatus ? STATUS_CONFIG[nextStatus] : null;

  return (
    <Card className="border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: config.color.replace('bg-', '#') }}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">#{order.code}</CardTitle>
          <Badge className={`${config.color} text-white`}>
            {timeSince}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Cliente */}
        <div>
          <p className="font-semibold text-sm">{order.customerName}</p>
          <p className="text-xs text-gray-600">{order.customerPhone}</p>
        </div>

        {/* Itens */}
        <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
          {order.orderItems.map(item => (
            <div key={item.id} className="flex justify-between">
              <span>{item.quantity}x {item.menuItem.name}</span>
            </div>
          ))}
        </div>

        {/* Observações */}
        {order.notes && (
          <div className="bg-yellow-50 p-2 rounded">
            <p className="text-xs font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Observações:
            </p>
            <p className="text-xs">{order.notes}</p>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm font-semibold">Total:</span>
          <span className="text-lg font-bold text-green-600">
            R$ {Number(order.total).toFixed(2)}
          </span>
        </div>

        {/* Botões de Ação */}
        {nextStatus && nextConfig && (
          <Button
            className="w-full"
            onClick={() => onUpdateStatus(order.id, nextStatus, order.status === 'CONFIRMED' ? 30 : undefined)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <nextConfig.icon className="w-4 h-4 mr-2" />
                Marcar como {nextConfig.label}
              </>
            )}
          </Button>
        )}

        {order.status === 'PENDING' && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onUpdateStatus(order.id, 'CANCELLED')}
            disabled={isUpdating}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
