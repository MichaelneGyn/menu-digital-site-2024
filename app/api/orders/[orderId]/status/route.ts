import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { orderId } = params;
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
      where: { id: orderId },
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
      where: { id: orderId },
      data: updateData,
    });

    // Envia notificação por WhatsApp (se telefone disponível)
    if (order.customerPhone) {
      const whatsappMessage = generateWhatsAppMessage(order, status, estimatedTime);

      // Retorna URL do WhatsApp para envio automático
      const phoneNumber = order.customerPhone.replace(/\D/g, '');
      // Usar api.whatsapp.com ao invés de wa.me para abrir DIRETO na conversa
      const whatsappUrl = `https://api.whatsapp.com/send?phone=55${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;

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

  let text = `${emoji} *${restaurantName}*\n\n`;
  text += `*Pedido #${order.code}*\n`;
  text += `${message}\n\n`;

  if (status === 'CONFIRMED' && estimatedTime) {
    text += `⏱️ *Tempo estimado:* ${estimatedTime} minutos\n\n`;
  }

  if (status === 'PREPARING') {
    text += `👨‍🍳 Nossa equipe está preparando seu pedido com muito carinho!\n\n`;
  }

  if (status === 'READY') {
    text += `🚚 Seu pedido já saiu para entrega!\n`;
    if (estimatedTime) {
      text += `⏱️ *Previsão de chegada:* ${estimatedTime} minutos\n\n`;
    }
  }

  if (status === 'DELIVERED') {
    text += `🎉 Esperamos que aproveite!\n`;
    text += `⭐ Deixe sua avaliação e nos ajude a melhorar!\n\n`;
  }

  text += `_Obrigado por escolher ${restaurantName}!_`;

  return text;
}
