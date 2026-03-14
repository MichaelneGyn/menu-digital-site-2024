import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, userIsAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? undefined;

  if (!email) {
    return { ok: false as const, response: NextResponse.json({ error: 'Nao autorizado' }, { status: 401 }) };
  }

  if (!(await userIsAdmin(email))) {
    return { ok: false as const, response: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }) };
  }

  return { ok: true as const, email };
}

/**
 * GET /api/admin/notifications
 * Lista notificacoes (apenas admin)
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await ensureAdmin();
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where = unreadOnly ? { isRead: false } : {};

    const notifications = await prisma.adminNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 50,
    });

    const unreadCount = await prisma.adminNotification.count({
      where: { isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    console.error('Erro ao buscar notificacoes:', error);

    if (error?.message?.includes('not found in enum')) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    return NextResponse.json({ error: 'Erro ao buscar notificacoes' }, { status: 500 });
  }
}

/**
 * POST /api/admin/notifications
 * Cria notificacao (uso interno/admin)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await ensureAdmin();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { type, title, message, userId, userName, userEmail, amount, metadata } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: type, title, message' },
        { status: 400 }
      );
    }

    const notification = await prisma.adminNotification.create({
      data: {
        type,
        title,
        message,
        userId,
        userName,
        userEmail,
        amount,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar notificacao:', error);
    return NextResponse.json({ error: 'Erro ao criar notificacao' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/notifications
 * Marca notificacoes como lidas
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await ensureAdmin();
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true, readAt: new Date() },
      });

      return NextResponse.json({ message: 'Todas notificacoes marcadas como lidas' });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'notificationIds deve ser um array' }, { status: 400 });
    }

    await prisma.adminNotification.updateMany({
      where: { id: { in: notificationIds } },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ message: 'Notificacoes marcadas como lidas' });
  } catch (error) {
    console.error('Erro ao atualizar notificacoes:', error);
    return NextResponse.json({ error: 'Erro ao atualizar notificacoes' }, { status: 500 });
  }
}