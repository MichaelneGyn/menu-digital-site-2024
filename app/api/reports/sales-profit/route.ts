import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * API de Relatórios de Vendas e Lucro
 * GET /api/reports/sales-profit?period=today|week|month|custom&startDate=...&endDate=...
 */
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
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Calcula as datas de início e fim baseado no período
    let startDate: Date;
    let endDate: Date = new Date();

    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        if (startDateParam && endDateParam) {
          startDate = new Date(startDateParam);
          endDate = new Date(endDateParam);
        } else {
          return NextResponse.json(
            { error: 'Datas customizadas requerem startDate e endDate' },
            { status: 400 }
          );
        }
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Busca todos os pedidos do período
    const orders = await prisma.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['COMPLETED', 'DELIVERED'], // Apenas pedidos concluídos
        },
      },
      include: {
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Calcula estatísticas
    let totalRevenue = 0;
    let totalCost = 0;
    let totalOrders = orders.length;
    const productStats: Record<string, {
      name: string;
      sold: number;
      revenue: number;
      cost: number;
      profit: number;
      margin: number;
    }> = {};

    for (const order of orders) {
      for (const item of order.orderItems) {
        const itemPrice = item.unitPrice;
        const itemCost = item.menuItem?.cost || 0;
        const quantity = item.quantity;

        totalRevenue += itemPrice * quantity;
        totalCost += itemCost * quantity;

        // Estatísticas por produto
        const productId = item.menuItemId;
        if (!productStats[productId]) {
          productStats[productId] = {
            name: item.menuItem?.name || 'Produto Desconhecido',
            sold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
            margin: 0,
          };
        }

        productStats[productId].sold += quantity;
        productStats[productId].revenue += itemPrice * quantity;
        productStats[productId].cost += itemCost * quantity;
      }
    }

    // Calcula lucro e margem por produto
    const products = Object.values(productStats).map(product => {
      const profit = product.revenue - product.cost;
      const margin = product.revenue > 0 ? (profit / product.revenue) * 100 : 0;
      
      return {
        ...product,
        profit,
        margin,
      };
    });

    // Ordena por lucro (maior para menor)
    products.sort((a, b) => b.profit - a.profit);

    // Calcula totais
    const totalProfit = totalRevenue - totalCost;
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const averageProfitPerOrder = totalOrders > 0 ? totalProfit / totalOrders : 0;
    const roi = totalCost > 0 ? totalRevenue / totalCost : 0;

    // Produtos com baixa margem (< 30%)
    const lowMarginProducts = products.filter(p => p.margin < 30 && p.margin > 0);

    // Insights automáticos
    const insights = [];
    
    if (averageMargin >= 50) {
      insights.push({
        type: 'success',
        message: `Sua margem média está ótima! (${averageMargin.toFixed(1)}%)`,
      });
    } else if (averageMargin >= 30) {
      insights.push({
        type: 'warning',
        message: `Sua margem está razoável (${averageMargin.toFixed(1)}%). Considere otimizar custos.`,
      });
    } else if (averageMargin > 0) {
      insights.push({
        type: 'danger',
        message: `Atenção! Margem baixa (${averageMargin.toFixed(1)}%). Revise seus preços!`,
      });
    }

    if (lowMarginProducts.length > 0) {
      insights.push({
        type: 'warning',
        message: `${lowMarginProducts.length} produto(s) com margem abaixo de 30%`,
        products: lowMarginProducts.slice(0, 3).map(p => p.name),
      });
    }

    if (roi >= 2) {
      insights.push({
        type: 'success',
        message: `Excelente ROI! Para cada R$ 1 investido, você ganhou R$ ${roi.toFixed(2)}`,
      });
    }

    return NextResponse.json({
      success: true,
      period: {
        type: period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        revenue: totalRevenue,
        cost: totalCost,
        profit: totalProfit,
        margin: averageMargin,
        roi,
        totalOrders,
        averageTicket,
        averageProfitPerOrder,
      },
      products,
      lowMarginProducts,
      insights,
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}
