import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { userIsAdmin, authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';

// GET: lista usuários + assinatura mais recente
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? undefined;
  if (!(await userIsAdmin(email))) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      restaurants: true,
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  const now = new Date();

  const payload = users.map((u) => {
    const subscription = u.subscriptions[0] || null;
    
    let daysRemaining = 0;
    let isExpired = false;

    if (subscription) {
      const endDate = subscription.trialEndsAt || subscription.currentPeriodEnd;
      if (endDate) {
        const diffTime = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        isExpired = daysRemaining < 0;
      }
    }

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      restaurants: u.restaurants,
      subscription: subscription ? {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        amount: subscription.amount,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodEnd: subscription.currentPeriodEnd,
        daysRemaining,
        isExpired,
      } : null,
      recentPayments: u.payments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        paymentMethod: p.paymentMethod,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      })),
    };
  });

  return NextResponse.json(payload);
}

// POST: cria assinatura atual de um usuário
// body: { userId, plan, status, validUntil? }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? undefined;
    if (!(await userIsAdmin(email))) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, restaurantName } = body ?? {};
    if (!userId || !restaurantName) {
      return NextResponse.json({ message: 'Campos obrigatórios: userId, restaurantName' }, { status: 400 });
    }

    const created = await prisma.restaurant.create({
      data: {
        name: restaurantName,
        slug: restaurantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        userId,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar restaurante:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}