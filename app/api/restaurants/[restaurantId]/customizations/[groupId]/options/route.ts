import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST - Adicionar opção ao grupo
export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { restaurantId, groupId } = params;
    const body = await request.json();

    // Verificar permissões
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        user: { email: session.user.email }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const option = await prisma.customizationOption.create({
      data: {
        name: body.name,
        price: body.price ?? 0,
        image: body.image,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
        groupId
      }
    });

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error('Error creating customization option:', error);
    return NextResponse.json(
      { error: 'Failed to create customization option' },
      { status: 500 }
    );
  }
}

// DELETE - Remover opção do grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { restaurantId } = params;
    const { searchParams } = new URL(request.url);
    const optionId = searchParams.get('optionId');

    if (!optionId) {
      return NextResponse.json(
        { error: 'Option ID required' },
        { status: 400 }
      );
    }

    // Verificar permissões
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        user: { email: session.user.email }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.customizationOption.delete({
      where: { id: optionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customization option:', error);
    return NextResponse.json(
      { error: 'Failed to delete customization option' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar opção
export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { restaurantId } = params;
    const body = await request.json();
    const { optionId, ...data } = body;

    if (!optionId) {
      return NextResponse.json(
        { error: 'Option ID required' },
        { status: 400 }
      );
    }

    // Verificar permissões
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        user: { email: session.user.email }
      }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const option = await prisma.customizationOption.update({
      where: { id: optionId },
      data: {
        name: data.name,
        price: data.price,
        image: data.image,
        isActive: data.isActive,
        sortOrder: data.sortOrder
      }
    });

    return NextResponse.json(option);
  } catch (error) {
    console.error('Error updating customization option:', error);
    return NextResponse.json(
      { error: 'Failed to update customization option' },
      { status: 500 }
    );
  }
}
