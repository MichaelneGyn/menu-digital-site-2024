import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { authRateLimiter } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = authRateLimiter(ip);
    
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Por segurança, retornamos sucesso mesmo se o email não existir
      return NextResponse.json(
        { message: 'Se o email existir, você receberá instruções de recuperação' },
        { status: 200 }
      )
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    // Salvar token no banco
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Configurar transporter do email (usando variáveis de ambiente)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    // URL de reset
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // Conteúdo do email
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Recuperação de Senha - OnPedido',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #d32f2f; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">OnPedido</h1>
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
    }

    // Enviar email apenas se as configurações SMTP estiverem disponíveis
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions)
    } else {
      // SMTP não configurado - em desenvolvimento, o link será exibido no console do servidor
      if (process.env.NODE_ENV !== 'production') {
        console.log('SMTP não configurado. Link de reset:', resetUrl)
      }
    }

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