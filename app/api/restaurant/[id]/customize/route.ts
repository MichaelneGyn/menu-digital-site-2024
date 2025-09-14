import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const customizeRestaurantSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logo: z.string().optional(),
  bannerImage: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  theme: z.string().optional(),
  showDeliveryTime: z.boolean().optional(),
  showRatings: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleCustomization(request, { params });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleCustomization(request, { params });
}

async function handleCustomization(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Criar cliente Supabase com contexto da requisição
    const supabaseClient = createSupabaseClient();
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const customizationData = customizeRestaurantSchema.parse(body);

    // Verificar se o usuário é dono do restaurante
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants || !user.restaurants.find((r: any) => r.id === id)) {
      return NextResponse.json({ error: 'Não autorizado para este restaurante' }, { status: 403 });
    }

    // Atualizar as configurações de personalização do restaurante
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        primaryColor: customizationData.primaryColor,
        secondaryColor: customizationData.secondaryColor,
        logo: customizationData.logo || customizationData.logoUrl,
        bannerImage: customizationData.bannerImage || customizationData.bannerUrl,
        theme: customizationData.theme,
        showDeliveryTime: customizationData.showDeliveryTime,
        showRatings: customizationData.showRatings,
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

    return NextResponse.json(updatedRestaurant);
  } catch (error) {
    console.error('Erro ao personalizar restaurante:', error);
    
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