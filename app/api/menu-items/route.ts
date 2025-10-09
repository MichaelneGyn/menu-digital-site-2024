import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const restaurantId = user.restaurants[0].id;

    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId },
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Erro ao buscar items do menu:', error);
    return NextResponse.json({ error: 'Erro ao buscar items do menu' }, { status: 500 });
  }
}
