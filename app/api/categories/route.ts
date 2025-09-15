

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Buscar o restaurante do usuário logado
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 });
  }

  // Filtrar categorias apenas do restaurante do usuário logado
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon, restaurant_id")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  // recupera o usuário logado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Buscar o restaurante do usuário logado
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (restaurantError || !restaurant) {
    return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const { name, icon } = body;

  // Sempre usar o restaurant_id do usuário logado (não confiar no frontend)
  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, icon, restaurant_id: restaurant.id }])
    .select()
    .single();

  if (error) {
    console.error("Erro Supabase:", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 400 });
  }

  return NextResponse.json(data);
}

