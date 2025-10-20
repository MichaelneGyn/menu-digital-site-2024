import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Listar chamadas ativas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar usuário e restaurante
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        restaurants: {
          select: { id: true },
        },
      },
    });

    if (!user || user.restaurants.length === 0) {
      return NextResponse.json({ calls: [] });
    }

    const restaurantId = user.restaurants[0].id;

    // Buscar chamadas ativas (PENDING) e recentes (últimas 50)
    const [activeCalls, recentCalls] = await Promise.all([
      // Chamadas ativas
      prisma.waiterCall.findMany({
        where: {
          restaurantId,
          status: 'PENDING',
        },
        orderBy: {
          createdAt: 'asc', // Mais antigas primeiro
        },
        include: {
          table: {
            select: {
              number: true,
              capacity: true,
            },
          },
        },
      }),
      // Chamadas recentes (atendidas/dismissed nas últimas 2 horas)
      prisma.waiterCall.findMany({
        where: {
          restaurantId,
          status: {
            in: ['ATTENDED', 'DISMISSED'],
          },
          attendedAt: {
            gte: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          },
        },
        orderBy: {
          attendedAt: 'desc',
        },
        take: 50,
        include: {
          table: {
            select: {
              number: true,
              capacity: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      activeCalls,
      recentCalls,
      totalActive: activeCalls.length,
    });
  } catch (error) {
    console.error('Erro ao buscar chamadas:', error);
    return NextResponse.json({ error: 'Erro ao buscar chamadas' }, { status: 500 });
  }
}

// PATCH - Marcar chamada como atendida/dismissed
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { callId, status } = body;

    if (!callId || !['ATTENDED', 'DISMISSED'].includes(status)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Atualizar chamada
    const updatedCall = await prisma.waiterCall.update({
      where: { id: callId },
      data: {
        status,
        attendedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      call: updatedCall,
    });
  } catch (error) {
    console.error('Erro ao atualizar chamada:', error);
    return NextResponse.json({ error: 'Erro ao atualizar chamada' }, { status: 500 });
  }
}
