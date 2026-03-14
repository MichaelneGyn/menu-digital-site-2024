import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions, userIsAdmin } from '@/lib/auth';
import { notifyPaymentReceived } from '@/lib/notifications';
import { activateSubscriptionFromPayment } from '@/lib/subscription-activation';

/**
 * Confirmacao manual de pagamento
 * Uso restrito para ADMIN (fallback quando webhook nao estiver ativo)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const isAdmin = await userIsAdmin(session.user.email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Apenas administradores podem confirmar pagamentos manualmente.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json({ error: 'ID do pagamento nao fornecido' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento nao encontrado' }, { status: 404 });
    }

    const activation = await activateSubscriptionFromPayment(payment.id);

    let plan = 'pro';
    try {
      const providerData = JSON.parse(payment.providerData || '{}') as { plan?: string };
      if (providerData.plan) {
        plan = providerData.plan;
      }
    } catch {
      plan = 'pro';
    }

    if (!activation.wasAlreadyCompleted) {
      await notifyPaymentReceived(
        payment.user.id,
        payment.user.name || 'Sem nome',
        payment.user.email,
        payment.amount,
        plan
      );
    }

    return NextResponse.json({
      message: activation.wasAlreadyCompleted
        ? 'Pagamento ja confirmado anteriormente.'
        : 'Pagamento confirmado com sucesso!',
      subscription: {
        id: activation.subscriptionId,
        status: activation.subscriptionStatus,
      },
    });
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    return NextResponse.json({ error: 'Erro ao confirmar pagamento' }, { status: 500 });
  }
}