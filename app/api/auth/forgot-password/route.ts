import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { authRateLimiter } from '@/lib/rate-limit'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

function getBaseUrl(request: NextRequest) {
  const configuredUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '')
  }

  const origin = request.headers.get('origin')
  if (origin) {
    return origin.replace(/\/$/, '')
  }

  return 'http://localhost:3000'
}

async function sendResetPasswordEmail(email: string, resetUrl: string) {
  const subject = 'Recuperação de Senha - Virtual Cardápio'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #d32f2f; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Virtual Cardápio</h1>
      </div>
      <div style="padding: 20px; background-color: #f5f5f5;">
        <h2 style="color: #333;">Recuperação de Senha</h2>
        <p>Você solicitou a recuperação de sua senha. Clique no botão abaixo para redefinir sua senha:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Este link expira em 1 hora. Se você não solicitou esta recuperação, ignore este email.
        </p>
        <p style="color: #666; font-size: 14px;">
          Se o botão não funcionar, copie e cole este link no seu navegador:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
      </div>
    </div>
  `

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const smtpPort = Number(process.env.SMTP_PORT || '587')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html
    })
    return
  }

  if (resend) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || 'Virtual Cardápio <onboarding@resend.dev>',
      to: email,
      subject,
      html
    })
    return
  }

  throw new Error('Serviço de email não configurado')
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = authRateLimiter(ip)
    
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response
    }

    const { email } = await request.json()
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const hasEmailProvider = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS) || Boolean(resend)
    if (!hasEmailProvider) {
      console.error('Serviço de email indisponível: configure SMTP_* ou RESEND_API_KEY')
      return NextResponse.json(
        { error: 'Serviço de email indisponível. Tente novamente em instantes.' },
        { status: 503 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: 'insensitive'
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Se o email existir, você receberá instruções de recuperação' },
        { status: 200 }
      )
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    const resetUrl = `${getBaseUrl(request)}/auth/reset-password?token=${resetToken}`
    await sendResetPasswordEmail(user.email, resetUrl)

    return NextResponse.json(
      { message: 'Se o email existir, você receberá instruções de recuperação' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao processar recuperação de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
