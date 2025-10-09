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
  const restaurants = await prisma.restaurant.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(restaurants);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? undefined;
  if (!(await userIsAdmin(email))) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const { name, slug, userId } = body;
  const created = await prisma.restaurant.create({ 
    data: { 
      name, 
      slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), 
      userId 
    } 
  });
  return NextResponse.json(created);
}