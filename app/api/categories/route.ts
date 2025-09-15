

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  restaurantId: z.string().min(1, 'Restaurante é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = createServerSupabaseClient();
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, restaurantId } = createCategorySchema.parse(body);

    // Verificar se o usuário é dono do restaurante
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants || !user.restaurants.find((r: any) => r.id === restaurantId)) {
      return NextResponse.json({ error: 'Não autorizado para este restaurante' }, { status: 403 });
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        restaurantId
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: `Já existe uma categoria com o nome "${name}" neste restaurante` },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon,
        restaurantId
      },
      include: {
        menuItems: true
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Verificar se é erro de constraint única do Prisma
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com este nome neste restaurante' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

