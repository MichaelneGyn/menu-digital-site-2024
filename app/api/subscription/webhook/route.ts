import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { activateSubscriptionFromPayment } from '@/lib/subscription-activation';

type MercadoPagoWebhookBody = {
  type?: string;
  action?: string;
  data?: {
    id?: string | number;
  };
};

async function fetchMercadoPagoPayment(id: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Erro ao buscar pagamento MP no webhook:', text);
    return null;
  }

  return res.json() as Promise<{
    id: number;
    status?: string;
    date_approved?: string;
    external_reference?: string;
    metadata?: {
      localPaymentId?: string;
    };
  }>;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as MercadoPagoWebhookBody;
    const eventType = payload.type || payload.action;

    if (!eventType?.includes('payment')) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const providerPaymentId =
      payload?.data?.id !== undefined && payload?.data?.id !== null
        ? String(payload.data.id)
        : null;

    if (!providerPaymentId) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'missing_payment_id' });
    }

    const mpPayment = await fetchMercadoPagoPayment(providerPaymentId);
    if (!mpPayment) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'mp_lookup_failed' });
    }

    if (mpPayment.status !== 'approved') {
      return NextResponse.json({ ok: true, ignored: true, reason: `status_${mpPayment.status || 'unknown'}` });
    }

    const localPaymentId =
      mpPayment.metadata?.localPaymentId ||
      mpPayment.external_reference ||
      null;

    if (!localPaymentId) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'missing_local_reference' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: localPaymentId },
    });

    if (!payment) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'local_payment_not_found' });
    }

    await activateSubscriptionFromPayment(
      payment.id,
      mpPayment.date_approved ? new Date(mpPayment.date_approved) : new Date()
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro no webhook de assinatura:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
