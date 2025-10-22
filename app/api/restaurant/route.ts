

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { onlyDigits, isValidWhatsapp } from '@/lib/phone';

const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
});

export async function GET() {
  try {
    let session: any = null;
    try {
      session = await getServerSession(authOptions);
    } catch (e) {
      console.error('getServerSession (restaurant) failed:', e);
      session = null;
    }

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id, 
      name, 
      description,
      logo,
      primaryColor,
      secondaryColor,
      email,
      whatsapp, 
      address, 
      openTime, 
      closeTime, 
      workingDays, 
      pixKey, 
      pixQrCode 
    } = body;

    console.log('📥 API Restaurant PUT - Dados recebidos:', {
      id,
      name,
      logo: logo || 'VAZIO',
      logoLength: logo?.length || 0
    });

    if (!id) {
      return NextResponse.json({ error: 'ID do restaurante é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants?.find(r => r.id === id)) {
      return NextResponse.json({ error: 'Não autorizado para este restaurante' }, { status: 403 });
    }

    const wpp = onlyDigits(whatsapp);
    if (whatsapp && !isValidWhatsapp(wpp)) {
      return NextResponse.json({ error: 'WhatsApp inválido' }, { status: 400 });
    }

    // Buscar restaurante atual para comparar slug
    const current = await prisma.restaurant.findUnique({ where: { id } });

    // Recalcular slug apenas se o nome mudar e gerar um novo slug "bonito"
    let slugToUse = current?.slug || undefined;
    if (name && current && name.trim().length > 0) {
      const baseSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      // Só atualiza se o slug calculado for diferente do atual
      if (baseSlug && baseSlug !== current.slug) {
        let finalSlug = baseSlug;
        let counter = 1;
        // Garantir unicidade: se slug existir e não for deste restaurante, incrementa sufixo
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const existing = await prisma.restaurant.findUnique({ where: { slug: finalSlug } });
          if (!existing || existing.id === id) break;
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        slugToUse = finalSlug;
      }
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name,
        description: description || null,
        logo: logo || null,
        logoUrl: logo || null, // Atualizar ambos os campos por compatibilidade
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined,
        email: email || null,
        slug: slugToUse,
        whatsapp: whatsapp ? wpp : null,
        address,
        openTime: openTime || null,
        closeTime: closeTime || null,
        workingDays: workingDays || null,
        pixKey: pixKey || null,
        pixQrCode: pixQrCode || null,
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

    console.log('✅ API Restaurant PUT - Restaurante atualizado:', {
      id: updatedRestaurant.id,
      name: updatedRestaurant.name,
      logo: updatedRestaurant.logo || 'NULL',
      logoUrl: updatedRestaurant.logoUrl || 'NULL'
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { name, whatsapp, address } = createRestaurantSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email }
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

    const wpp = onlyDigits(whatsapp);
    if (whatsapp && !isValidWhatsapp(wpp)) {
      return NextResponse.json({ error: 'WhatsApp inválido' }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        slug: finalSlug,
        whatsapp: whatsapp ? wpp : null,
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

