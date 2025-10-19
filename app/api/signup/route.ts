
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { onlyDigits, isValidWhatsapp } from '@/lib/phone';
import { authRateLimiter } from '@/lib/rate-limit';

const signUpSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  restaurantName: z.string().min(1, 'Nome do restaurante é obrigatório').optional(),
  whatsapp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = authRateLimiter(ip);
    
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const body = await request.json();
    
    const { name, email, password, restaurantName, whatsapp } = signUpSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and restaurant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Verificar quantos usuários já existem para definir período de trial
      const totalUsers = await tx.user.count();
      const PROMO_LIMIT = 50; // Primeiros 50 clientes
      
      // Se é um dos primeiros 50: 15 dias grátis, senão: 7 dias
      const trialDays = totalUsers <= PROMO_LIMIT ? 15 : 7;
      
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          status: 'TRIAL',
          plan: 'basic',
          amount: 0, // Trial gratuito
          trialEndsAt: trialEndsAt,
          currentPeriodEnd: trialEndsAt,
        },
      });

      let restaurant = null;
      
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
        while (await tx.restaurant.findUnique({ where: { slug: finalSlug } })) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }

        const wpp = onlyDigits(whatsapp);
        if (whatsapp && !isValidWhatsapp(wpp)) {
          throw new z.ZodError([
            {
              code: z.ZodIssueCode.custom,
              path: ['whatsapp'],
              message: 'WhatsApp inválido',
            },
          ]);
        }

        restaurant = await tx.restaurant.create({
          data: {
            name: restaurantName,
            slug: finalSlug,
            whatsapp: whatsapp ? wpp : null,
            userId: user.id,
          },
        });
      }

      return { user, restaurant, subscription };
    });

    return NextResponse.json(
      { 
        message: 'Conta criada com sucesso!',
        restaurantSlug: result.restaurant?.slug || null
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
