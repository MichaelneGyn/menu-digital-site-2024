import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const PLANS = {
  basic: { name: 'Básico', price: 49.90 },
  pro: { name: 'Profissional', price: 99.90 },
};

/**
 * Cria um pagamento PIX para assinatura
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
    const { plan } = body;

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const planInfo = PLANS[plan as keyof typeof PLANS];
    
    // Cria o registro de pagamento
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: planInfo.price,
        status: 'PENDING',
        paymentMethod: 'PIX',
        paymentProvider: 'manual',
        providerData: JSON.stringify({ plan }),
      },
    });

    // Gera código PIX fictício (em produção, usar API do Mercado Pago, PagSeguro, etc.)
    const pixCopyPaste = generatePixCode(payment.id, planInfo.price);

    return NextResponse.json({
      id: payment.id,
      amount: planInfo.price,
      pixKey: 'pix@seurestaurante.com', // Substitua pela chave PIX real
      pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCopyPaste)}`,
      pixCopyPaste,
      status: payment.status,
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    );
  }
}

/**
 * Gera código PIX Copia e Cola fictício
 * Em produção, usar API do provedor (Mercado Pago, PagSeguro, etc.)
 */
function generatePixCode(paymentId: string, amount: number): string {
  // Código PIX fictício para demonstração
  // Em produção, usar API real
  return `00020126580014br.gov.bcb.pix0136${paymentId}520400005303986540${amount.toFixed(2)}5802BR5925SEU RESTAURANTE LTDA6009SAO PAULO62070503***6304${Math.random().toString(36).substring(7).toUpperCase()}`;
}
