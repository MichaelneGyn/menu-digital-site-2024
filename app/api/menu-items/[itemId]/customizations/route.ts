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

    // Primeiro, verificar se o item existe
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        name: true,
        restaurantId: true,
      }
    });

    if (!menuItem) {
      console.log('❌ [API] Menu item not found:', itemId);
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    console.log('✅ [API] Found menu item:', menuItem.name, '| Restaurant:', menuItem.restaurantId);

    // Buscar item completo com customizações
    const itemWithCustomizations = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        customizationGroups: {
          where: {
            isActive: true,
            restaurantId: menuItem.restaurantId, // Garante mesmo restaurante
          },
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

    const customizationGroups = itemWithCustomizations?.customizationGroups || [];

    console.log('📦 [API] Customization groups:', customizationGroups.length);
    console.log('📋 [API] Groups:', customizationGroups.map(g => ({ 
      id: g.id, 
      name: g.name, 
      options: g.options.length,
      restaurantId: g.restaurantId 
    })));

    return NextResponse.json(customizationGroups);
  } catch (error) {
    console.error('❌ [API] Error fetching menu item customizations:', error);
    console.error('❌ [API] Stack:', error instanceof Error ? error.stack : 'No stack');
    const prismaError = error as { code?: string; meta?: unknown } | undefined;
    
    // Log completo do erro
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: prismaError?.code,
      meta: prismaError?.meta,
    };
    
    console.error('❌ [API] Error details:', JSON.stringify(errorDetails, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch customizations',
        details: errorDetails.message,
        itemId: params.itemId
      },
      { status: 500 }
    );
  }
}
