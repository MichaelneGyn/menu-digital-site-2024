import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const table = await prisma.table.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        number: true,
        restaurantId: true,
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Mesa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Erro ao buscar mesa:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar mesa' },
      { status: 500 }
    );
  }
}
