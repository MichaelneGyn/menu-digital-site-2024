import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await signUp({ email, password, name });

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: result.user
    });
  } catch (error: any) {
    console.error('Erro no signup:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}