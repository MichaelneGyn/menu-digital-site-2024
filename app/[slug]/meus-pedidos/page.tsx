'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, CheckCircle, XCircle, Package, ShoppingCart } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

interface CartItemPreview {
  cartId: string;
  name: string;
  quantity: number;
  price: number;
}

interface RawCartItem {
  cartId?: string;
  id?: string;
  name?: string;
  quantity?: number;
  price?: number;
}

export default function MeusPedidosPage() {
  const params = useParams();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cartPreviewItems, setCartPreviewItems] = useState<CartItemPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!params?.slug) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/customer?restaurantSlug=${params.slug}`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar pedidos');
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [params?.slug]);

  useEffect(() => {
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
    if (!slug) return;

    const storageKey = `menu-cart:${slug}`;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setCartPreviewItems([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setCartPreviewItems([]);
        return;
      }

      const sanitized = (parsed as RawCartItem[])
        .filter((item) => item && item.name && item.quantity)
        .map((item) => ({
          cartId: String(item.cartId || item.id || Math.random()),
          name: String(item.name),
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0
        }));

      setCartPreviewItems(sanitized);
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      setCartPreviewItems([]);
    }
  }, [params?.slug]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Meus Pedidos</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum pedido finalizado ainda
            </h2>
            <p className="text-gray-500 mb-6">
              Adicionar no carrinho não cria pedido. Finalize o checkout para aparecer aqui.
            </p>
            {cartPreviewItems.length > 0 && (
              <div className="max-w-md mx-auto mb-6 text-left bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingCart className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-gray-800">Itens no carrinho</h3>
                </div>
                <div className="space-y-2">
                  {cartPreviewItems.slice(0, 5).map((item) => (
                    <div key={item.cartId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}x {item.name}</span>
                      <span className="font-medium text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Volte e finalize o pedido no carrinho para ele aparecer nesta tela.
                </p>
              </div>
            )}
            <button
              onClick={() => router.back()}
              className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors"
            >
              Voltar para finalizar pedido
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header do Pedido */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className="font-semibold text-gray-700">
                        Pedido #{order.id}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-sm font-medium text-gray-600">
                      Status: {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="px-4 py-3">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                        </div>
                        <span className="text-gray-700 font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Total</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Espaçamento para Bottom Nav */}
      <div className="h-20" />
    </div>
  );
}
