'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  address?: string;
  phone?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
  paymentMethod?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'preparing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ready':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'delivered':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'preparing':
      return 'Preparando';
    case 'ready':
      return 'Pronto';
    case 'delivered':
      return 'Entregue';
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'preparing':
      return '👨‍🍳';
    case 'ready':
      return '✅';
    case 'delivered':
      return '🚚';
    default:
      return '📋';
  }
};

const formatOrderNumber = (id: string) => {
  return `#${id.slice(-6).toUpperCase()}`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR') + ', ' + date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export default function ComandasPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    if (loading) return;

    if (!session || !user) {
      router.push('/auth/login');
      return;
    }

    fetchOrders();
    fetchRestaurantData();

    // Atualizar pedidos a cada 30 segundos
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [session, loading, user, router]);

  const fetchRestaurantData = async () => {
    try {
      const response = await fetch('/api/restaurant');
      if (response.ok) {
        const data = await response.json();
        // A API retorna um array, então pegamos o primeiro restaurante
        const restaurantData = Array.isArray(data) ? data[0] : data;
        setRestaurant(restaurantData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do restaurante:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });
      
      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        toast.success('Status do pedido atualizado!');
        // Recarregar pedidos para garantir sincronização
        fetchOrders();
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'delivered';
      default:
        return currentStatus;
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'Iniciar Preparo';
      case 'preparing':
        return 'Marcar como Pronto';
      case 'ready':
        return 'Marcar como Entregue';
      default:
        return 'Concluído';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando comandas...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="outline" size="sm">
                  <span className="mr-2">📊</span>
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Comandas - Pedidos em Tempo Real
                </h1>
                <p className="text-gray-600">
                  Gerencie todos os pedidos ordenados por data e hora de chegada
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {restaurant && (
                <Link href={`/cardapio/${restaurant.slug}`}>
                  <Button variant="outline" className="animated-button">
                    <span className="mr-2">👁️</span>
                    Ver Cardápio
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="animated-button"
              >
                <span className="mr-2">🔄</span>
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-600">
              Os pedidos aparecerão aqui assim que forem realizados.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-bold">
                        Pedido {formatOrderNumber(order.id)}
                      </CardTitle>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {order.customerName} • {formatDate(order.createdAt)}
                        </p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div>📍 {order.address}</div>
                          <div>📞 {order.phone}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-sm font-medium`}>
                        {getStatusIcon(order.status)} {getStatusText(order.status)}
                      </Badge>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-green-600">
                          R$ {order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Itens do Pedido:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <span className="font-medium">
                              {item.quantity}x {item.name}
                            </span>
                            {item.customizations && item.customizations.length > 0 && (
                              <p className="text-sm text-gray-600 mt-1">
                                + {item.customizations.join(', ')}
                              </p>
                            )}
                          </div>
                          <span className="font-semibold">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">💳 Pagamento:</span>
                      <Badge variant="outline">{order.paymentMethod}</Badge>
                    </div>
                    
                    {order.status !== 'delivered' && (
                      <Button
                        onClick={() => updateOrderStatus(order.id, getNextStatus(order.status) as Order['status'])}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <span className="mr-2">🚀</span>
                        {getNextStatusText(order.status)}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}