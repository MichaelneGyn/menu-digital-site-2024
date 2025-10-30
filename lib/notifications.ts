import { prisma } from '@/lib/db';

export type NotificationType = 'NEW_SIGNUP' | 'PAYMENT_RECEIVED' | 'TRIAL_ENDING' | 'SUBSCRIPTION_CANCELED';

interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  amount?: number;
  metadata?: Record<string, any>;
}

/**
 * Cria uma notificação para o admin
 */
export async function createAdminNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.adminNotification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        userId: params.userId,
        userName: params.userName,
        userEmail: params.userEmail,
        amount: params.amount,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });

    console.log('✅ Notificação criada:', notification.id, params.title);
    return notification;
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    // Não lançar erro para não quebrar o fluxo principal
    return null;
  }
}

/**
 * Notifica sobre novo cadastro (trial)
 */
export async function notifyNewSignup(userId: string, userName: string, userEmail: string) {
  return createAdminNotification({
    type: 'NEW_SIGNUP',
    title: '🎉 Novo Cadastro!',
    message: `${userName} acabou de se cadastrar e iniciou o período de teste grátis.`,
    userId,
    userName,
    userEmail,
  });
}

/**
 * Notifica sobre pagamento recebido
 */
export async function notifyPaymentReceived(
  userId: string,
  userName: string,
  userEmail: string,
  amount: number,
  plan: string
) {
  return createAdminNotification({
    type: 'PAYMENT_RECEIVED',
    title: '💰 Pagamento Recebido!',
    message: `${userName} pagou R$ ${amount.toFixed(2)} pelo plano ${plan}.`,
    userId,
    userName,
    userEmail,
    amount,
    metadata: { plan },
  });
}

/**
 * Notifica sobre trial acabando
 */
export async function notifyTrialEnding(userId: string, userName: string, userEmail: string, daysLeft: number) {
  return createAdminNotification({
    type: 'TRIAL_ENDING',
    title: '⏰ Trial Acabando',
    message: `O trial de ${userName} acaba em ${daysLeft} dia${daysLeft > 1 ? 's' : ''}.`,
    userId,
    userName,
    userEmail,
    metadata: { daysLeft },
  });
}

/**
 * Notifica sobre assinatura cancelada
 */
export async function notifySubscriptionCanceled(userId: string, userName: string, userEmail: string) {
  return createAdminNotification({
    type: 'SUBSCRIPTION_CANCELED',
    title: '❌ Assinatura Cancelada',
    message: `${userName} cancelou a assinatura.`,
    userId,
    userName,
    userEmail,
  });
}
