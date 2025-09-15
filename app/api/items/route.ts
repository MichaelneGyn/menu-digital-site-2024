

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Buscar todos os itens do usuário (via restaurantes que ele possui)
  const { data, error } = await supabase
    .from("items")
    .select(`
      id,
      name,
      description,
      price,
      promo_price,
      is_promo,
      image,
      created_at,
      category:categories(id, name, icon),
      restaurant:restaurants(id, name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro Supabase (GET /items):", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Pega o ID da query string
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID do item é obrigatório" }, { status: 400 });
  }

  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar item:", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Recupera o usuário logado
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Lê o corpo da requisição
  const body = await req.json();
  const {
    name,
    description,
    price,
    promoPrice,
    isPromo,
    image,
    categoryId,
    restaurantId
  } = body;

  // Faz o insert mapeando pro snake_case
  const { data, error } = await supabase
    .from("items")
    .insert([
      {
        name,
        description,
        price,
        promo_price: promoPrice ?? null,
        is_promo: isPromo ?? false,
        image,
        category_id: categoryId,
        restaurant_id: restaurantId,
      }
    ])
    .select()
    .single();

  if (error) {
    console.error("Erro Supabase Items:", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 400 });
  }

  return NextResponse.json(data);
}

