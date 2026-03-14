import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { onlyDigits, isValidWhatsapp } from '@/lib/phone';
import { authRateLimiter } from '@/lib/rate-limit';
import { notifyNewSignup } from '@/lib/notifications';
import { notifyNewSignupEmail } from '@/lib/email-notifications';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const signUpSchema = z.object({
  name: z.string().min(2, 'Nome e obrigatorio'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  restaurantName: z.string().min(2, 'Nome do restaurante e obrigatorio'),
  whatsapp: z.string().min(10, 'WhatsApp e obrigatorio (minimo 10 digitos)'),
});

const TRIAL_DAYS = 30;

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = authRateLimiter(ip);

    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const body = await request.json();
    const parsed = signUpSchema.parse(body);

    const email = parsed.email.toLowerCase().trim();
    const name = parsed.name.trim();
    const restaurantName = parsed.restaurantName.trim();
    const whatsappDigits = onlyDigits(parsed.whatsapp);

    if (!isValidWhatsapp(whatsappDigits)) {
      return NextResponse.json({ error: 'WhatsApp invalido' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Usuario ja existe com este email' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          status: 'TRIAL',
          plan: 'pro',
          amount: 0,
          trialEndsAt,
          currentPeriodEnd: trialEndsAt,
        },
      });

      const baseSlug = restaurantName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      let finalSlug = baseSlug || `restaurante-${Date.now()}`;
      let counter = 1;
      while (await tx.restaurant.findUnique({ where: { slug: finalSlug } })) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          slug: finalSlug,
          whatsapp: whatsappDigits,
          userId: user.id,
        },
      });

      return { user, restaurant, subscription };
    });

    await notifyNewSignup(result.user.id, result.user.name || 'Sem nome', result.user.email);

    await notifyNewSignupEmail(
      result.user.name || 'Sem nome',
      result.user.email,
      whatsappDigits,
      result.restaurant?.name || null,
      result.restaurant?.slug || null
    );

    try {
      await resend.emails.send({
        from: 'Menu Digital <nao-responda@virtualcardapio.com.br>',
        to: result.user.email,
        subject: 'Bem-vindo ao Menu Digital!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ff6b35; text-align: center;">Ola, ${result.user.name || 'Parceiro'}!</h1>
            <p style="font-size: 16px; color: #333; text-align: center;">Sua conta foi criada com sucesso.</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-weight: bold; color: #555;">Seu acesso:</p>
              <a href="https://virtualcardapio.com.br/auth/login" style="display: inline-block; background-color: #ff6b35; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;">
                Acessar Painel
              </a>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center;">
              Voce ganhou ${TRIAL_DAYS} dias de teste gratis.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de boas-vindas:', emailError);
    }

    return NextResponse.json(
      {
        message: 'Conta criada com sucesso!',
        restaurantSlug: result.restaurant?.slug || null,
        trialDays: TRIAL_DAYS,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Dados invalidos' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}