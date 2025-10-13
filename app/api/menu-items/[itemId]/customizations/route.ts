import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Buscar customizações de um produto (público - para o cliente)
export async function GET(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    console.log('🔍 [API] Fetching customizations for itemId:', itemId);

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
      console.log('❌ [API] Menu item not found:', itemId);
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    console.log('✅ [API] Found menu item:', menuItem.name);
    console.log('📦 [API] Customization groups:', menuItem.customizationGroups.length);
    console.log('📋 [API] Groups:', menuItem.customizationGroups.map(g => ({ id: g.id, name: g.name, options: g.options.length })));

    return NextResponse.json(menuItem.customizationGroups);
  } catch (error) {
    console.error('❌ [API] Error fetching menu item customizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customizations' },
      { status: 500 }
    );
  }
}
