

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

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

