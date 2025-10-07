'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, MapPin, CreditCard, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
  menuItem: {
    name: string;
  };
}

interface Order {
  id: string;
  code: string;
  status: string;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  deliveryAddress: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-300',
  'PREPARING': 'bg-orange-100 text-orange-800 border-orange-300',
  'READY': 'bg-purple-100 text-purple-800 border-purple-300',
  'DELIVERED': 'bg-green-100 text-green-800 border-green-300',
  'CANCELLED': 'bg-red-100 text-red-800 border-red-300',
};

const STATUS_LABELS: Record<string, string> = {
  'PENDING': '⏳ Pendente',
  'CONFIRMED': '✅ Confirmado', 
  'PREPARING': '👨‍🍳 Preparando',
  'READY': '🍕 Pronto',
  'DELIVERED': '🚚 Entregue',
  'CANCELLED': '❌ Cancelado',
};

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Falha ao carregar comandas');
      const data = await res.json();
      setOrders(data);
      setLastUpdate(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
      return;
    }

    fetchOrders();
    
    // Atualização automática a cada 10 segundos
    const interval = setInterval(fetchOrders, 10000);
    
    return () => clearInterval(interval);
  }, [session, status, router, fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      
      if (!res.ok) throw new Error('Falha ao atualizar status');
      
      toast.success(`Status atualizado para: ${STATUS_LABELS[newStatus]}`);
      fetchOrders();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p className="text-lg font-medium">Carregando comandas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                📋 Comandas - Pedidos em Tempo Real
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie todos os pedidos ordenados por data e hora de chegada
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                🔄 Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
              </div>
              <Button onClick={() => router.push('/admin/dashboard')} variant="outline">
                Voltar
              </Button>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-xl font-medium text-gray-600 mb-2">Nenhuma comanda encontrada</p>
              <p className="text-gray-500">Aguardando novos pedidos...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className={`h-2 ${STATUS_COLORS[order.status]?.replace('bg-', 'bg-') || 'bg-gray-200'}`} />
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Order Info */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800">
                            Pedido #{order.code}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(order.createdAt).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                        <Badge 
                          className={`${STATUS_COLORS[order.status] || 'bg-gray-100'} border px-4 py-2 text-base font-medium`}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </Badge>
                      </div>

                      {/* Informações do Cliente */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h4 className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                          👤 Informações do Cliente
                        </h4>
                        <div className="space-y-2 text-sm">
                          {order.customerName && (
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-blue-800 min-w-[80px]">Nome:</span>
                              <span className="text-gray-700">{order.customerName}</span>
                            </div>
                          )}
                          {order.customerPhone && (
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-blue-600 mt-0.5" />
                              <span className="font-medium text-blue-800 min-w-[80px]">Telefone:</span>
                              <span className="text-gray-700">{order.customerPhone}</span>
                            </div>
                          )}
                          {order.deliveryAddress && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                              <span className="font-medium text-blue-800 min-w-[80px]">Endereço:</span>
                              <span className="text-gray-700">{order.deliveryAddress}</span>
                            </div>
                          )}
                          {order.notes && (
                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-blue-200">
                              <span className="font-medium text-blue-800 min-w-[80px]">Obs:</span>
                              <span className="text-gray-700 italic">{order.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items do Pedido */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold mb-3 text-gray-700">Itens do Pedido:</h4>
                        <div className="space-y-2">
                          {order.orderItems?.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="bg-red-100 text-red-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                  {item.quantity}x
                                </span>
                                <span className="font-medium">{item.menuItem.name}</span>
                                {item.notes && (
                                  <span className="text-xs text-gray-500 italic">({item.notes})</span>
                                )}
                              </div>
                              <span className="font-semibold text-gray-700">
                                R$ {Number(item.totalPrice).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          <span>Pagamento: {order.paymentMethod || 'Dinheiro'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions & Total */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                        <div className="text-sm text-gray-600 mb-1">Total do Pedido</div>
                        <div className="text-3xl font-bold text-green-700 flex items-center gap-2">
                          <DollarSign className="w-6 h-6" />
                          R$ {Number(order.total).toFixed(2)}
                        </div>
                      </div>

                      {/* Status Actions */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-3">Atualizar Status:</p>
                        {order.status === 'PENDING' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            👨‍🍳 Iniciar Preparo
                          </Button>
                        )}
                        {order.status === 'PREPARING' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            ✅ Marcar como Pronto
                          </Button>
                        )}
                        {order.status === 'READY' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            🚚 Marcar como Entregue
                          </Button>
                        )}
                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                          <Button 
                            onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                            variant="outline"
                            className="w-full border-red-300 text-red-600 hover:bg-red-50"
                          >
                            ❌ Cancelar Pedido
                          </Button>
                        )}
                      </div>
                    </div>
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