

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/auth';
import { z } from 'zod';

const createItemSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional().default(''),
  price: z.union([z.number(), z.string()]).transform((val) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) : val;
    if (isNaN(num) || num <= 0) throw new Error('Preço deve ser maior que zero');
    return num;
  }),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  restaurantId: z.string().min(1, 'Restaurante é obrigatório'),
  image: z.string().optional().default(''),
  isPromo: z.boolean().optional(),
  promoPrice: z.union([z.number(), z.string(), z.null()]).transform((val) => {
    if (!val || val === null || val === '' || val === 0) return null;
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) : val;
    if (isNaN(num) || num <= 0) return null;
    return num;
  }).optional(),
  originalPrice: z.union([z.number(), z.string(), z.null()]).transform((val) => {
    if (!val || val === null || val === '' || val === 0) return null;
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.')) : val;
    if (isNaN(num) || num <= 0) return null;
    return num;
  }).optional(),
});

export async function DELETE(request: NextRequest) {
  try {
    // Usando cliente Supabase global
    const { data: { session } } = await supabase.auth.getSession();
    
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

    if (!item || !user?.restaurants?.find((r: any) => r.id === item.restaurantId)) {
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
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, categoryId, restaurantId, image, isPromo, promoPrice, originalPrice } = createItemSchema.parse(body);

    // Verificar se o usuário é dono do restaurante
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants || !user.restaurants.find((r: any) => r.id === restaurantId)) {
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
        price: isPromo && promoPrice ? promoPrice : price,
        categoryId,
        restaurantId,
        image,
        isPromo: isPromo || false,
        originalPrice: isPromo ? originalPrice : null
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

