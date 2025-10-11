import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Atualiza um item do menu existente
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const {
      name,
      description,
      price,
      categoryId,
      image,
      isPromo,
      oldPrice,
      promoTag
    } = body;

    // Verifica se o item existe e pertence ao usuário
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        restaurant: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      );
    }

    if (existingItem.restaurant.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Atualiza o item
    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        image: image || null,
        isPromo: isPromo || false,
        originalPrice: oldPrice ? parseFloat(oldPrice) : null,
        promoTag: promoTag || null,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar item' },
      { status: 500 }
    );
  }
}

/**
 * Deleta um item do menu
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Verifica se o item existe e pertence ao usuário
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        restaurant: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item não encontrado' },
        { status: 404 }
      );
    }

    if (existingItem.restaurant.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Deleta o item
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar item' },
      { status: 500 }
    );
  }
}
