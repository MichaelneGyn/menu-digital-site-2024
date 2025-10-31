import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantSlug = searchParams.get('restaurantSlug');

    if (!restaurantSlug) {
      return NextResponse.json(
        { error: 'Restaurant slug é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar restaurante
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
      select: { id: true }
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }

    // Buscar ID do cliente no cookie
    const cookieStore = cookies();
    const customerId = cookieStore.get('customerId')?.value;

    // Se não tem cookie, retorna array vazio
    if (!customerId) {
      return NextResponse.json([]);
    }

    // Buscar pedidos deste cliente neste restaurante
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        customerPhone: customerId, // Usando customerPhone para armazenar o customerId
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    // Formatar resposta
    const formattedOrders = orders.map((order: any) => ({
      id: order.code || order.id,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      items: order.orderItems.map((item: any) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.unitPrice,
      }))
    }));

    return NextResponse.json(formattedOrders);

  } catch (error) {
    console.error('Erro ao buscar pedidos do cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedidos' },
      { status: 500 }
    );
  }
}
