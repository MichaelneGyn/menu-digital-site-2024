import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PATCH - Atualizar status do pedido
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Usando cliente Supabase global
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Validar status
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    // Buscar o restaurante do usuário
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    // Verificar se o pedido pertence ao restaurante do usuário
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: id,
        restaurantId: restaurant.id
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar o status do pedido
    const updatedOrder = await prisma.order.update({
      where: {
        id: id
      },
      data: {
        status: status.toUpperCase(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Status do pedido atualizado com sucesso',
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Buscar pedido específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;

    // Buscar o restaurante do usuário
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    // Buscar o pedido específico
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        restaurantId: restaurant.id
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
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

    // Formatar os dados
    const formattedOrder = {
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      address: order.customerAddress,
      phone: order.customerPhone,
      total: Number(order.total),
      status: order.status.toLowerCase(),
      paymentMethod: order.paymentMethod,
      createdAt: order.updatedAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        customizations: item.notes ? [item.notes] : []
      }))
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}