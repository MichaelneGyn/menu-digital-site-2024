import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar mesa pelo QR Code (pública)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qrCode = searchParams.get('qrCode');

    if (!qrCode) {
      return NextResponse.json({ error: 'QR Code é obrigatório' }, { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { qrCode },
      include: {
        restaurant: {
          select: {
            id: true,
            slug: true,
            name: true,
            isActive: true,
            allowOrders: true,
          },
        },
      },
    });

    if (!table || !table.isActive || !table.restaurant.isActive) {
      return NextResponse.json({ error: 'Mesa não encontrada ou inativa' }, { status: 404 });
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Erro ao buscar mesa:', error);
    return NextResponse.json({ error: 'Erro ao buscar mesa' }, { status: 500 });
  }
}
