import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { onlyDigits, isValidWhatsapp } from '@/lib/phone';
import { authRateLimiter } from '@/lib/rate-limit';
import {
  isBlockedEmailDomain,
  normalizeEmail,
  sendEmailVerificationEmail,
  SIGNUP_TRIAL_DAYS,
} from '@/lib/email-verification';

const signUpSchema = z.object({
  name: z.string().min(2, 'Nome e obrigatorio'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  restaurantName: z.string().min(2, 'Nome do restaurante e obrigatorio'),
  whatsapp: z.string().min(10, 'WhatsApp e obrigatorio (minimo 10 digitos)'),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = authRateLimiter(ip);

    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const body = await request.json();
    const parsed = signUpSchema.parse(body);

    const email = normalizeEmail(parsed.email);
    const name = parsed.name.trim();
    const restaurantName = parsed.restaurantName.trim();
    const whatsappDigits = onlyDigits(parsed.whatsapp);

    if (!isValidWhatsapp(whatsappDigits)) {
      return NextResponse.json({ error: 'WhatsApp invalido' }, { status: 400 });
    }

    if (isBlockedEmailDomain(email)) {
      return NextResponse.json(
        { error: 'Use um email pessoal ou corporativo valido (Gmail, Outlook, dominio proprio, etc).' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (!existingUser.emailVerified) {
        const resendResult = await sendEmailVerificationEmail({
          email: existingUser.email,
          name: existingUser.name,
          baseUrl: request.nextUrl.origin,
        });

        return NextResponse.json(
          {
            created: false,
            pendingVerification: true,
            verificationEmailSent: resendResult.sent,
            message: resendResult.sent
              ? 'Ja existe um cadastro pendente com este email. Reenviamos o link de verificacao.'
              : 'Ja existe um cadastro pendente com este email. O envio do link falhou agora, tente reenviar na tela de login.',
          },
          { status: 200 }
        );
      }

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
      trialEndsAt.setDate(trialEndsAt.getDate() + SIGNUP_TRIAL_DAYS);

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

    const verificationResult = await sendEmailVerificationEmail({
      email: result.user.email,
      name: result.user.name,
      baseUrl: request.nextUrl.origin,
    });

    return NextResponse.json(
      {
        created: true,
        pendingVerification: true,
        verificationEmailSent: verificationResult.sent,
        message: verificationResult.sent
          ? 'Conta criada. Confirme seu email para liberar o acesso.'
          : 'Conta criada, mas nao conseguimos enviar o email agora. Use a opcao de reenviar na tela de login.',
        restaurantSlug: result.restaurant?.slug || null,
        trialDays: SIGNUP_TRIAL_DAYS,
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
