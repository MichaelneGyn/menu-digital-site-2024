
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

// LIMITE DE USUÁRIOS (Ajustável conforme upgrade do servidor)
// Comece com 10, depois aumente para 20, 50, 100, etc.
const USER_LIMIT = 10; // 🔧 AJUSTE ESTE VALOR QUANDO FIZER UPGRADE DO SERVIDOR

const FOUNDER_LIMIT = 10;  // Primeiros 10 pagam R$ 69,90
const EARLY_LIMIT = 50;     // Usuários 11-50 pagam R$ 79,90
                            // Usuários 51+ pagam R$ 89,90

// Função para enviar notificação quando chegar perto do limite
async function sendLimitNotification(count: number, limit: number) {
  try {
    console.log(`\n🚨 ═══════════════════════════════════════`);
    console.log(`🚨 ALERTA DE LIMITE: ${count}/${limit} usuários cadastrados!`);
    console.log(`🚨 ═══════════════════════════════════════\n`);
    
    // Avisos específicos
    if (count === limit - 1) {
      console.log(`⚠️  ATENÇÃO: ÚLTIMA VAGA DISPONÍVEL!`);
      console.log(`⚠️  Próximo cadastro atingirá o limite do servidor.`);
    } else if (count === limit) {
      console.log(`🔴 LIMITE ATINGIDO!`);
      console.log(`🔴 Novos cadastros estão bloqueados.`);
      console.log(`🔴 Faça upgrade do servidor e ajuste USER_LIMIT em /app/api/signup/route.ts`);
    }
    console.log(`\n═══════════════════════════════════════\n`);
    
    // TODO: Enviar email/WhatsApp para o admin quando implementar
    // await sendEmail({ to: 'admin@email.com', subject: 'Limite de usuários' });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = authRateLimiter(ip);
    
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    // 🔒 VERIFICAR LIMITE DE USUÁRIOS NO SERVIDOR
    const totalUsers = await prisma.user.count();

    // Notificar quando estiver perto do limite
    if (totalUsers === USER_LIMIT - 1 || totalUsers === USER_LIMIT) {
      await sendLimitNotification(totalUsers, USER_LIMIT);
    }

    // Bloquear novos cadastros se atingiu o limite
    if (totalUsers >= USER_LIMIT) {
      console.log(`🚫 CADASTRO BLOQUEADO: ${totalUsers}/${USER_LIMIT} usuários no servidor`);
      return NextResponse.json(
        { 
          error: 'Limite de usuários atingido! Estamos preparando mais vagas. Por favor, tente novamente em breve ou entre em contato.',
          limitReached: true,
        },
        { status: 403 }
      );
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
      const PROMO_LIMIT = 10; // 🔒 Primeiros 10 clientes (alinhado com USER_LIMIT)
      
      // Se é um dos primeiros 10: 15 dias grátis, senão: 7 dias
      // totalUsers conta INCLUINDO o usuário recém-criado acima, então:
      // Se totalUsers = 1-10 (<=  10): este é o usuário 1-10 → 15 dias
      // Se totalUsers = 11+ (> 10): este é o usuário 11+ → 7 dias
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
