import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Buscar grupo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string; groupId: string } }
) {
  try {
    const { groupId } = params;

    const group = await prisma.customizationGroup.findUnique({
      where: { id: groupId },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' }
        },
        menuItems: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error fetching customization group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customization group' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar grupo de customização
export async function PUT(
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

    const group = await prisma.customizationGroup.update({
      where: { id: groupId },
      data: {
        name: body.name,
        description: body.description,
        isRequired: body.isRequired,
        minSelections: body.minSelections,
        maxSelections: body.maxSelections,
        sortOrder: body.sortOrder,
        isActive: body.isActive
      },
      include: {
        options: true
      }
    });

    return NextResponse.json(group);
  } catch (error) {
    console.error('Error updating customization group:', error);
    return NextResponse.json(
      { error: 'Failed to update customization group' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir grupo de customização
export async function DELETE(
  request: NextRequest,
  { params }: { params: { restaurantId: string; groupId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { restaurantId, groupId } = params;

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

    await prisma.customizationGroup.delete({
      where: { id: groupId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customization group:', error);
    return NextResponse.json(
      { error: 'Failed to delete customization group' },
      { status: 500 }
    );
  }
}
