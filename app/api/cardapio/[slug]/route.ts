import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest, 
  { params }: { params: { slug: string } }
) {
  // Usar cliente do Supabase com chave de serviço para acesso público
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { slug } = params;

  console.log("API Cardapio: Buscando restaurante com slug:", slug);

  try {
    // Primeiro buscar apenas o restaurante
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select(`
        id,
        name,
        slug,
        phone,
        whatsapp,
        address
      `)
      .eq("slug", slug)
      .single();

    console.log("API Cardapio: Resultado da busca do restaurante:", { restaurant, error: restaurantError });

    if (restaurantError || !restaurant) {
      console.log("API Cardapio: Restaurante não encontrado");
      return NextResponse.json(
        { error: "Restaurante não encontrado" },
        { status: 404 }
      );
    }

    // Buscar categorias do restaurante
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        icon
      `)
      .eq("restaurant_id", restaurant.id);

    console.log("API Cardapio: Categorias encontradas:", { categories, error: categoriesError });

    // Buscar items de cada categoria
    let categoriesWithItems = [];
    if (categories && categories.length > 0) {
      for (const category of categories) {
        const { data: items, error: itemsError } = await supabase
          .from("items")
          .select(`
            id,
            name,
            description,
            price,
            image,
            is_promo
          `)
          .eq("category_id", category.id);

        categoriesWithItems.push({
          ...category,
          items: items || []
        });
      }
    }

    const result = {
      ...restaurant,
      categories: categoriesWithItems
    };

    console.log("API Cardapio: Retornando resultado:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar cardápio:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    );
  }
}