import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ludfeemuwrxjhiqcjywx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZGZlZW11d3J4amhpcWNqeXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgwNDUyOCwiZXhwIjoyMDczMzgwNTI4fQ.T7MJcQ86vx979qqR12bwMhbXZ4JnjfT1o6hY-cp7BIs'

// Usar service role key para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createDiSardaPizzaria() {
  try {
    console.log('🍕 Criando Di Sarda Pizzaria no Supabase...');

    // 1. Usar um UUID fixo para o owner_id (pode ser qualquer UUID válido)
    const ownerId = '00000000-0000-0000-0000-000000000001';
    
    console.log('✅ Usando owner_id fixo:', ownerId);

    // 2. Criar o restaurante
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .insert({
        name: 'Di Sarda Pizzaria',
        slug: 'di-sarda-pizzaria',
        phone: '(62) 3593-5578',
        address: 'Jardim Hesperia, Goiânia - GO',
        whatsapp: '(62) 0001-0901',
        owner_id: ownerId
      })
      .select()
      .single();

    if (restaurantError) {
      console.error('Erro ao criar restaurante:', restaurantError);
      return;
    }

    console.log('✅ Restaurante criado:', restaurant.name);

    // 3. Criar categorias
    const categories = [
      { name: 'Promoções', icon: '🎉', description: 'Combos e promoções especiais' },
      { name: 'Entradas', icon: '🥘', description: 'Deliciosas entradas para começar bem' },
      { name: 'Pizzas', icon: '🍕', description: 'Nossas famosas pizzas artesanais' },
      { name: 'Massas', icon: '🍝', description: 'Massas frescas e saborosas' },
      { name: 'Saladas', icon: '🥗', description: 'Saladas frescas e nutritivas' },
      { name: 'Sobremesas', icon: '🍰', description: 'Doces irresistíveis' },
      { name: 'Bebidas', icon: '🥤', description: 'Bebidas geladas e refrescantes' }
    ];

    for (const [index, categoryData] of categories.entries()) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          icon: categoryData.icon,
          description: categoryData.description,
          sort_order: index,
          restaurant_id: restaurant.id,
          is_active: true
        })
        .select()
        .single();

      if (categoryError) {
        console.error(`Erro ao criar categoria ${categoryData.name}:`, categoryError);
        continue;
      }

      console.log(`✅ Categoria criada: ${category.name}`);

      // 4. Criar alguns itens de exemplo para cada categoria
      if (categoryData.name === 'Pizzas') {
        const pizzaItems = [
          {
            name: 'Pizza Margherita',
            description: 'Molho de tomate, mussarela, manjericão fresco',
            price: 32.90,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
          },
          {
            name: 'Pizza Calabresa',
            description: 'Molho de tomate, mussarela, calabresa, cebola',
            price: 35.90,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
          },
          {
            name: 'Pizza Portuguesa',
            description: 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitona',
            price: 38.90,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
          }
        ];

        for (const [itemIndex, item] of pizzaItems.entries()) {
          await supabase
            .from('items')
            .insert({
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              category_id: category.id,
              restaurant_id: restaurant.id,
              sort_order: itemIndex,
              is_active: true
            });
        }
      }

      if (categoryData.name === 'Bebidas') {
        const bebidaItems = [
          {
            name: 'Coca-Cola 350ml',
            description: 'Refrigerante gelado',
            price: 4.50,
            image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400'
          },
          {
            name: 'Suco de Laranja 300ml',
            description: 'Suco natural de laranja',
            price: 6.90,
            image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'
          }
        ];

        for (const [itemIndex, item] of bebidaItems.entries()) {
          await supabase
            .from('items')
            .insert({
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              category_id: category.id,
              restaurant_id: restaurant.id,
              sort_order: itemIndex,
              is_active: true
            });
        }
      }
    }

    console.log('🎉 Di Sarda Pizzaria criada com sucesso no Supabase!');
    console.log(`📍 URL: https://menu-digital-site-urfhx.vercel.app/di-sarda-pizzaria`);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

createDiSardaPizzaria();