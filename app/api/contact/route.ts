import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Email e WhatsApp de contato oficial
const CONTACT_EMAIL = 'vituralcardapio@gmail.com'; // ✅ Email corporativo correto
const CONTACT_WHATSAPP = '5562981105064'; // WhatsApp Virtual Cardápio

// Inicializar Resend apenas se a API key estiver disponível
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantName, name, whatsapp, email, message } = body;

    if (!restaurantName || !name || !whatsapp || !email) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    // Log para debug (vai aparecer nos logs da Vercel)
    console.log('📧 NOVO CONTATO RECEBIDO:');
    console.log('Restaurante:', restaurantName);
    console.log('Nome:', name);
    console.log('WhatsApp:', whatsapp);
    console.log('Email:', email);

    // Enviar email usando Resend
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Virtual Cardápio <onboarding@resend.dev>', // Email padrão do Resend (grátis)
          to: CONTACT_EMAIL, // ✅ Seu Gmail: vituralcardapio@gmail.com
          replyTo: email, // Email do cliente (você pode responder direto)
          subject: `🔔 Novo Contato: ${restaurantName}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                  .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                  .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #ef4444; }
                  .label { font-weight: bold; color: #ef4444; }
                  .footer { background: #374151; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2 style="margin: 0;">🔔 Novo Contato Recebido!</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">MenuRapido - Sistema de Gestão</p>
                  </div>
                  
                  <div class="content">
                    <p>Olá! Você recebeu um novo contato através do site do MenuRapido.</p>
                    
                    <div class="info-box">
                      <p><span class="label">🏪 Restaurante:</span> ${restaurantName}</p>
                    </div>
                    
                    <div class="info-box">
                      <p><span class="label">👤 Nome:</span> ${name}</p>
                    </div>
                    
                    <div class="info-box">
                      <p><span class="label">📱 WhatsApp:</span> <a href="https://wa.me/55${whatsapp.replace(/\D/g, '')}">${whatsapp}</a></p>
                    </div>
                    
                    <div class="info-box">
                      <p><span class="label">📧 Email:</span> <a href="mailto:${email}">${email}</a></p>
                    </div>
                    
                    ${message ? `
                      <div class="info-box">
                        <p><span class="label">💬 Mensagem:</span></p>
                        <p style="margin-top: 10px; padding: 10px; background: #f3f4f6; border-radius: 4px;">${message}</p>
                      </div>
                    ` : ''}
                    
                    <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 6px;">
                      <p style="margin: 0;"><strong>💡 Dica:</strong> Responda este email diretamente ou clique no WhatsApp acima para conversar!</p>
                    </div>
                  </div>
                  
                  <div class="footer">
                    <p style="margin: 0;">MenuRapido - Sistema Completo para Restaurantes</p>
                    <p style="margin: 5px 0 0 0; opacity: 0.8;">Este é um email automático. Não responda para este endereço.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
        });
        
        console.log('✅ Email enviado com sucesso para:', CONTACT_EMAIL);
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError);
        // Não falha a requisição, apenas loga o erro
      }
    } else {
      console.warn('⚠️ RESEND_API_KEY não configurada. Email não enviado.');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.' 
    });
  } catch (error) {
    console.error('Erro ao processar contato:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagem' }, { status: 500 });
  }
}
