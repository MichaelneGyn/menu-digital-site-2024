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
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(users);
}