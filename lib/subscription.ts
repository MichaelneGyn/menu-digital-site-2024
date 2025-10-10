import { prisma } from './db';

export type SubscriptionCheck = {
  isActive: boolean;
  isAdmin: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  subscription: any | null;
  message?: string;
};

/**
 * Verifica o status da assinatura de um usuário
 * ADMIN sempre tem acesso liberado
 */
export async function checkUserSubscription(userId: string): Promise<SubscriptionCheck> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!user) {
    return {
      isActive: false,
      isAdmin: false,
      isTrial: false,
      isExpired: true,
      daysRemaining: 0,
      subscription: null,
      message: 'Usuário não encontrado',
    };
  }

  // ADMIN SEMPRE TEM ACESSO
  if (user.role === 'ADMIN') {
    return {
      isActive: true,
      isAdmin: true,
      isTrial: false,
      isExpired: false,
      daysRemaining: 999999,
      subscription: null,
      message: 'Acesso administrativo',
    };
  }

  const subscription = user.subscriptions[0] || null;

  if (!subscription) {
    return {
      isActive: false,
      isAdmin: false,
      isTrial: false,
      isExpired: true,
      daysRemaining: 0,
      subscription: null,
      message: 'Sem assinatura ativa',
    };
  }

  const now = new Date();
  const endDate = subscription.trialEndsAt || subscription.currentPeriodEnd;

  if (!endDate) {
    return {
      isActive: false,
      isAdmin: false,
      isTrial: false,
      isExpired: true,
      daysRemaining: 0,
      subscription,
      message: 'Data de vencimento não definida',
    };
  }

  const diffTime = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining < 0;

  const isActive = !isExpired && (subscription.status === 'TRIAL' || subscription.status === 'ACTIVE');
  const isTrial = subscription.status === 'TRIAL';

  return {
    isActive,
    isAdmin: false,
    isTrial,
    isExpired,
    daysRemaining: Math.max(0, daysRemaining),
    subscription,
    message: isExpired ? 'Assinatura expirada' : undefined,
  };
}

/**
 * Verifica se o usuário pode acessar funcionalidades pagas
 * Retorna true se ADMIN ou assinatura ativa
 */
export async function canAccessPaidFeatures(userId: string): Promise<boolean> {
  const check = await checkUserSubscription(userId);
  return check.isActive || check.isAdmin;
}

/**
 * Middleware helper para verificar assinatura por email
 */
export async function checkUserSubscriptionByEmail(email: string | null | undefined): Promise<SubscriptionCheck> {
  if (!email) {
    return {
      isActive: false,
      isAdmin: false,
      isTrial: false,
      isExpired: true,
      daysRemaining: 0,
      subscription: null,
      message: 'Email não fornecido',
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    return {
      isActive: false,
      isAdmin: false,
      isTrial: false,
      isExpired: true,
      daysRemaining: 0,
      subscription: null,
      message: 'Usuário não encontrado',
    };
  }

  return checkUserSubscription(user.id);
}
