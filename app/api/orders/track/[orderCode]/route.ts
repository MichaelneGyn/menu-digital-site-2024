import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * API pública para rastreamento de pedido (não requer autenticação)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { orderCode: string } }
) {
  try {
    const { orderCode } = params;

    if (!orderCode) {
      return NextResponse.json(
        { error: 'Código do pedido é obrigatório' },
        { status: 400 }
      );
    }

    // Busca o pedido pelo código
    const order = await prisma.order.findUnique({
      where: { code: orderCode },
      include: {
        restaurant: {
          select: {
            name: true,
            logo: true,
            whatsapp: true,
          },
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Erro ao buscar pedido para rastreamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
      { status: 500 }
    );
  }
}
