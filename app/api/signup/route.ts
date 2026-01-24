
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { onlyDigits, isValidWhatsapp } from '@/lib/phone';
import { authRateLimiter } from '@/lib/rate-limit';
import { notifyNewSignup } from '@/lib/notifications';
import { notifyNewSignupEmail } from '@/lib/email-notifications';

const signUpSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  restaurantName: z.string().min(3, 'Nome do restaurante é obrigatório (mínimo 3 caracteres)'),
  whatsapp: z.string().min(10, 'WhatsApp é obrigatório (mínimo 10 dígitos)'),
});

// SEM LIMITE DE USUÁRIOS - Cadastros ilimitados
const FOUNDER_LIMIT = 10;  // Primeiros 10 pagam R$ 69,90
const EARLY_LIMIT = 50;     // Usuários 11-50 pagam R$ 79,90
                            // Usuários 51+ pagam R$ 89,90

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = authRateLimiter(ip);
    
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // ✅ SEM LIMITE - Cadastros ilimitados
    
    // Contar usuários para definir pricing tier
    const totalUsers = await prisma.user.count();

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

      // Definir período de trial baseado no total de usuários
      const PROMO_LIMIT = 50; // 🔒 Primeiros 50 clientes ganham 30 dias
      
      // Se é um dos primeiros 50: 30 dias grátis, senão: 7 dias
      // totalUsers conta INCLUINDO o usuário recém-criado acima, então:
      // Se totalUsers = 1-50 (<=  50): este é o usuário 1-50 → 30 dias
      // Se totalUsers = 51+ (> 50): este é o usuário 51+ → 7 dias
      const trialDays = totalUsers <= PROMO_LIMIT ? 30 : 7;
      
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

    // 🔔 NOTIFICAR ADMIN SOBRE NOVO CADASTRO
    await notifyNewSignup(result.user.id, result.user.name || 'Sem nome', result.user.email);
    
    // 📧 ENVIAR EMAIL PARA ADMIN
    await notifyNewSignupEmail(
      result.user.name || 'Sem nome',
      result.user.email,
      whatsapp || null,
      result.restaurant?.name || null,
      result.restaurant?.slug || null
    );

    // Determinar qual tipo de cliente é (para pricing)
    const finalUserCount = totalUsers + 1; // +1 porque acabamos de criar
    const isFounder = finalUserCount <= FOUNDER_LIMIT;
    const isEarlyAdopter = finalUserCount > FOUNDER_LIMIT && finalUserCount <= EARLY_LIMIT;

    return NextResponse.json(
      { 
        message: 'Conta criada com sucesso!',
        restaurantSlug: result.restaurant?.slug || null,
        isFounder,
        isEarlyAdopter,
        spotNumber: finalUserCount,
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
