import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { authRateLimiter } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = authRateLimiter(ip);
    
    if (!rateLimitResult.success && rateLimitResult.response) {
      return rateLimitResult.response;
    }

    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Buscar usuário pelo token
    const user = await prisma.user.findUnique({
      where: { resetToken: token }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    // Verificar se o token não expirou
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Atualizar senha e limpar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json(
      { message: 'Senha redefinida com sucesso' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}