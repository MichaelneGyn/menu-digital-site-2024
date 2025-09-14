import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    await signOut();

    return NextResponse.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro no signout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}