// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Confere se é admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  // Busca da VIEW vw_admin_users
  const { data, error } = await supabase
    .from("vw_admin_users")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Confere se é admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, action, plan, days } = body;

    if (action === 'grant_access') {
      // Criar ou atualizar assinatura
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: plan,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString()
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Acesso concedido com sucesso' });

    } else if (action === 'revoke_access') {
      // Revogar assinatura (definir end_date como agora)
      const { error } = await supabase
        .from('subscriptions')
        .update({ end_date: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Acesso revogado com sucesso' });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });

  } catch (error) {
    console.error('Erro ao processar ação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}