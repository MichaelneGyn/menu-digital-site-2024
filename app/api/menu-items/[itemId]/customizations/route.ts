import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Buscar customizações de um produto (público - para o cliente)
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
          where: { isActive: true },
          include: {
            options: {
              where: { isActive: true },
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
    console.error('Error fetching menu item customizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customizations' },
      { status: 500 }
    );
  }
}
