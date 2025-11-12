import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH - Atualizar integração (ativar/desativar, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: { user: { email: session.user.email } }
    });

    if (!restaurant) {
      return new NextResponse('Restaurante não encontrado', { status: 404 });
    }

    const body = await request.json();
    const { is_active, auto_accept_orders, auto_sync_menu } = body;

    // Verificar se a integração pertence ao restaurante
    const integration = await (prisma as any).integration.findFirst({
      where: {
        id: params.id,
        restaurantId: restaurant.id
      }
    });

    if (!integration) {
      return new NextResponse('Integração não encontrada', { status: 404 });
    }

    // Atualizar
    const updated = await (prisma as any).integration.update({
      where: { id: params.id },
      data: {
        ...(is_active !== undefined && { isActive: is_active }),
        ...(auto_accept_orders !== undefined && { autoAcceptOrders: auto_accept_orders }),
        ...(auto_sync_menu !== undefined && { autoSyncMenu: auto_sync_menu }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar integração:', error);
    return new NextResponse('Erro ao atualizar integração', { status: 500 });
  }
}

// DELETE - Remover integração
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: { user: { email: session.user.email } }
    });

    if (!restaurant) {
      return new NextResponse('Restaurante não encontrado', { status: 404 });
    }

    // Verificar se a integração pertence ao restaurante
    const integration = await (prisma as any).integration.findFirst({
      where: {
        id: params.id,
        restaurantId: restaurant.id
      }
    });

    if (!integration) {
      return new NextResponse('Integração não encontrada', { status: 404 });
    }

    // Deletar
    await (prisma as any).integration.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar integração:', error);
    return new NextResponse('Erro ao deletar integração', { status: 500 });
  }
}
