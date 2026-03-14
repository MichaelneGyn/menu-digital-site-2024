import { prisma } from '@/lib/db';

type ActivationResult = {
  paymentId: string;
  userId: string;
  subscriptionId: string;
  subscriptionStatus: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  wasAlreadyCompleted: boolean;
};

/**
 * Ativa/renova assinatura com base em um pagamento.
 * Fluxo idempotente para suportar webhook + polling sem duplicar cobrança.
 */
export async function activateSubscriptionFromPayment(
  paymentId: string,
  approvedAt: Date = new Date()
): Promise<ActivationResult> {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Pagamento não encontrado');
    }

    const now = approvedAt;
    const currentPeriodEnd = new Date(now);
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    if (payment.status === 'COMPLETED' && payment.subscriptionId) {
      const existingSubscription = await tx.subscription.findUnique({
        where: { id: payment.subscriptionId },
      });

      if (!existingSubscription) {
        throw new Error('Assinatura vinculada não encontrada');
      }

      return {
        paymentId: payment.id,
        userId: payment.userId,
        subscriptionId: existingSubscription.id,
        subscriptionStatus: existingSubscription.status,
        wasAlreadyCompleted: true,
      };
    }

    let plan = 'pro';
    try {
      const providerData = JSON.parse(payment.providerData || '{}') as { plan?: string };
      if (providerData.plan) {
        plan = providerData.plan;
      }
    } catch {
      plan = 'pro';
    }

    const existingSubscription = await tx.subscription.findFirst({
      where: { userId: payment.userId },
      orderBy: { createdAt: 'desc' },
    });

    const subscription = existingSubscription
      ? await tx.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'ACTIVE',
            plan,
            amount: payment.amount,
            currentPeriodStart: now,
            currentPeriodEnd,
            trialEndsAt: null,
            canceledAt: null,
          },
        })
      : await tx.subscription.create({
          data: {
            userId: payment.userId,
            status: 'ACTIVE',
            plan,
            amount: payment.amount,
            currentPeriodStart: now,
            currentPeriodEnd,
          },
        });

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: now,
        subscriptionId: subscription.id,
      },
    });

    return {
      paymentId: payment.id,
      userId: payment.userId,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      wasAlreadyCompleted: false,
    };
  });
}
