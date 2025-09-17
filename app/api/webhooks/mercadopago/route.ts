import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    
    console.log('MercadoPago webhook received:', event);

    // Verificar se é um evento de pagamento aprovado
    if (event.type === "payment" && event.action === "payment.updated") {
      const paymentId = event.data?.id;
      
      if (!paymentId) {
        console.log('No payment ID found in webhook');
        return NextResponse.json({ error: "No payment ID" }, { status: 400 });
      }

      // Aqui você pode fazer uma chamada para a API do MercadoPago para verificar o status do pagamento
      // Por enquanto, vamos assumir que o pagamento foi aprovado se chegou até aqui
      
      // Extrair user_id dos metadados do pagamento (você precisa configurar isso no frontend)
      const userId = event.data?.metadata?.user_id;
      
      if (!userId) {
        console.log('No user ID found in payment metadata');
        return NextResponse.json({ error: "No user ID in metadata" }, { status: 400 });
      }

      // Atualizar a assinatura do usuário
      const { data, error } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          plan: "basic",
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }

      console.log('Subscription updated successfully for user:', userId);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Para outros tipos de eventos, apenas retornar OK
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Método GET para verificar se o webhook está funcionando
export async function GET() {
  return NextResponse.json({ 
    message: "MercadoPago webhook endpoint is working",
    timestamp: new Date().toISOString()
  });
}