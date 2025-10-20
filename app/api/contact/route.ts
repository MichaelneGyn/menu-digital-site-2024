import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantName, name, whatsapp, email, message } = body;

    if (!restaurantName || !name || !whatsapp || !email) {
      return NextResponse.json({ error: 'Campos obrigatorios faltando' }, { status: 400 });
    }

    // Log para debug (vai aparecer nos logs da Vercel)
    console.log('NOVO CONTATO RECEBIDO:');
    console.log('Restaurante:', restaurantName);
    console.log('Nome:', name);
    console.log('WhatsApp:', whatsapp);
    console.log('Email:', email);

    return NextResponse.json({ 
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' 
    });
  } catch (error) {
    console.error('Erro ao processar contato:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
