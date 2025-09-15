import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET - Listar todos os usuários e suas assinaturas (apenas para admins)
export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Verificar se é admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado - apenas administradores" }, { status: 403 });
  }

  try {
    // Buscar dados da VIEW administrativa
    const { data, error } = await supabase
      .from("vw_admin_users_subscriptions")
      .select("*")
      .order("user_created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar usuários e assinaturas:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Estatísticas resumidas
    const stats = {
      total_usuarios: data?.length || 0,
      usuarios_trial: data?.filter(u => u.status_assinatura === 'trial').length || 0,
      usuarios_pagos: data?.filter(u => u.status_assinatura === 'paga').length || 0,
      usuarios_expirados: data?.filter(u => u.status_assinatura === 'expirada').length || 0,
      usuarios_sem_assinatura: data?.filter(u => u.status_assinatura === 'sem_assinatura').length || 0
    };

    return NextResponse.json({
      success: true,
      stats,
      users: data || []
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json({ 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}