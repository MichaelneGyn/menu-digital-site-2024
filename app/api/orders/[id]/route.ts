import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/orders/[id]
 * Busca detalhes de um pedido específico (público)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Formatar resposta
    const formattedOrder = {
      id: order.id,
      order_number: order.code,
      status: order.status.toLowerCase(), // Normalizar para minúsculas
      customer_name: order.customerName || 'Cliente',
      customer_phone: order.customerPhone || '',
      delivery_address: order.deliveryAddress || order.customerAddress || 'Não informado',
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
 * Atualiza status do pedido (admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    // Atualizar status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        updatedAt: new Date()
      }
    });

    console.log(`✅ [API] Order ${orderId} status updated to: ${status}`);

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error: any) {
    console.error('❌ [API] Error updating order:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pedido', details: error.message },
      { status: 500 }
    );
  }
}
