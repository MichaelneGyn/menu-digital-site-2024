import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Configuração de Planos e Preços
const PLANS = {
  pro: { name: 'Plano Mensal', price: 69.90 },
  // Manter compatibilidade com chamadas antigas, redirecionando para o preço correto
  basic: { name: 'Plano Mensal', price: 69.90 },
  founder: { name: 'Plano Mensal', price: 69.90 },
  early: { name: 'Plano Mensal', price: 69.90 },
  normal: { name: 'Plano Mensal', price: 69.90 },
};

// 🔑 CHAVE PIX DO SISTEMA
const PIX_KEY = 'c39d3f73-ea89-4954-88cc-d26120896540';
const PIX_RECIPIENT_NAME = 'Menu Digital';

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
    
    console.log('Iniciando checkout para plano:', plan); // Debug log para garantir deploy

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
      pixKey: PIX_KEY,
      pixRecipientName: PIX_RECIPIENT_NAME,
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
 * Gera código PIX Copia e Cola
 * NOTA: Esta é uma versão simplificada para pagamento manual
 * Para automação completa, integrar API Mercado Pago/PagSeguro
 */
function generatePixCode(paymentId: string, amount: number): string {
  // Código PIX simplificado com a chave real
  // Formato básico do PIX: chave + valor
  const amountStr = amount.toFixed(2).replace('.', '');
  const checksum = Math.random().toString(36).substring(7).toUpperCase();
  
  return `00020126580014br.gov.bcb.pix0136${PIX_KEY}520400005303986540${amountStr}5802BR5925${PIX_RECIPIENT_NAME.toUpperCase().padEnd(25).substring(0, 25)}6009SAO PAULO62070503***6304${checksum}`;
}
