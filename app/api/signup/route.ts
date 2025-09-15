
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const signUpSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  restaurantName: z.string().min(1, 'Nome do restaurante é obrigatório').optional(),
  phone: z.string().optional(),
  fingerprint: z.string().optional(), // Para controle anti-burla
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const body = await request.json();
    console.log('Received signup data:', body);
    
    const { name, email, password, restaurantName, phone, fingerprint, userAgent, ipAddress } = signUpSchema.parse(body);

    // Verificar anti-burla se fingerprint foi fornecido
    if (fingerprint) {
      const { data: fingerprintCheck } = await supabase
        .rpc('check_fingerprint_usage', { fingerprint });

      if (fingerprintCheck) {
        return NextResponse.json({ 
          error: "Este dispositivo já foi usado para criar uma conta gratuita recentemente. Considere fazer upgrade para o plano pago." 
        }, { status: 403 });
      }
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          full_name: name
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 400 }
      );
    }

    let restaurantSlug = null;

    // Criar restaurante se fornecido
    if (restaurantName) {
      // Create slug from restaurant name
      const slug = restaurantName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .trim()
        .replace(/\s+/g, '-'); // Replace spaces with hyphens

      // Ensure unique slug
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const { data: existingRestaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('slug', finalSlug)
          .single();
        
        if (!existingRestaurant) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert([{
          name: restaurantName,
          slug: finalSlug,
          phone,
          owner_id: authData.user.id,
        }])
        .select()
        .single();

      if (restaurantError) {
        console.error('Restaurant creation error:', restaurantError);
      } else {
        restaurantSlug = restaurant.slug;
      }
    }

    // Criar assinatura free automaticamente
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 3); // 3 dias free

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: authData.user.id,
        plan: 'free',
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString()
      }]);

    if (subscriptionError) {
      console.error('Subscription creation error:', subscriptionError);
    }

    // Salvar fingerprint se fornecido
    if (fingerprint) {
      await supabase
        .from('device_fingerprints')
        .insert([{
          user_id: authData.user.id,
          fingerprint_hash: fingerprint,
          ip_address: ipAddress,
          user_agent: userAgent
        }]);
    }

    return NextResponse.json(
      { 
        message: 'Conta criada com sucesso! Você tem 3 dias de teste gratuito.',
        restaurantSlug,
        user: authData.user,
        session: authData.session
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    
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
