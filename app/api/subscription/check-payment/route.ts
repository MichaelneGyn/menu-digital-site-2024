import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { activateSubscriptionFromPayment } from '@/lib/subscription-activation';

async function checkMercadoPagoStatus(providerPaymentId: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    return null;
  }

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${providerPaymentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Erro ao consultar Mercado Pago:', err);
    return null;
  }

  return res.json() as Promise<{ status?: string; date_approved?: string }>;
}

/**
 * Verifica o status de um pagamento
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'ID do pagamento nao fornecido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: user.id,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento nao encontrado' }, { status: 404 });
    }

    // Auto confirmacao para pagamentos Mercado Pago
    if (
      payment.status === 'PENDING' &&
      payment.paymentProvider === 'mercadopago' &&
      payment.providerPaymentId
    ) {
      const mpPayment = await checkMercadoPagoStatus(payment.providerPaymentId);

      if (mpPayment?.status === 'approved') {
        await activateSubscriptionFromPayment(
          payment.id,
          mpPayment.date_approved ? new Date(mpPayment.date_approved) : new Date()
        );
      }
    }

    const freshPayment = await prisma.payment.findUnique({ where: { id: payment.id } });

    return NextResponse.json({
      id: freshPayment?.id || payment.id,
      status: freshPayment?.status || payment.status,
      amount: freshPayment?.amount || payment.amount,
      paidAt: freshPayment?.paidAt || payment.paidAt,
      paymentProvider: freshPayment?.paymentProvider || payment.paymentProvider,
    });
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return NextResponse.json({ error: 'Erro ao verificar pagamento' }, { status: 500 });
  }
}