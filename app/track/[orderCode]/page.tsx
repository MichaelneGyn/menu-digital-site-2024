'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package, 
  Truck,
  MapPin,
  Phone,
  CreditCard,
  AlertCircle,
  RefreshCw
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
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
  deliveredAt?: string;
  estimatedTime?: number;
  orderItems: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    menuItem: {
      name: string;
      image?: string;
    };
    notes?: string;
  }>;
  restaurant: {
    name: string;
    logo?: string;
    whatsapp?: string;
  };
};

const STATUS_STEPS = [
  {
    key: 'PENDING',
    label: 'Pedido Recebido',
    icon: Clock,
    description: 'Aguardando confirmação',
  },
  {
    key: 'CONFIRMED',
    label: 'Confirmado',
    icon: CheckCircle,
    description: 'Pedido confirmado',
  },
  {
    key: 'PREPARING',
    label: 'Em Preparo',
    icon: ChefHat,
    description: 'Sendo preparado',
  },
  {
    key: 'READY',
    label: 'Pronto',
    icon: Package,
    description: 'Saiu para entrega',
  },
  {
    key: 'DELIVERED',
    label: 'Entregue',
    icon: Truck,
    description: 'Pedido entregue',
  },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const orderCode = params?.orderCode as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/track/${orderCode}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          setError('Pedido não encontrado');
        } else {
          setError('Erro ao buscar pedido');
        }
        return;
      }

      const data = await res.json();
      setOrder(data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar pedido:', err);
      setError('Erro ao carregar informações do pedido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderCode) {
      fetchOrder();
      
      // Auto-refresh a cada 30 segundos
      const interval = setInterval(fetchOrder, 30000);
      return () => clearInterval(interval);
    }
  }, [orderCode]);

  // Calcula o passo atual
  const getCurrentStep = (status: OrderStatus): number => {
    return STATUS_STEPS.findIndex(step => step.key === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Carregando informações do pedido...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-bold mb-2">Ops!</h2>
              <p className="text-gray-600">{error || 'Pedido não encontrado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = getCurrentStep(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {order.restaurant.logo && (
                  <img 
                    src={order.restaurant.logo} 
                    alt={order.restaurant.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <CardTitle className="text-2xl">{order.restaurant.name}</CardTitle>
                  <p className="text-sm text-gray-600">Pedido #{order.code}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrder}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Status Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Status do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.status === 'CANCELLED' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                <h3 className="font-bold text-lg mb-2">Pedido Cancelado</h3>
                <p className="text-sm text-gray-600">
                  Este pedido foi cancelado. Entre em contato com o restaurante para mais informações.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="relative">
                      {/* Linha conectora */}
                      {index < STATUS_STEPS.length - 1 && (
                        <div 
                          className={`absolute left-5 top-12 w-0.5 h-12 ${
                            index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      )}
                      
                      {/* Step */}
                      <div className="flex items-start gap-4">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <StepIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-semibold ${isCurrent ? 'text-green-600' : ''}`}>
                            {step.label}
                            {isCurrent && (
                              <Badge className="ml-2 bg-green-500">Atual</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">{step.description}</p>
                          
                          {/* Timestamp */}
                          {isCompleted && (
                            <p className="text-xs text-gray-500 mt-1">
                              {getTimestamp(order, step.key as OrderStatus)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tempo Estimado */}
            {order.estimatedTime && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Tempo estimado:</p>
                    <p className="text-sm text-blue-700">{order.estimatedTime} minutos</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detalhes do Pedido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Itens do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.orderItems.map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.quantity}x {item.menuItem.name}</p>
                    {item.notes && (
                      <p className="text-sm text-gray-600">Obs: {item.notes}</p>
                    )}
                  </div>
                  <p className="font-semibold">R$ {item.unitPrice.toFixed(2)}</p>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-3 border-t-2">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-xl text-green-600">
                  R$ {Number(order.total).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Entrega */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Endereço:</p>
              <p className="font-medium">{order.deliveryAddress}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <CreditCard className="w-4 h-4" />
                Pagamento:
              </p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        {order.restaurant.whatsapp && (
          <Card>
            <CardContent className="pt-6">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.open(`https://api.whatsapp.com/send?phone=${order.restaurant.whatsapp}`, '_blank')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Falar com o Restaurante
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper para formatar timestamp
function getTimestamp(order: Order, status: OrderStatus): string {
  let date: string | undefined;
  
  switch (status) {
    case 'PENDING':
      date = order.createdAt;
      break;
    case 'CONFIRMED':
      date = order.confirmedAt;
      break;
    case 'PREPARING':
      date = order.preparingAt;
      break;
    case 'READY':
      date = order.readyAt;
      break;
    case 'DELIVERED':
      date = order.deliveredAt;
      break;
  }
  
  if (!date) return '';
  
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
