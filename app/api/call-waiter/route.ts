import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Chamar garçom
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, tableNumber } = body;

    if (!restaurantId || !tableNumber) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar informações do restaurante
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        name: true,
        whatsapp: true,
        user: {
          select: {
            phone: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    // Aqui você pode integrar com sistemas de notificação:
    // - Enviar WhatsApp
    // - Enviar SMS
    // - Notificação push
    // - Email
    // - Sistema interno de chamadas

    // Por enquanto, vou apenas registrar no console
    const timestamp = new Date().toLocaleString('pt-BR');
    console.log(`[${timestamp}] 🔔 GARÇOM CHAMADO - Mesa ${tableNumber} - ${restaurant.name}`);

    // Você pode criar uma tabela WaiterCall para registrar as chamadas
    // await prisma.waiterCall.create({
    //   data: {
    //     restaurantId,
    //     tableNumber,
    //     timestamp: new Date(),
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Garçom chamado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao chamar garçom:', error);
    return NextResponse.json({ error: 'Erro ao chamar garçom' }, { status: 500 });
  }
}
