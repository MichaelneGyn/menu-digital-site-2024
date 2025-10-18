import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { apiRateLimiter } from '@/lib/rate-limit';

/**
 * GET /api/orders/[id]
 * Busca detalhes de um pedido específico (público)
 * 🔒 Com rate limiting para prevenir scraping
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔒 SEGURANÇA: Rate limiting (60 req/min por IP)
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const limitResult = apiRateLimiter(ip);
    
    if (!limitResult.success) {
      return limitResult.response!;
    }
    
    const orderId = params.id;

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID do pedido não fornecido' },
        { status: 400 }
      );
    }

    // Buscar pedido com itens relacionados
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                price: true
              }
            }
          }
        },
        restaurant: {
          select: {
            name: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Calcular subtotal e taxa de entrega
    const orderData = order as any;
    const subtotal = orderData.orderItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    const deliveryFee = 4.00; // Valor fixo ou buscar das configurações do restaurante
    const total = parseFloat(order.total.toString());

    // 🔒 SEGURANÇA: Mascarar dados sensíveis (LGPD)
    const maskPhone = (phone: string) => {
      if (!phone || phone.length < 4) return '***';
      return phone.slice(0, 2) + '***' + phone.slice(-2);
    };

    const maskAddress = (address: string) => {
      if (!address || address.length < 10) return 'Endereço cadastrado';
      // Mostrar apenas bairro/cidade, ocultar número
      const parts = address.split(',');
      if (parts.length > 2) {
        return parts.slice(2).join(',').trim();
      }
      return 'Endereço cadastrado';
    };

    // Formatar resposta (dados sensíveis mascarados)
    const formattedOrder = {
      id: order.id,
      order_number: order.code,
      status: order.status.toLowerCase(), // Normalizar para minúsculas
      customer_name: order.customerName ? order.customerName.split(' ')[0] : 'Cliente', // Apenas primeiro nome
      customer_phone: maskPhone(order.customerPhone || ''), // 🔒 Telefone mascarado
      delivery_address: maskAddress(order.deliveryAddress || order.customerAddress || ''), // 🔒 Endereço parcial
      items: orderData.orderItems.map((item: any) => ({
        id: item.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.totalPrice,
        customizations: item.customizations || ''
      })),
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total: total,
      payment_method: order.paymentMethod || 'Não informado',
      estimated_time: order.estimatedTime ? `${order.estimatedTime}min` : '40-50min',
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString()
    };

    return NextResponse.json(formattedOrder);

  } catch (error: any) {
    console.error('❌ [API] Error fetching order:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedido', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[id]
 * Atualiza status do pedido (ADMIN APENAS)
 * 🔒 PROTEGIDO: Requer autenticação via NextAuth Session
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🔒 SEGURANÇA: Verificar autenticação via NextAuth Session (SEGURO!)
    // Session usa httpOnly cookies, não expõe credenciais no front-end
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.warn('🚨 [SECURITY] Unauthorized PATCH attempt to order:', params.id);
      return NextResponse.json(
        { error: 'Não autorizado. Faça login como administrador.' },
        { status: 401 }
      );
    }

    const orderId = params.id;
    const body = await request.json();
    const { status } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID do pedido não fornecido' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status não fornecido' },
        { status: 400 }
      );
    }

    // Validar status
    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ];

    if (!validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    // Atualizar status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status.toUpperCase(),
        updatedAt: new Date()
      }
    });

    console.log(`✅ [API] Order ${orderId} status updated to: ${status} (authenticated)`);

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error: any) {
    console.error('❌ [API] Error updating order:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido' },
      { status: 500 }
    );
  }
}
