import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const STATUS_MESSAGES = {
  PENDING: 'Pedido recebido e aguardando confirmação',
  CONFIRMED: 'Pedido confirmado! Estamos preparando seu pedido',
  PREPARING: 'Seu pedido está sendo preparado na cozinha',
  READY: 'Pedido pronto! Saindo para entrega',
  DELIVERED: 'Pedido entregue com sucesso!',
  CANCELLED: 'Pedido cancelado',
};

const STATUS_EMOJIS = {
  PENDING: '⏳',
  CONFIRMED: '✅',
  PREPARING: '👨‍🍳',
  READY: '🎉',
  DELIVERED: '🚚',
  CANCELLED: '❌',
};

/**
 * Atualiza o status de um pedido e envia notificação por WhatsApp
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { status, estimatedTime } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 }
      );
    }

    // Busca o pedido
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        orderItems: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        restaurants: {
          select: { id: true }
        }
      }
    });

    if (!user || !user.restaurants.some((restaurant) => restaurant.id === order.restaurantId)) {
      return NextResponse.json(
        { error: 'Não autorizado para este pedido' },
        { status: 403 }
      );
    }

    // Define timestamps baseado no status
    const now = new Date();
    const updateData: any = {
      status,
      updatedAt: now,
    };

    if (estimatedTime) {
      updateData.estimatedTime = estimatedTime;
    }

    switch (status) {
      case 'CONFIRMED':
        updateData.confirmedAt = now;
        break;
      case 'PREPARING':
        updateData.preparingAt = now;
        break;
      case 'READY':
        updateData.readyAt = now;
        break;
      case 'DELIVERED':
        updateData.deliveredAt = now;
        break;
      case 'CANCELLED':
        updateData.cancelledAt = now;
        break;
    }

    // Atualiza o pedido
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    // 🔔 Envia notificação por WhatsApp APENAS para status IMPORTANTES
    // Evita spam de mensagens! Cliente acompanha pelo link.
    const shouldNotify = ['CONFIRMED', 'READY'].includes(status);
    
    if (order.customerPhone && shouldNotify) {
      const whatsappMessage = generateWhatsAppMessage(order, status, estimatedTime);

      // Retorna URL do WhatsApp para envio automático
      const phoneNumber = order.customerPhone.replace(/\D/g, '');
      // Detecta se é mobile para usar URL apropriada
      const isMobile = req.headers.get('user-agent')?.includes('Mobile') || false;
      const whatsappUrl = isMobile
        ? `https://api.whatsapp.com/send?phone=55${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`
        : `https://web.whatsapp.com/send?phone=55${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        notification: {
          whatsappUrl,
          message: whatsappMessage,
        },
      });
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status' },
      { status: 500 }
    );
  }
}

/**
 * Gera mensagem formatada para WhatsApp
 */
function generateWhatsAppMessage(
  order: any,
  status: string,
  estimatedTime?: number
): string {
  const emoji = STATUS_EMOJIS[status as keyof typeof STATUS_EMOJIS];
  const message = STATUS_MESSAGES[status as keyof typeof STATUS_MESSAGES];
  const restaurantName = order.restaurant?.name || 'Restaurante';
  const trackingUrl = `${process.env.NEXTAUTH_URL || 'https://menu-digital-site-2024-8773d37d6064.vercel.app'}/pedido/${order.code}`;

  let text = `${emoji} *${restaurantName}*\n\n`;
  text += `*Pedido #${order.code}*\n`;
  text += `${message}\n\n`;

  if (status === 'CONFIRMED') {
    if (estimatedTime) {
      text += `⏱️ *Tempo estimado:* ${estimatedTime} minutos\n\n`;
    }
    text += `👨‍🍳 Nossa equipe já está preparando tudo com muito carinho!\n\n`;
    text += `📱 *Acompanhe em tempo real:*\n${trackingUrl}\n\n`;
  }

  if (status === 'READY') {
    text += `🚚 Seu pedido já saiu para entrega!\n`;
    if (estimatedTime) {
      text += `⏱️ *Previsão de chegada:* ${estimatedTime} minutos\n`;
    }
    text += `\n📱 *Acompanhe a entrega:*\n${trackingUrl}\n\n`;
  }

  text += `_Obrigado por escolher ${restaurantName}!_`;

  return text;
}
