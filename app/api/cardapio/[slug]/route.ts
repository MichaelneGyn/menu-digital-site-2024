import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest, 
  { params }: { params: { slug: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const { slug } = params;

  try {
    // Buscar restaurante pelo slug
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select(`
        id,
        name,
        slug,
        phone,
        whatsapp,
        address,
        description,
        delivery_fee,
        min_order_value,
        open_time,
        close_time,
        working_days,
        primary_color,
        secondary_color,
        logo_url,
        banner_url,
        theme,
        show_delivery_time,
        show_ratings,
        categories (
          id,
          name,
          icon,
          items (
            id,
            name,
            description,
            price,
            original_price,
            image,
            is_promo,
            promo_tag,
            is_active
          )
        )
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: "Restaurante não encontrado" }, 
        { status: 404 }
      );
    }

    // Filtrar apenas categorias e itens ativos
    const filteredRestaurant = {
      ...restaurant,
      categories: restaurant.categories
        .filter((category: any) => category.items && category.items.length > 0)
        .map((category: any) => ({
          ...category,
          items: category.items.filter((item: any) => item.is_active !== false)
        }))
    };

    return NextResponse.json(filteredRestaurant);
  } catch (error) {
    console.error("Erro ao buscar cardápio:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    );
  }
}