import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Configuração de Planos e Preços
const PLANS = {
  pro: { name: 'Plano Mensal', price: 69.90 },
  // Manter compatibilidade com chamadas antigas
  basic: { name: 'Plano Mensal', price: 69.90 },
  founder: { name: 'Plano Mensal', price: 69.90 },
  early: { name: 'Plano Mensal', price: 69.90 },
  normal: { name: 'Plano Mensal', price: 69.90 },
};

// 🔑 CHAVE PIX DO SISTEMA (Sua chave real)
const PIX_KEY = 'c39d3f73-ea89-4954-88cc-d26120896540';
const PIX_RECIPIENT_NAME = 'Menu Digital';
const PIX_RECIPIENT_CITY = 'SAO PAULO';

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
    
    console.log('Iniciando checkout para plano:', plan);

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

    // Gera código PIX VÁLIDO (BR Code)
    const pixCopyPaste = generatePixPayload(
        PIX_KEY, 
        PIX_RECIPIENT_NAME, 
        PIX_RECIPIENT_CITY, 
        planInfo.price, 
        payment.id // Usa o ID do pagamento como identificador (txid)
    );

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

// ==========================================
// HELPER: GERAÇÃO DE PAYLOAD PIX (BR Code)
// ==========================================

function generatePixPayload(key: string, name: string, city: string, amount: number, txid: string): string {
  // Limpa strings
  const cleanKey = key.trim();
  const cleanName = name.substring(0, 25).trim(); // Max 25 chars
  const cleanCity = city.substring(0, 15).trim(); // Max 15 chars
  const cleanTxid = txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || '***'; // Alfanumérico apenas
  const amountStr = amount.toFixed(2);

  // Monta os campos do payload
  const payload = [
    '000201', // Payload Format Indicator
    '26' + (cleanKey.length + 22).toString().padStart(2, '0') + // Merchant Account Information
      '0014br.gov.bcb.pix' +
      '01' + cleanKey.length.toString().padStart(2, '0') + cleanKey,
    '52040000', // Merchant Category Code
    '5303986',  // Transaction Currency (BRL)
    '54' + amountStr.length.toString().padStart(2, '0') + amountStr, // Transaction Amount
    '5802BR',   // Country Code
    '59' + cleanName.length.toString().padStart(2, '0') + cleanName, // Merchant Name
    '60' + cleanCity.length.toString().padStart(2, '0') + cleanCity, // Merchant City
    '62' + (cleanTxid.length + 4).toString().padStart(2, '0') + // Additional Data Field Template
      '05' + cleanTxid.length.toString().padStart(2, '0') + cleanTxid,
    '6304' // CRC16 prefix
  ].join('');

  // Calcula CRC16
  const crc = calculateCRC16(payload);
  return payload + crc;
}

function calculateCRC16(payload: string): string {
  const polynomial = 0x1021;
  let crc = 0xFFFF;

  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
    }
  }

  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}