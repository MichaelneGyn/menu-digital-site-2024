// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

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
    console.error("Erro ao buscar vw_admin_users:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.log("Dados retornados da vw_admin_users:", data?.length || 0, "registros");
  
  return NextResponse.json({ users: data || [] });
}