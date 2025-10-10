import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, userIsAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Lista todos os pagamentos (apenas ADMIN)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? undefined;

    if (!(await userIsAdmin(email))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar pagamentos' },
      { status: 500 }
    );
  }
}
