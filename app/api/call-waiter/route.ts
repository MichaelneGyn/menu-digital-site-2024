import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Chamar garçom
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantId, tableNumber, tableId } = body;

    if (!restaurantId || !tableNumber) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Buscar mesa se tableId não foi fornecido
    let finalTableId = tableId;
    if (!finalTableId) {
      const table = await prisma.table.findFirst({
        where: {
          restaurantId,
          number: tableNumber,
        },
      });
      
      if (!table) {
        return NextResponse.json({ error: 'Mesa não encontrada' }, { status: 404 });
      }
      
      finalTableId = table.id;
    }

    // Verificar se já existe uma chamada PENDING para essa mesa
    const existingCall = await prisma.waiterCall.findFirst({
      where: {
        restaurantId,
        tableId: finalTableId,
        status: 'PENDING',
      },
    });

    if (existingCall) {
      // Já existe chamada ativa, não criar duplicada
      return NextResponse.json({
        success: true,
        message: 'Chamada já registrada anteriormente',
        callId: existingCall.id,
      });
    }

    // Criar nova chamada
    const waiterCall = await prisma.waiterCall.create({
      data: {
        restaurantId,
        tableId: finalTableId,
        tableNumber,
        status: 'PENDING',
      },
      include: {
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    });

    // Log para debug
    const timestamp = new Date().toLocaleString('pt-BR');
    console.log(`[${timestamp}] GARCOM CHAMADO - Mesa ${tableNumber} - ${waiterCall.restaurant.name}`);

    return NextResponse.json({
      success: true,
      message: 'Garçom chamado com sucesso',
      callId: waiterCall.id,
    });
  } catch (error) {
    console.error('Erro ao chamar garçom:', error);
    return NextResponse.json({ error: 'Erro ao chamar garçom' }, { status: 500 });
  }
}
