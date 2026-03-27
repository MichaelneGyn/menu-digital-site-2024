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
    const customerPhone = cookieStore.get('customerPhone')?.value;

    if (!customerId && !customerPhone) {
      return NextResponse.json([]);
    }

    const customerIdentifiers = [customerId, customerPhone].filter(Boolean) as string[];

    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        customerPhone: {
          in: customerIdentifiers
        }
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

    type OrderWithItems = {
      id: string;
      code: string | null;
      status: string;
      total: number;
      createdAt: Date;
      orderItems: Array<{
        quantity: number;
        unitPrice: number;
        menuItem: { name: string };
      }>;
    };

    // Formatar resposta
    const formattedOrders = (orders as OrderWithItems[]).map((order) => ({
      id: order.code || order.id,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      items: order.orderItems.map((item) => ({
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
