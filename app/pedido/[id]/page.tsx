'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  MapPin, 
  Phone,
  ArrowLeft,
  CreditCard,
  ChefHat
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Estados do pedido
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  estimated_time: string;
  created_at: string;
  updated_at: string;
}

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!orderId) return;

    // Buscar pedido inicial
    fetchOrder();

    // Polling: Atualizar automaticamente a cada 5 segundos
    // (funciona com qualquer banco de dados - GRÁTIS!)
    const pollInterval = setInterval(() => {
      fetchOrder(true); // true = auto-refresh silencioso
      console.log('🔄 Atualizando status do pedido...');
    }, 5000); // 5 segundos

    return () => {
      clearInterval(pollInterval);
    };
  }, [orderId]);

  const fetchOrder = async (isAutoRefresh = false) => {
    try {
      if (isAutoRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        throw new Error('Pedido não encontrado');
      }

      const data = await response.json();
      setOrder(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getStatusConfig = (status: OrderStatus) => {
    // Normalizar status para minúsculas (banco pode salvar em MAIÚSCULAS)
    const normalizedStatus = status?.toLowerCase().trim() as OrderStatus;
    
    const configs = {
      pending: {
        label: 'Aguardando Confirmação',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        progress: 10
      },
      confirmed: {
        label: 'Pedido Confirmado',
        icon: CheckCircle2,
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        progress: 25
      },
      preparing: {
        label: 'Em Preparo',
        icon: ChefHat,
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        progress: 50
      },
      ready: {
        label: 'Pedido Pronto',
        icon: Package,
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        progress: 75
      },
      out_for_delivery: {
        label: 'Saiu para Entrega',
        icon: Truck,
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        progress: 90
      },
      delivered: {
        label: 'Entregue',
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-800 border-green-300',
        progress: 100
      },
      cancelled: {
        label: 'Cancelado',
        icon: Clock,
        color: 'bg-red-100 text-red-800 border-red-300',
        progress: 0
      }
    };

    return configs[normalizedStatus] || configs.pending;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      pix: 'PIX',
      card_on_delivery: 'Cartão na Entrega',
      cash_on_delivery: 'Dinheiro na Entrega'
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando pedido...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pedido não encontrado</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">Pedido #{order.order_number}</CardTitle>
                {/* Indicador AO VIVO */}
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </div>
                  <span className="text-xs font-semibold text-red-600">AO VIVO</span>
                </div>
              </div>
              <Badge className={`${statusConfig.color} border`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">Progresso do Pedido</span>
                <span className="text-gray-600">{statusConfig.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${statusConfig.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        {order.status !== 'cancelled' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium">Tempo Estimado</p>
                  <p className="text-sm text-gray-600">{order.estimated_time}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium">Endereço de Entrega</p>
                  <p className="text-sm text-gray-600">{order.delivery_address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="font-medium">Contato</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Itens do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start pb-3 border-b last:border-0">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  {item.customizations && (
                    <p className="text-sm text-gray-600">{item.customizations}</p>
                  )}
                  <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                </div>
                <p className="font-medium">R$ {item.price.toFixed(2)}</p>
              </div>
            ))}

            <div className="pt-4 space-y-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>R$ {order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Taxa de entrega:</span>
                <span>R$ {order.delivery_fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span className="text-red-600">R$ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">Forma de Pagamento</p>
                <p className="text-sm text-gray-600">{getPaymentMethodLabel(order.payment_method)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Cardápio
          </Button>
          <Button
            onClick={() => window.open(`https://wa.me/5511999999999?text=Sobre%20pedido%20${order.order_number}`, '_blank')}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Phone className="w-4 h-4 mr-2" />
            Falar no WhatsApp
          </Button>
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-center space-y-2 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <p className="text-sm font-medium text-gray-700">
              Atualizando automaticamente a cada 5 segundos
            </p>
          </div>
          <p className="text-xs text-gray-500">
            ✨ Sem precisar recarregar a página - igual ao iFood!
          </p>
        </div>
      </div>
    </div>
  );
}
