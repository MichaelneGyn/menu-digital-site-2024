import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Listar grupos de customização do restaurante
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;

    const groups = await prisma.customizationGroup.findMany({
      where: { restaurantId },
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
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching customization groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customization groups' },
      { status: 500 }
    );
  }
}

// POST - Criar novo grupo de customização
export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { restaurantId } = params;
    const body = await request.json();

    // Verificar se o usuário é dono do restaurante
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        user: { email: session.user.email }
      }
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or unauthorized' },
        { status: 404 }
      );
    }

    const group = await prisma.customizationGroup.create({
      data: {
        name: body.name,
        description: body.description,
        isRequired: body.isRequired ?? false,
        minSelections: body.minSelections ?? 0,
        maxSelections: body.maxSelections,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
        restaurantId,
        options: body.options
          ? {
              create: body.options.map((opt: any, index: number) => ({
                name: opt.name,
                price: opt.price ?? 0,
                image: opt.image,
                isActive: opt.isActive ?? true,
                sortOrder: opt.sortOrder ?? index
              }))
            }
          : undefined
      },
      include: {
        options: true
      }
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating customization group:', error);
    return NextResponse.json(
      { error: 'Failed to create customization group' },
      { status: 500 }
    );
  }
}
