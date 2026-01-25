import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { userIsAdmin, authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? undefined;
  
  if (!(await userIsAdmin(email))) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await (prisma.user as any).findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        restaurants: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
          take: 1,
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Formatar dados para o frontend
    const formattedUsers = users.map((user: any) => {
      const lastSubscription = user.subscriptions?.[0];
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        whatsapp: user.whatsapp,
        createdAt: user.createdAt,
        trialEndsAt: lastSubscription?.trialEndsAt || null,
        subscriptionStatus: lastSubscription?.status || null,
        subscriptionPlan: lastSubscription?.plan || null,
        restaurant: user.restaurants[0] || null,
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ message: 'Erro ao buscar usuários' }, { status: 500 });
  }
}