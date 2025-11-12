import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET: Buscar personalização de uma categoria
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId é obrigatório' }, { status: 400 });
    }

    // Buscar restaurante do usuário usando Prisma
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants || user.restaurants.length === 0) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const restaurant = user.restaurants[0];

    // Buscar configuração de personalização usando Prisma
    // @ts-ignore - Tabelas serão criadas em breve
    const customization = await prisma.categoryCustomization.findUnique({
      where: {
        categoryId_restaurantId: {
          categoryId: categoryId,
          restaurantId: restaurant.id
        }
      },
      include: {
        sizes: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        },
        flavors: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        },
        extras: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    if (!customization) {
      return NextResponse.json({
        customization: null,
        sizes: [],
        flavors: [],
        extras: []
      });
    }

    return NextResponse.json({
      customization: {
        id: customization.id,
        is_customizable: customization.isCustomizable,
        has_sizes: customization.hasSizes,
        has_flavors: customization.hasFlavors,
        has_extras: customization.hasExtras,
        max_flavors: customization.maxFlavors,
        flavors_required: customization.flavorsRequired
      },
      sizes: customization.sizes.map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price_multiplier: s.priceMultiplier,
        display_order: s.displayOrder
      })),
      flavors: customization.flavors.map((f: any) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        price: f.price,
        display_order: f.displayOrder
      })),
      extras: customization.extras.map((e: any) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        price: e.price,
        display_order: e.displayOrder
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar personalização:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST: Criar/Atualizar personalização de uma categoria
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, isCustomizable, hasSizes, hasFlavors, hasExtras, maxFlavors, flavorsRequired } = body;

    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId é obrigatório' }, { status: 400 });
    }

    // Buscar restaurante do usuário usando Prisma
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants || user.restaurants.length === 0) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const restaurant = user.restaurants[0];

    // Criar ou atualizar usando Prisma upsert
    // @ts-ignore - Tabelas serão criadas em breve
    const customization = await prisma.categoryCustomization.upsert({
      where: {
        categoryId_restaurantId: {
          categoryId: categoryId,
          restaurantId: restaurant.id
        }
      },
      update: {
        isCustomizable: isCustomizable,
        hasSizes: hasSizes,
        hasFlavors: hasFlavors,
        hasExtras: hasExtras,
        maxFlavors: maxFlavors,
        flavorsRequired: flavorsRequired
      },
      create: {
        categoryId: categoryId,
        restaurantId: restaurant.id,
        isCustomizable: isCustomizable,
        hasSizes: hasSizes,
        hasFlavors: hasFlavors,
        hasExtras: hasExtras,
        maxFlavors: maxFlavors,
        flavorsRequired: flavorsRequired
      }
    });

    return NextResponse.json({ success: true, customizationId: customization.id });

  } catch (error) {
    console.error('Erro ao salvar personalização:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
