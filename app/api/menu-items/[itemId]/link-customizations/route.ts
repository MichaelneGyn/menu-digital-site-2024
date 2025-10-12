import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Buscar customizações vinculadas a um produto
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        customizationGroups: {
          include: {
            options: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json(menuItem.customizationGroups);
  } catch (error) {
    console.error('Error fetching linked customizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customizations' },
      { status: 500 }
    );
  }
}

// PUT - Vincular/desvincular customizações de um produto
export async function PUT(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = params;
    const { groupIds } = await request.json(); // Array de IDs dos grupos

    // Verificar se o item pertence ao usuário
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        restaurant: {
          include: {
            user: true
          }
        }
      }
    });

    if (!menuItem || menuItem.restaurant.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Atualizar vínculos
    await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        customizationGroups: {
          set: groupIds.map((id: string) => ({ id }))
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error linking customizations:', error);
    return NextResponse.json(
      { error: 'Failed to link customizations' },
      { status: 500 }
    );
  }
}
