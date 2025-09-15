import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// POST - upgrade para plano pago (chamado após confirmação do pagamento)
export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { payment_id, payment_method } = body; // Dados do pagamento para auditoria

    // Plano pago: 30 dias
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 30);

    // Primeiro, cancelar assinatura atual se existir
    await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("user_id", user.id)
      .eq("status", "active");

    // Criar nova assinatura paga
    const { data, error } = await supabase
      .from("subscriptions")
      .insert([{
        user_id: user.id,
        plan: "paid",
        status: "active",
        start_date: now.toISOString(),
        end_date: endDate.toISOString()
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    
    return NextResponse.json({
      ...data,
      days_remaining: 30,
      is_expired: false,
      payment_id,
      payment_method
    });
  } catch (error) {
    console.error('Erro ao fazer upgrade:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// GET - verificar se upgrade está disponível
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("end_date", { ascending: false })
    .limit(1)
    .single();

  const canUpgrade = !subscription || subscription.plan === "free";
  const currentPlan = subscription?.plan || "none";
  
  return NextResponse.json({
    can_upgrade: canUpgrade,
    current_plan: currentPlan,
    subscription
  });
}