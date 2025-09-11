

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  restaurantId: z.string().min(1, 'Restaurante é obrigatório'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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

    if (!user || !user.restaurants || !user.restaurants.find(r => r.id === restaurantId)) {
      return NextResponse.json({ error: 'Não autorizado para este restaurante' }, { status: 403 });
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

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

