import { NextResponse } from 'next/server';
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
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1, // assinatura atual (mais recente)
      },
    },
  });

  const payload = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    subscriptionAtual: u.subscriptions?.[0] ?? null,
  }));

  return NextResponse.json(payload);
}

// POST: cria assinatura atual de um usuário
// body: { userId, plan, status, validUntil? }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? undefined;
  if (!(await userIsAdmin(email))) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { userId, plan, status, validUntil } = body ?? {};
  if (!userId || !plan || !status) {
    return NextResponse.json({ message: 'Campos obrigatórios: userId, plan, status' }, { status: 400 });
  }

  const created = await prisma.subscription.create({
    data: {
      userId,
      plan,
      status,
      validUntil: validUntil ? new Date(validUntil) : null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}