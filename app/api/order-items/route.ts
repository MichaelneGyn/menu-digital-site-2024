import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createOrderItemSchema = z.object({
  orderId: z.string().min(1),
  menuItemId: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  notes: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Permitir criar itens sem autenticação para pedidos de clientes
    const body = await req.json();
    const { orderId, menuItemId, quantity, unitPrice, totalPrice, notes } = createOrderItemSchema.parse(body);

    // Verificar se o pedido existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verificar se o item do menu existe
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Item do menu não encontrado' }, { status: 404 });
    }

    // Criar item do pedido
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId,
        menuItemId,
        quantity,
        unitPrice,
        totalPrice,
        notes: notes || null,
      },
      include: {
        menuItem: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(orderItem, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar item do pedido:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
  }

  try {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: {
        menuItem: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(orderItems);
  } catch (error) {
    console.error('Erro ao buscar itens do pedido:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
