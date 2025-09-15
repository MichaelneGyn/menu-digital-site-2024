

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const createRestaurantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  deliveryFee: z.number().optional(),
  minOrderValue: z.number().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  workingDays: z.string().optional(),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
});




export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}



export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('Dados recebidos para criação do restaurante:', body);
    
    // Validar dados com Zod
    const validatedData = createRestaurantSchema.parse(body);
    
    // Verificar se o slug já existe
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();
    
    if (existingRestaurant) {
      return NextResponse.json(
        { error: 'Esta URL já está sendo usada por outro restaurante' },
        { status: 400 }
      );
    }
    
    // Criar o restaurante no banco de dados
    const { data, error } = await supabase
      .from('restaurants')
      .insert([{
        name: validatedData.name,
        slug: validatedData.slug,
        phone: validatedData.phone,
        whatsapp: validatedData.whatsapp,
        address: validatedData.address,
        owner_id: user.id
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erro do Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    console.log('Restaurante criado com sucesso:', data);
    return NextResponse.json(data, { status: 201 });
    
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

