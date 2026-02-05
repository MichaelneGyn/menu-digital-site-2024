import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Busca o usuário e seu restaurante
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        restaurants: { take: 1 },
      },
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }

    const restaurant = user.restaurants[0];
    const today = new Date();
    const yesterday = subDays(today, 1);

    // Definição de status válidos para contabilizar vendas
    const validStatuses = ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

    // Buscando dados de HOJE
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const ordersToday = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: {
          in: validStatuses as any, // Cast to any to avoid type issues if enum mismatch in prisma types
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Buscando dados de ONTEM
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const ordersYesterday = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
        status: {
          in: validStatuses as any,
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Helper para calcular totais
    const calculateStats = (orders: any[]) => {
      const count = orders.length;
      const revenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);
      const itemsSold = orders.reduce((acc, order) => {
        return acc + order.orderItems.reduce((itemAcc: number, item: any) => itemAcc + item.quantity, 0);
      }, 0);
      const averageTicket = count > 0 ? revenue / count : 0;

      return { count, revenue, itemsSold, averageTicket };
    };

    const statsToday = calculateStats(ordersToday);
    const statsYesterday = calculateStats(ordersYesterday);

    // Helper para calcular variação percentual
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const growth = {
      orders: calculateGrowth(statsToday.count, statsYesterday.count),
      revenue: calculateGrowth(statsToday.revenue, statsYesterday.revenue),
      averageTicket: calculateGrowth(statsToday.averageTicket, statsYesterday.averageTicket),
      itemsSold: calculateGrowth(statsToday.itemsSold, statsYesterday.itemsSold),
    };

    return NextResponse.json({
      today: statsToday,
      yesterday: statsYesterday,
      growth,
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
