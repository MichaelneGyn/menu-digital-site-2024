import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { notifyPaymentReceived } from '@/lib/notifications';

/**
 * Confirma um pagamento e ativa a assinatura
 * Em produção, isso seria feito pelo webhook do provedor de pagamento
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido' },
        { status: 400 }
      );
    }

    // Busca o pagamento
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento não encontrado' },
        { status: 404 }
      );
    }

    if (payment.status === 'COMPLETED') {
      return NextResponse.json(
        { message: 'Pagamento já confirmado' },
        { status: 200 }
      );
    }

    // Extrai o plano do providerData
    const providerData = JSON.parse(payment.providerData || '{}');
    const plan = providerData.plan || 'basic';

    // Atualiza o pagamento para COMPLETED
    const now = new Date();
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        paidAt: now,
      },
    });

    // Calcula a data de vencimento (30 dias a partir de hoje)
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    // Busca ou cria a assinatura do usuário
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: payment.userId },
      orderBy: { createdAt: 'desc' },
    });

    let subscription;

    if (existingSubscription) {
      // Atualiza assinatura existente
      subscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'ACTIVE',
          plan,
          amount: payment.amount,
          currentPeriodStart: now,
          currentPeriodEnd,
          trialEndsAt: null, // Remove trial
          canceledAt: null,
        },
      });
    } else {
      // Cria nova assinatura
      subscription = await prisma.subscription.create({
        data: {
          userId: payment.userId,
          status: 'ACTIVE',
          plan,
          amount: payment.amount,
          currentPeriodStart: now,
          currentPeriodEnd,
        },
      });
    }

    // Associa o pagamento à assinatura
    await prisma.payment.update({
      where: { id: paymentId },
      data: { subscriptionId: subscription.id },
    });

    // 🔔 NOTIFICAR ADMIN SOBRE PAGAMENTO RECEBIDO
    await notifyPaymentReceived(
      payment.user.id,
      payment.user.name || 'Sem nome',
      payment.user.email,
      payment.amount,
      plan
    );

    return NextResponse.json({
      message: 'Pagamento confirmado com sucesso!',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.plan,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao confirmar pagamento' },
      { status: 500 }
    );
  }
}
