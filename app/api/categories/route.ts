

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Se atualizar depois, pode filtrar por restaurante do usuário logado
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon, restaurant_id")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies }); // 👈 importante

  // recupera o usuário logado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, icon, restaurant_id } = body;

  if (!restaurant_id) {
    return NextResponse.json({ error: "restaurant_id é obrigatório" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, icon, restaurant_id }])
    .select()
    .single();

  if (error) {
    console.error("Erro Supabase:", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 400 });
  }

  return NextResponse.json(data);
}

