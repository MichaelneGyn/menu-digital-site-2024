'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Order {
  id: string;
  customername: string;
  customeraddress: string;
  customerphone: string;
  paymentmethod: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  created_at: string;
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export default function ComandasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!session || !user) {
      router.push('/auth/login');
      return;
    }
    fetchOrders();
  }, [session, user, router]);

  // 🚀 Buscar pedidos via API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const badge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'secondary' as const },
      preparing: { label: 'Preparando', variant: 'default' as const },
      ready: { label: 'Pronto', variant: 'outline' as const },
      delivered: { label: 'Entregue', variant: 'destructive' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Atualizar a lista de pedidos
        fetchOrders();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">📋 Comandas - Pedidos em Tempo Real</h1>
          <Link href="/admin/dashboard">
            <Button variant="outline">← Voltar ao Dashboard</Button>
          </Link>
        </div>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">📋 Comandas - Pedidos em Tempo Real</h1>
          <p className="text-gray-600">
            Gerencie todos os pedidos ordenados por data e hora de chegada.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOrders} variant="outline">
            🔄 Atualizar
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline">← Voltar ao Dashboard</Button>
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Sem pedidos no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Pedido #{order.id} • {formatDate(order.created_at)}
                  </CardTitle>
                  {badge(order.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-medium">👤 Cliente</p>
                    <p className="text-gray-600">{order.customername}</p>
                  </div>
                  <div>
                    <p className="font-medium">📞 Telefone</p>
                    <p className="text-gray-600">{order.customerphone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium">📍 Endereço</p>
                    <p className="text-gray-600">{order.customeraddress}</p>
                  </div>
                  <div>
                    <p className="font-medium">💳 Pagamento</p>
                    <p className="text-gray-600">{order.paymentmethod}</p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium mb-2">🍕 Itens do Pedido:</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-medium">R$ {item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {order.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      ✅ Marcar como Preparando
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      🍕 Marcar como Pronto
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button 
                      size="sm" 
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      🚚 Marcar como Entregue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}