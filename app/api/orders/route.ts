import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/auth';
import { prisma } from '../../../lib/db';

// GET - Buscar todos os pedidos
export async function GET(request: NextRequest) {
  try {
    // Criar cliente Supabase com contexto da requisição
    const supabaseClient = createSupabaseClient();
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
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

    // Buscar pedidos do restaurante
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    // Formatar os dados para o frontend
    const formattedOrders = orders.map((order: any) => ({
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
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        customizations: item.notes ? [item.notes] : []
      }))
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurantId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      paymentMethod,
      items,
      total
    } = body;

    // Validações básicas
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Gerar número único do pedido
    const orderNumber = `PED${Date.now()}`;

    // Criar o pedido
    const order = await prisma.order.create({
      data: {
        orderNumber,
        restaurantId,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress: deliveryAddress,
        paymentMethod,
        total: parseFloat(total),
        status: 'PENDING',
        orderItems: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: parseFloat(item.price),
            totalPrice: parseFloat(item.price) * item.quantity,
            notes: item.customizations ? item.customizations.join(', ') : null
          }))
        }
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Pedido criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}