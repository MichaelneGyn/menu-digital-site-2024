import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = 'michaeldouglasqueiroz@gmail.com';

/**
 * GET /api/admin/notifications
 * Lista todas as notificações (apenas para o admin)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é o admin
    if (session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = unreadOnly ? { isRead: false } : {};

    const notifications = await prisma.adminNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await prisma.adminNotification.count({
      where: { isRead: false },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Cria uma nova notificação (uso interno)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, title, message, userId, userName, userEmail, amount, metadata } = body;

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: type, title, message' },
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
  } catch (error: any) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar notificação' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/notifications
 * Marca notificações como lidas
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é o admin
    if (session.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await req.json();
    const { notificationIds, markAllAsRead } = body;

    if (markAllAsRead) {
      // Marcar todas como lidas
      await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ message: 'Todas notificações marcadas como lidas' });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'notificationIds deve ser um array' },
        { status: 400 }
      );
    }

    // Marcar notificações específicas como lidas
    await prisma.adminNotification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Notificações marcadas como lidas' });
  } catch (error: any) {
    console.error('Erro ao atualizar notificações:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar notificações' },
      { status: 500 }
    );
  }
}
