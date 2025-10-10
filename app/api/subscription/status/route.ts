import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkUserSubscriptionByEmail } from '@/lib/subscription';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          isActive: false, 
          isAdmin: false,
          message: 'Não autenticado' 
        },
        { status: 401 }
      );
    }

    const status = await checkUserSubscriptionByEmail(session.user.email);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Erro ao verificar status da assinatura:', error);
    return NextResponse.json(
      { 
        isActive: false, 
        isAdmin: false,
        message: 'Erro ao verificar status' 
      },
      { status: 500 }
    );
  }
}
