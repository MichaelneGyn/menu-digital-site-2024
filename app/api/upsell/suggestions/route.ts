import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Buscar sugestões de upsell (rota pública para clientes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const location = searchParams.get('location') || 'checkout';

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId é obrigatório' }, { status: 400 });
    }

    // Buscar regra ativa de maior prioridade
    const rule = await prisma.upsellRule.findFirst({
      where: {
        restaurantId,
        active: true,
        OR: [
          { displayLocation: location },
          { displayLocation: 'both' },
        ],
      },
      orderBy: { priority: 'desc' },
    });

    if (!rule) {
      return NextResponse.json({ suggestions: [] });
    }

    // Buscar produtos sugeridos
    const products = await prisma.menuItem.findMany({
      where: {
        id: { in: rule.productIds },
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      rule: {
        id: rule.id,
        title: rule.title || 'Complete seu pedido!',
        subtitle: rule.subtitle || 'Clientes também levaram:',
        productDiscounts: rule.productDiscounts || '{}',
      },
      products,
    });
  } catch (error) {
    console.error('Erro ao buscar sugestões de upsell:', error);
    return NextResponse.json({ error: 'Erro ao buscar sugestões' }, { status: 500 });
  }
}
