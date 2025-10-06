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
  const subs = await prisma.subscription.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(subs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? undefined;
  if (!(await userIsAdmin(email))) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const created = await prisma.subscription.create({ data: body });
  return NextResponse.json(created);
}