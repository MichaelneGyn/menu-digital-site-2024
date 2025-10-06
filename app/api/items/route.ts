

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.number().positive('Preço deve ser maior que zero'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  restaurantId: z.string().min(1, 'Restaurante é obrigatório'),
  image: z.string().min(1, 'Imagem é obrigatória'),
  isPromo: z.boolean().optional(),
  oldPrice: z.number().positive().optional(),
});

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json({ error: 'ID do item é obrigatório' }, { status: 400 });
    }

    // Verificar se o item existe e pertence ao usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: { restaurant: true }
    });

    if (!item || !user?.restaurants?.find(r => r.id === item.restaurantId)) {
      return NextResponse.json({ error: 'Item não encontrado ou sem permissão' }, { status: 404 });
    }

    await prisma.menuItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true, message: 'Item removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, categoryId, restaurantId, image, isPromo, oldPrice } = createItemSchema.parse(body);

    // Verificar se o usuário é dono do restaurante
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants || !user.restaurants.find(r => r.id === restaurantId)) {
      return NextResponse.json({ error: 'Não autorizado para este restaurante' }, { status: 403 });
    }

    // Verificar se a categoria existe e pertence ao restaurante
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId: restaurantId
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        categoryId,
        restaurantId,
        image,
        isPromo: isPromo || false,
        originalPrice: oldPrice
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

