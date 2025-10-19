import { NextRequest, NextResponse } from 'next/server';

// Email e WhatsApp de contato oficial
const CONTACT_EMAIL = 'suportemenurapido@gmail.com';
const CONTACT_WHATSAPP = '5562981105064'; // WhatsApp MenuRapido

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantName, name, whatsapp, email, message } = body;

    if (!restaurantName || !name || !whatsapp || !email) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    // Aqui você pode integrar com:
    // - Resend (enviar email)
    // - SendGrid
    // - Mailgun
    // - Ou salvar no banco para revisar depois

    // Por enquanto, vamos apenas registrar no console
    console.log('📧 NOVO CONTATO RECEBIDO:');
    console.log('Restaurante:', restaurantName);
    console.log('Nome:', name);
    console.log('WhatsApp:', whatsapp);
    console.log('Email:', email);
    console.log('Mensagem:', message);
    console.log('---');
    console.log(`Para responder: ${CONTACT_EMAIL}`);

    // TODO: Implementar envio de email real
    // Exemplo com Resend:
    // await resend.emails.send({
    //   from: 'noreply@menurapido.com.br',
    //   to: CONTACT_EMAIL,
    //   subject: `Novo contato: ${restaurantName}`,
    //   html: `
    //     <h2>Novo contato recebido</h2>
    //     <p><strong>Restaurante:</strong> ${restaurantName}</p>
    //     <p><strong>Nome:</strong> ${name}</p>
    //     <p><strong>WhatsApp:</strong> ${whatsapp}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Mensagem:</strong></p>
    //     <p>${message || 'Sem mensagem'}</p>
    //   `
    // });

    return NextResponse.json({ 
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' 
    });
  } catch (error) {
    console.error('Erro ao processar contato:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
