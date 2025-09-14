

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabase } from '@/lib/auth';
import { z } from 'zod';

const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET() {
  try {
    // Usando cliente Supabase global
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        restaurants: {
          include: {
            categories: {
              include: {
                menuItems: true
              }
            },
            menuItems: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!user || !user.restaurants || user.restaurants.length === 0) {
      return NextResponse.json(null);
    }

    // Return the first (should be only) restaurant
    return NextResponse.json(user.restaurants[0]);
  } catch (error) {
    console.error('Erro ao buscar restaurante:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do restaurante é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants?.find((r: any) => r.id === id)) {
      return NextResponse.json({ error: 'Não autorizado para este restaurante' }, { status: 403 });
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: updateData,
      include: {
        categories: {
          include: {
            menuItems: true
          }
        },
        menuItems: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(updatedRestaurant);
  } catch (error) {
    console.error('Erro ao atualizar restaurante:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, address } = createRestaurantSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se já tem restaurante
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: { userId: user.id }
    });

    if (existingRestaurant) {
      return NextResponse.json({ error: 'Usuário já possui um restaurante' }, { status: 400 });
    }

    // Create slug from restaurant name
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-'); // Replace spaces with hyphens

    // Ensure unique slug
    let finalSlug = slug;
    let counter = 1;
    while (await prisma.restaurant.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug: finalSlug,
        phone,
        address,
        userId: user.id,
      },
      include: {
        categories: {
          include: {
            menuItems: true
          }
        },
        menuItems: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar restaurante:', error);
    
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

