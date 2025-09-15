import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado - Admin apenas" }, { status: 403 });
    }

    // Obter dados do corpo da requisição
    const body = await req.json();
    const { userId, plan, days } = body;

    if (!userId || !plan) {
      return NextResponse.json({ error: "userId e plan são obrigatórios" }, { status: 400 });
    }

    // Calcular data de expiração
    const daysToAdd = days || (plan === "free" ? 3 : 30);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + daysToAdd);

    // Desativar assinaturas existentes ativas do usuário
    const { error: deactivateError } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", userId)
      .in("status", ["active", "pending"]);

    if (deactivateError) {
      console.error("Erro ao desativar assinaturas existentes:", deactivateError);
      return NextResponse.json({ error: "Erro ao desativar assinaturas existentes" }, { status: 500 });
    }

    // Criar nova assinatura
    const { data: newSubscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan: plan,
        status: "active",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        payment_method: "admin_grant"
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error("Erro ao criar assinatura:", subscriptionError);
      return NextResponse.json({ error: "Erro ao conceder assinatura" }, { status: 500 });
    }

    return NextResponse.json({
      message: `Assinatura ${plan} concedida com sucesso por ${daysToAdd} dias`,
      subscription: newSubscription
    });

  } catch (error) {
    console.error("Erro na API grant-subscription:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// Endpoint para revogar assinatura
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado - Admin apenas" }, { status: 403 });
    }

    // Obter userId do corpo da requisição
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
    }

    // Cancelar todas as assinaturas ativas do usuário
    const { error: revokeError } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", userId)
      .eq("status", "active");

    if (revokeError) {
      console.error("Erro ao revogar assinatura:", revokeError);
      return NextResponse.json({ error: "Erro ao revogar assinatura" }, { status: 500 });
    }

    return NextResponse.json({ message: "Assinatura revogada com sucesso" });

  } catch (error) {
    console.error("Erro na API grant-subscription DELETE:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}