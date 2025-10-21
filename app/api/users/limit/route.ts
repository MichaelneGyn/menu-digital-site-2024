import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Data de início das 10 vagas (hoje)
const LAUNCH_DATE = new Date('2025-01-21T00:00:00Z'); // Ajuste para a data real de lançamento
const FOUNDER_LIMIT = 10;

export async function GET() {
  try {
    // Contar APENAS usuários criados APÓS a data de lançamento
    const newUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: LAUNCH_DATE,
        },
        // Excluir contas de teste/admin se necessário
        // email: {
        //   not: {
        //     contains: 'test',
        //   },
        // },
      },
    });

    const spotsLeft = Math.max(0, FOUNDER_LIMIT - newUsersCount);
    const isLimitReached = newUsersCount >= FOUNDER_LIMIT;

    return NextResponse.json({
      newUsersCount,
      spotsLeft,
      isLimitReached,
      founderLimit: FOUNDER_LIMIT,
      launchDate: LAUNCH_DATE,
    });
  } catch (error) {
    console.error('Erro ao verificar limite:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar limite' },
      { status: 500 }
    );
  }
}
