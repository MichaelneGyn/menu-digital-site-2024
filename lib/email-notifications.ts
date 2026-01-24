import { Resend } from 'resend';

// Inicializar Resend (você vai precisar adicionar a API key no .env)
const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = 'michaeldouglasqueiroz@gmail.com';
// Usar domínio padrão do Resend (funciona sem verificação)
const FROM_EMAIL = 'onboarding@resend.dev';

/**
 * 🎉 Notificar sobre novo cadastro
 */
export async function notifyNewSignupEmail(
  userName: string,
  userEmail: string,
  userWhatsapp: string | null,
  restaurantName: string | null,
  restaurantSlug: string | null
) {
  try {
    console.log('📧 Tentando enviar email de novo cadastro...');
    console.log('Para:', ADMIN_EMAIL);
    console.log('De:', FROM_EMAIL);
    console.log('API Key existe?', !!process.env.RESEND_API_KEY);
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🎉 Novo Cadastro - ${userName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #f97316; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; color: #111; margin-top: 5px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎉 Novo Cadastro!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Um novo cliente acabou de se cadastrar</p>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">👤 Nome</div>
                <div class="value">${userName}</div>
              </div>
              
              <div class="info-row">
                <div class="label">📧 Email</div>
                <div class="value">${userEmail}</div>
              </div>
              
              ${userWhatsapp ? `
              <div class="info-row">
                <div class="label">📱 WhatsApp</div>
                <div class="value">${userWhatsapp}</div>
              </div>
              ` : ''}
              
              ${restaurantName ? `
              <div class="info-row">
                <div class="label">🏪 Restaurante</div>
                <div class="value">${restaurantName}</div>
              </div>
              ` : ''}
              
              ${restaurantSlug ? `
              <div class="info-row">
                <div class="label">🔗 Slug</div>
                <div class="value">/${restaurantSlug}</div>
              </div>
              ` : ''}
              
              <div class="info-row">
                <div class="label">⏰ Trial</div>
                <div class="value">30 dias grátis</div>
              </div>
              
              <div class="info-row">
                <div class="label">📅 Data/Hora</div>
                <div class="value">${new Date().toLocaleString('pt-BR')}</div>
              </div>
              
              <div style="text-align: center;">
                <a href="https://virtualcardapio.com.br/admin/usuarios" class="button">
                  Ver no Painel Admin
                </a>
              </div>
            </div>
            <div class="footer">
              <p>Virtual Cardápio - Sistema de Gestão de Restaurantes</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ Email de novo cadastro enviado!');
    console.log('Resultado:', result);
  } catch (error) {
    console.error('❌ Erro ao enviar email de novo cadastro:', error);
    console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
  }
}

/**
 * 💰 Notificar sobre novo pagamento
 */
export async function notifyNewPaymentEmail(
  userName: string,
  userEmail: string,
  plan: string,
  amount: number
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `💰 Novo Pagamento - R$ ${amount.toFixed(2)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; color: #111; margin-top: 5px; }
            .amount { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">💰 Novo Pagamento!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Cliente pagou a assinatura</p>
            </div>
            <div class="content">
              <div class="amount">R$ ${amount.toFixed(2)}</div>
              
              <div class="info-row">
                <div class="label">👤 Nome</div>
                <div class="value">${userName}</div>
              </div>
              
              <div class="info-row">
                <div class="label">📧 Email</div>
                <div class="value">${userEmail}</div>
              </div>
              
              <div class="info-row">
                <div class="label">💳 Plano</div>
                <div class="value">${plan}</div>
              </div>
              
              <div class="info-row">
                <div class="label">📅 Data/Hora</div>
                <div class="value">${new Date().toLocaleString('pt-BR')}</div>
              </div>
              
              <div style="text-align: center;">
                <a href="https://virtualcardapio.com.br/admin/usuarios" class="button">
                  Ver no Painel Admin
                </a>
              </div>
            </div>
            <div class="footer">
              <p>Virtual Cardápio - Sistema de Gestão de Restaurantes</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ Email de novo pagamento enviado para:', ADMIN_EMAIL);
  } catch (error) {
    console.error('❌ Erro ao enviar email de pagamento:', error);
  }
}

/**
 * ❌ Notificar sobre cancelamento
 */
export async function notifyCancellationEmail(
  userName: string,
  userEmail: string,
  daysActive: number
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `❌ Assinatura Cancelada - ${userName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ef4444; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; color: #111; margin-top: 5px; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">❌ Assinatura Cancelada</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Cliente cancelou a assinatura</p>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">👤 Nome</div>
                <div class="value">${userName}</div>
              </div>
              
              <div class="info-row">
                <div class="label">📧 Email</div>
                <div class="value">${userEmail}</div>
              </div>
              
              <div class="info-row">
                <div class="label">⏰ Estava há</div>
                <div class="value">${daysActive} dias</div>
              </div>
              
              <div class="info-row">
                <div class="label">📅 Data/Hora Cancelamento</div>
                <div class="value">${new Date().toLocaleString('pt-BR')}</div>
              </div>
              
              <div style="text-align: center;">
                <a href="https://virtualcardapio.com.br/admin/usuarios" class="button">
                  Ver no Painel Admin
                </a>
              </div>
            </div>
            <div class="footer">
              <p>Virtual Cardápio - Sistema de Gestão de Restaurantes</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ Email de cancelamento enviado para:', ADMIN_EMAIL);
  } catch (error) {
    console.error('❌ Erro ao enviar email de cancelamento:', error);
  }
}

/**
 * ⏰ Notificar sobre trial acabando
 */
export async function notifyTrialEndingEmail(
  userName: string,
  userEmail: string,
  daysLeft: number
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `⏰ Trial Acabando - ${userName} (${daysLeft} dias)`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
            .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; color: #111; margin-top: 5px; }
            .days-left { font-size: 48px; font-weight: bold; color: #f59e0b; text-align: center; margin: 20px 0; }
            .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">⏰ Trial Acabando!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Cliente está próximo do fim do trial</p>
            </div>
            <div class="content">
              <div class="days-left">${daysLeft} dias</div>
              <p style="text-align: center; color: #666; margin-top: 0;">restantes de trial</p>
              
              <div class="info-row">
                <div class="label">👤 Nome</div>
                <div class="value">${userName}</div>
              </div>
              
              <div class="info-row">
                <div class="label">📧 Email</div>
                <div class="value">${userEmail}</div>
              </div>
              
              <div class="info-row">
                <div class="label">💡 Ação Sugerida</div>
                <div class="value">Entre em contato para converter em cliente pagante</div>
              </div>
              
              <div style="text-align: center;">
                <a href="https://virtualcardapio.com.br/admin/usuarios" class="button">
                  Ver no Painel Admin
                </a>
              </div>
            </div>
            <div class="footer">
              <p>Virtual Cardápio - Sistema de Gestão de Restaurantes</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('✅ Email de trial acabando enviado para:', ADMIN_EMAIL);
  } catch (error) {
    console.error('❌ Erro ao enviar email de trial acabando:', error);
  }
}
