import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authRateLimiter } from '@/lib/rate-limit';
import { isBlockedEmailDomain, normalizeEmail, sendEmailVerificationEmail } from '@/lib/email-verification';

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = authRateLimiter(ip);

    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const body = await request.json();
    const email = normalizeEmail(body?.email || '');

    if (!email) {
      return NextResponse.json({ error: 'Email e obrigatorio' }, { status: 400 });
    }

    if (isBlockedEmailDomain(email)) {
      return NextResponse.json(
        { error: 'Use um email pessoal ou corporativo valido.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.emailVerified) {
      return NextResponse.json(
        { message: 'Se o email existir e ainda nao estiver verificado, enviamos um novo link.' },
        { status: 200 }
      );
    }

    const result = await sendEmailVerificationEmail({
      email: user.email,
      name: user.name,
      baseUrl: request.nextUrl.origin,
    });

    return NextResponse.json(
      {
        message: result.sent
          ? 'Novo link de verificacao enviado.'
          : 'Conta pendente encontrada, mas o envio falhou agora. Tente novamente em instantes.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
