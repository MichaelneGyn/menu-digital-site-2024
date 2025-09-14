import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await signIn({ email, password });

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: result.user,
      session: result.session
    });
  } catch (error: any) {
    console.error('Erro no signin:', error);
    return NextResponse.json(
      { error: error.message || 'Credenciais inválidas' },
      { status: 401 }
    );
  }
}