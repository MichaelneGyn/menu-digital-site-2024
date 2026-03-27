import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST: Adicionar adicional
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { customizationId, name, price, description, displayOrder } = body;
    if (!customizationId || !name) {
      return NextResponse.json({ error: 'customizationId e name são obrigatórios' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || user.restaurants.length === 0) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const customization = await prisma.categoryCustomization.findUnique({
      where: { id: customizationId },
      select: { id: true, restaurantId: true }
    });

    if (!customization || customization.restaurantId !== user.restaurants[0].id) {
      return NextResponse.json({ error: 'Não autorizado para esta personalização' }, { status: 403 });
    }

    const extra = await prisma.customizationExtra.create({
      data: {
        categoryCustomizationId: customizationId,
        name,
        price: Number(price) || 0,
        description: description || null,
        displayOrder: Number(displayOrder) || 0,
        isActive: true,
      }
    });

    return NextResponse.json({ success: true, extra });

  } catch (error) {
    console.error('Erro ao adicionar adicional:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT: Atualizar adicional
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, price, description, displayOrder } = body;
    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || user.restaurants.length === 0) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const existing = await prisma.customizationExtra.findUnique({
      where: { id },
      include: {
        categoryCustomization: {
          select: { restaurantId: true }
        }
      }
    });

    if (!existing || existing.categoryCustomization.restaurantId !== user.restaurants[0].id) {
      return NextResponse.json({ error: 'Não autorizado para este adicional' }, { status: 403 });
    }

    const extra = await prisma.customizationExtra.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        price: price !== undefined ? Number(price) || 0 : existing.price,
        description: description !== undefined ? description : existing.description,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) || 0 : existing.displayOrder
      }
    });

    return NextResponse.json({ success: true, extra });

  } catch (error) {
    console.error('Erro ao atualizar adicional:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE: Remover adicional
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || user.restaurants.length === 0) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const existing = await prisma.customizationExtra.findUnique({
      where: { id },
      include: {
        categoryCustomization: {
          select: { restaurantId: true }
        }
      }
    });

    if (!existing || existing.categoryCustomization.restaurantId !== user.restaurants[0].id) {
      return NextResponse.json({ error: 'Não autorizado para este adicional' }, { status: 403 });
    }

    await prisma.customizationExtra.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao remover adicional:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
