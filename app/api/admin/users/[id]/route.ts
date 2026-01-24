import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { userIsAdmin, authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? undefined;
  
  if (!(await userIsAdmin(email))) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const userId = params.id;

  try {
    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        restaurants: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    // Deletar o usuário (cascata vai deletar restaurantes, pedidos, etc)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ 
      message: 'Usuário deletado com sucesso',
      deletedUser: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return NextResponse.json({ 
      message: 'Erro ao deletar usuário',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }, { status: 500 });
  }
}
