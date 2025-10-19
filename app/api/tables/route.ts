import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

// GET - Listar mesas
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true },
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const tables = await prisma.table.findMany({
      where: { restaurantId: user.restaurants[0].id },
      orderBy: { number: 'asc' },
    });

    return NextResponse.json({ tables });
  } catch (error) {
    console.error('Erro ao buscar mesas:', error);
    return NextResponse.json({ error: 'Erro ao buscar mesas' }, { status: 500 });
  }
}

// POST - Criar mesa
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true },
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const body = await req.json();
    const { number, capacity, notes } = body;

    if (!number) {
      return NextResponse.json({ error: 'Número da mesa é obrigatório' }, { status: 400 });
    }

    // Verificar se já existe mesa com esse número
    const existing = await prisma.table.findFirst({
      where: {
        restaurantId: user.restaurants[0].id,
        number,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Já existe uma mesa com este número' }, { status: 400 });
    }

    // Gerar QR Code único
    const qrCode = randomBytes(16).toString('hex');

    const table = await prisma.table.create({
      data: {
        restaurantId: user.restaurants[0].id,
        number,
        qrCode,
        capacity: capacity || 4,
        notes,
      },
    });

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Erro ao criar mesa:', error);
    return NextResponse.json({ error: 'Erro ao criar mesa' }, { status: 500 });
  }
}

// PUT - Atualizar mesa
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { id, number, capacity, notes, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID da mesa é obrigatório' }, { status: 400 });
    }

    // Verificar se a mesa pertence ao usuário
    const existingTable = await prisma.table.findUnique({
      where: { id },
      include: { restaurant: { include: { user: true } } },
    });

    if (!existingTable || existingTable.restaurant.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Mesa não encontrada' }, { status: 404 });
    }

    // Se mudou o número, verificar se não existe outra mesa com esse número
    if (number && number !== existingTable.number) {
      const duplicate = await prisma.table.findFirst({
        where: {
          restaurantId: existingTable.restaurantId,
          number,
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json({ error: 'Já existe uma mesa com este número' }, { status: 400 });
      }
    }

    const table = await prisma.table.update({
      where: { id },
      data: {
        ...(number !== undefined && { number }),
        ...(capacity !== undefined && { capacity }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ table });
  } catch (error) {
    console.error('Erro ao atualizar mesa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar mesa' }, { status: 500 });
  }
}

// DELETE - Excluir mesa
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da mesa é obrigatório' }, { status: 400 });
    }

    // Verificar se a mesa pertence ao usuário
    const existingTable = await prisma.table.findUnique({
      where: { id },
      include: { restaurant: { include: { user: true } } },
    });

    if (!existingTable || existingTable.restaurant.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Mesa não encontrada' }, { status: 404 });
    }

    // Verificar se há pedidos ativos na mesa
    const activeOrders = await prisma.order.count({
      where: {
        tableId: id,
        status: { in: ['pending', 'confirmed', 'preparing', 'ready'] },
      },
    });

    if (activeOrders > 0) {
      return NextResponse.json({ error: 'Não é possível excluir mesa com pedidos ativos' }, { status: 400 });
    }

    await prisma.table.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir mesa:', error);
    return NextResponse.json({ error: 'Erro ao excluir mesa' }, { status: 500 });
  }
}
