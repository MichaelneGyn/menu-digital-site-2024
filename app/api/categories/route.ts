

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
    console.log('🔍 [CATEGORIES API] Iniciando criação de categoria');
    
    const supabaseClient = createServerSupabaseClient();
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    console.log('🔍 [CATEGORIES API] Session user email:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('❌ [CATEGORIES API] Usuário não autorizado - sem session');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🔍 [CATEGORIES API] Body recebido:', JSON.stringify(body, null, 2));
    
    const { name, icon, restaurantId } = createCategorySchema.parse(body);
    console.log('🔍 [CATEGORIES API] Dados parseados - name:', name, 'icon:', icon, 'restaurantId:', restaurantId);

    // Verificar se é admin (bypass de verificação)
    const adminEmails = [
      "michaeldouglasqueiroz@gmail.com",
      "admin@onpedido.com"
    ];
    
    const isAdmin = adminEmails.includes(session.user.email);
    console.log('🔍 [CATEGORIES API] É admin?', isAdmin, 'Email:', session.user.email);
    
    if (!isAdmin) {
      console.log('🔍 [CATEGORIES API] Não é admin, verificando permissões do usuário...');
      // Verificar se o usuário é dono do restaurante (apenas para não-admins)
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { restaurants: true }
      });
      
      console.log('🔍 [CATEGORIES API] Usuário encontrado:', user ? 'Sim' : 'Não');
      console.log('🔍 [CATEGORIES API] Restaurantes do usuário:', user?.restaurants?.map(r => r.id));

      if (!user || !user.restaurants || !user.restaurants.find((r: any) => r.id === restaurantId)) {
        console.log('❌ [CATEGORIES API] Usuário não autorizado para este restaurante');
        return NextResponse.json({ error: 'Não autorizado para este restaurante' }, { status: 403 });
      }
    } else {
      console.log('✅ [CATEGORIES API] Admin detectado, bypass de verificações');
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

    console.log('🔍 [CATEGORIES API] Tentando criar categoria no banco...');
    console.log('🔍 [CATEGORIES API] Dados para criação:', { name, icon, restaurant_id: restaurantId });
    
    const { data, error } = await supabaseClient
      .from("categories")
      .insert([{
        name,
        icon,
        restaurant_id: restaurantId
      }])
      .select()
      .single();

    if (error) {
      console.error("Erro Supabase:", error); // 👈 log no Vercel
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      );
    }
    
    console.log('✅ [CATEGORIES API] Categoria criada com sucesso:', data.id);
    return NextResponse.json(data, { status: 201 });
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

