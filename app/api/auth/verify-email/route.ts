import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyNewSignup } from '@/lib/notifications';
import { notifyNewSignupEmail } from '@/lib/email-notifications';
import {
  getBaseUrl,
  getEmailFromVerificationIdentifier,
  SIGNUP_TRIAL_DAYS,
  sendWelcomeEmail,
} from '@/lib/email-verification';

function redirectToLogin(request: NextRequest, status: string) {
  const url = new URL(`/auth/login?verified=${status}`, getBaseUrl(request.nextUrl.origin));
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return redirectToLogin(request, 'invalid');
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return redirectToLogin(request, 'invalid');
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { token },
    }).catch(() => null);

    return redirectToLogin(request, 'expired');
  }

  const email = getEmailFromVerificationIdentifier(verificationToken.identifier);

  if (!email) {
    await prisma.verificationToken.delete({
      where: { token },
    }).catch(() => null);

    return redirectToLogin(request, 'invalid');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      restaurants: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) {
    await prisma.verificationToken.delete({
      where: { token },
    }).catch(() => null);

    return redirectToLogin(request, 'invalid');
  }

  if (!user.emailVerified) {
    const now = new Date();
    const trialEndsAt = new Date(now);
    trialEndsAt.setDate(trialEndsAt.getDate() + SIGNUP_TRIAL_DAYS);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { emailVerified: now },
      });

      if (user.subscriptions[0]?.status === 'TRIAL') {
        await tx.subscription.update({
          where: { id: user.subscriptions[0].id },
          data: {
            currentPeriodStart: now,
            currentPeriodEnd: trialEndsAt,
            trialEndsAt,
          },
        });
      }

      await tx.verificationToken.deleteMany({
        where: { identifier: verificationToken.identifier },
      });
    });

    const restaurant = user.restaurants[0] || null;

    await notifyNewSignup(user.id, user.name || 'Sem nome', user.email);

    await notifyNewSignupEmail(
      user.name || 'Sem nome',
      user.email,
      restaurant?.whatsapp || null,
      restaurant?.name || null,
      restaurant?.slug || null
    );

    await sendWelcomeEmail({
      email: user.email,
      name: user.name,
      baseUrl: request.nextUrl.origin,
    });

    return redirectToLogin(request, 'success');
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: verificationToken.identifier },
  });

  return redirectToLogin(request, 'already');
}
