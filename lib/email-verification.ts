import crypto from 'crypto';
import { Resend } from 'resend';
import { prisma } from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
export const SIGNUP_TRIAL_DAYS = 30;

export const BLOCKED_EMAIL_DOMAINS = [
  '10minutemail.com',
  'dispostable.com',
  'getnada.com',
  'grr.la',
  'guerrillamail.com',
  'mailinator.com',
  'mailnesia.com',
  'sharklasers.com',
  'tempmail.com',
  'throwawaymail.com',
  'yopmail.com',
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export function getEmailDomain(email: string) {
  return normalizeEmail(email).split('@')[1] || '';
}

export function isBlockedEmailDomain(email: string) {
  return BLOCKED_EMAIL_DOMAINS.includes(getEmailDomain(email));
}

export function getEmailVerificationIdentifier(email: string) {
  return `verify-email:${normalizeEmail(email)}`;
}

export function getEmailFromVerificationIdentifier(identifier: string) {
  return identifier.startsWith('verify-email:') ? identifier.slice('verify-email:'.length) : null;
}

export function getBaseUrl(origin?: string) {
  return process.env.NEXTAUTH_URL || origin || 'http://localhost:3001';
}

export async function createEmailVerificationToken(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const identifier = getEmailVerificationIdentifier(normalizedEmail);
  const token = crypto.randomBytes(32).toString('hex');

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    },
  });

  return token;
}

export async function sendEmailVerificationEmail({
  email,
  name,
  baseUrl,
}: {
  email: string;
  name?: string | null;
  baseUrl: string;
}) {
  const token = await createEmailVerificationToken(email);
  const verificationUrl = `${getBaseUrl(baseUrl)}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const safeName = escapeHtml((name || 'Parceiro').trim());

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY nao configurada. Link de verificacao:', verificationUrl);
    return { sent: false, verificationUrl };
  }

  try {
    await resend.emails.send({
      from: 'Menu Digital <nao-responda@virtualcardapio.com.br>',
      to: normalizeEmail(email),
      subject: 'Confirme seu email no Menu Digital',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #ff6b35; margin-bottom: 16px;">Ola, ${safeName}!</h1>
          <p style="font-size: 16px; color: #333;">
            Falta um passo para ativar sua conta no Menu Digital e liberar seu acesso.
          </p>
          <div style="margin: 32px 0; text-align: center;">
            <a
              href="${verificationUrl}"
              style="display: inline-block; background-color: #ff6b35; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;"
            >
              Confirmar meu email
            </a>
          </div>
          <p style="font-size: 14px; color: #666;">
            Se o botao nao funcionar, copie e cole este link no navegador:
          </p>
          <p style="font-size: 14px; word-break: break-all;">
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 24px;">
            Se voce nao solicitou esse cadastro, ignore este email.
          </p>
        </div>
      `,
    });

    return { sent: true, verificationUrl };
  } catch (error) {
    console.error('Erro ao enviar email de verificacao:', error);
    return { sent: false, verificationUrl };
  }
}

export async function sendWelcomeEmail({
  email,
  name,
  baseUrl,
}: {
  email: string;
  name?: string | null;
  baseUrl: string;
}) {
  const loginUrl = `${getBaseUrl(baseUrl)}/auth/login`;
  const safeName = escapeHtml((name || 'Parceiro').trim());

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY nao configurada. Email de boas-vindas nao enviado para:', email);
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Menu Digital <nao-responda@virtualcardapio.com.br>',
      to: normalizeEmail(email),
      subject: 'Bem-vindo ao Menu Digital!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #ff6b35; text-align: center;">Ola, ${safeName}!</h1>
          <p style="font-size: 16px; color: #333; text-align: center;">
            Seu email foi confirmado e sua conta esta pronta para uso.
          </p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 24px 0; text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #555;">Seu acesso:</p>
            <a
              href="${loginUrl}"
              style="display: inline-block; background-color: #ff6b35; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 12px;"
            >
              Acessar painel
            </a>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center;">
            Seu trial de ${SIGNUP_TRIAL_DAYS} dias comeca agora.
          </p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    return false;
  }
}
