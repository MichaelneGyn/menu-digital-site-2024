import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generatePixPayload } from '@/lib/pix';

const PLANS = {
  pro: { name: 'Plano Mensal', price: 69.9 },
  basic: { name: 'Plano Mensal', price: 69.9 },
  founder: { name: 'Plano Mensal', price: 69.9 },
  early: { name: 'Plano Mensal', price: 69.9 },
  normal: { name: 'Plano Mensal', price: 69.9 },
};

const PIX_KEY = process.env.PIX_KEY || '';
const PIX_RECIPIENT_NAME = process.env.PIX_RECIPIENT_NAME || 'Menu Digital';
const PIX_RECIPIENT_CITY = process.env.PIX_RECIPIENT_CITY || 'SAO PAULO';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body;

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: 'Plano invalido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];

    let payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: planInfo.price,
        status: 'PENDING',
        paymentMethod: 'PIX',
        paymentProvider: 'mercadopago',
        providerData: JSON.stringify({ plan }),
      },
    });

    const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (mpToken) {
      const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
      const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mpToken}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          transaction_amount: planInfo.price,
          description: `${planInfo.name} - Virtual Cardapio`,
          payment_method_id: 'pix',
          payer: {
            email: user.email,
            first_name: user.name?.split(' ')[0] || 'Cliente',
          },
          external_reference: payment.id,
          notification_url: `${baseUrl}/api/subscription/webhook`,
          metadata: {
            localPaymentId: payment.id,
            plan,
            userId: user.id,
          },
        }),
      });

      const mpData = await mpRes.json();
      if (!mpRes.ok) {
        console.error('Mercado Pago error:', mpData);
        return NextResponse.json(
          { error: 'Erro ao iniciar pagamento PIX. Tente novamente.' },
          { status: 502 }
        );
      }

      const providerPaymentId = String(mpData.id);
      const qrCodeBase64 = mpData?.point_of_interaction?.transaction_data?.qr_code_base64 as string | undefined;
      const qrCodeRaw = mpData?.point_of_interaction?.transaction_data?.qr_code as string | undefined;

      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentProvider: 'mercadopago',
          providerPaymentId,
          providerData: JSON.stringify({
            plan,
            providerPaymentId,
          }),
        },
      });

      return NextResponse.json({
        id: payment.id,
        amount: planInfo.price,
        pixQrCode: qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null,
        pixCopyPaste: qrCodeRaw || null,
        status: payment.status,
        paymentProvider: payment.paymentProvider,
      });
    }

    if (!PIX_KEY) {
      return NextResponse.json(
        { error: 'Pagamento indisponivel: configure MERCADOPAGO_ACCESS_TOKEN ou PIX_KEY.' },
        { status: 500 }
      );
    }

    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentProvider: 'manual',
      },
    });

    const pixCopyPaste = generatePixPayload({
      pixKey: PIX_KEY,
      merchantName: PIX_RECIPIENT_NAME,
      merchantCity: PIX_RECIPIENT_CITY,
      amount: planInfo.price,
      txid: payment.id,
      description: `Assinatura ${planInfo.name}`,
    });

    return NextResponse.json({
      id: payment.id,
      amount: planInfo.price,
      pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCopyPaste)}`,
      pixCopyPaste,
      status: payment.status,
      paymentProvider: payment.paymentProvider,
      manualConfirmation: true,
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 });
  }
}