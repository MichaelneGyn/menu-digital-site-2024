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
    },
  });

  const payload = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    restaurants: u.restaurants,
  }));

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