import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  total: z.number().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get('restaurantId') ?? undefined;

  // Limitar pedidos ao restaurante do usuário, quando informado
  let where: any = {};
  if (restaurantId) {
    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
      include: { restaurants: true },
    });
    if (!user || !user.restaurants?.find((r) => r.id === restaurantId)) {
      return NextResponse.json({ error: 'Não autorizado para este restaurante' }, { status: 403 });
    }
    where.restaurantId = restaurantId;
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      orderItems: {
        include: {
          menuItem: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, total } = createOrderSchema.parse(body);

    // Verificar se o restaurante existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    // Gerar código incremental por restaurante
    const last = await prisma.order.findFirst({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });
    const nextNum = last ? Number((last.code.match(/\d+/)?.[0] ?? '0')) + 1 : 1;
    const code = `#${String(nextNum).padStart(5, '0')}`;

    // Criar pedido com status PENDING
    const created = await prisma.order.create({
      data: {
        restaurantId,
        status: 'PENDING',
        total: total ?? 0,
        code,
      },
    });
    
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pedido' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId e status são obrigatórios' }, { status: 400 });
    }

    // Validar status
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    // Verificar se o pedido pertence ao restaurante do usuário
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants?.find(r => r.id === order.restaurantId)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    // Atualizar status
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}