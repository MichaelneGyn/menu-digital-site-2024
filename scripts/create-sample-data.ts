import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ludfeemuwrxjhiqcjywx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZGZlZW11d3J4amhpcWNqeXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgwNDUyOCwiZXhwIjoyMDczMzgwNTI4fQ.T7MJcQ86vx979qqR12bwMhbXZ4JnjfT1o6hY-cp7BIs'
);

async function createSampleData() {
  console.log('🍕 Criando dados de exemplo para DI Sarda Pizzaria...');
  
  const restaurantId = 'b90c75c3-35ec-439b-a753-0e537beef4a6';
  
  // Criar categorias
  const categories = [
    {
      name: 'Pizzas Tradicionais',
      icon: '🍕',
      restaurant_id: restaurantId
    },
    {
      name: 'Pizzas Especiais',
      icon: '🍕',
      restaurant_id: restaurantId
    },
    {
      name: 'Bebidas',
      icon: '🥤',
      restaurant_id: restaurantId
    }
  ];

  console.log('📂 Inserindo categorias...');
  const { data: insertedCategories, error: categoriesError } = await supabase
    .from('categories')
    .insert(categories)
    .select();

  if (categoriesError) {
    console.error('❌ Erro ao inserir categorias:', categoriesError);
    return;
  }

  console.log('✅ Categorias criadas:', insertedCategories?.length);

  // Criar items para cada categoria
  if (insertedCategories && insertedCategories.length > 0) {
    const pizzasTradicionaisId = insertedCategories.find(c => c.name === 'Pizzas Tradicionais')?.id;
    const pizzasEspeciaisId = insertedCategories.find(c => c.name === 'Pizzas Especiais')?.id;
    const bebidasId = insertedCategories.find(c => c.name === 'Bebidas')?.id;

    const items = [
      // Pizzas Tradicionais
      {
        name: 'Pizza Margherita',
        description: 'Molho de tomate, mussarela, manjericão e azeite',
        price: 35.90,
        category_id: pizzasTradicionaisId,
        is_promo: false
      },
      {
        name: 'Pizza Calabresa',
        description: 'Molho de tomate, mussarela, calabresa e cebola',
        price: 38.90,
        category_id: pizzasTradicionaisId,
        is_promo: false
      },
      {
        name: 'Pizza Portuguesa',
        description: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitona',
        price: 42.90,
        category_id: pizzasTradicionaisId,
        is_promo: false
      },
      // Pizzas Especiais
      {
        name: 'Pizza Quattro Formaggi',
        description: 'Molho branco, mussarela, gorgonzola, parmesão e provolone',
        price: 48.90,
        category_id: pizzasEspeciaisId,
        is_promo: true
      },
      {
        name: 'Pizza Salmão',
        description: 'Molho branco, mussarela, salmão, alcaparras e rúcula',
        price: 55.90,
        category_id: pizzasEspeciaisId,
        is_promo: false
      },
      // Bebidas
      {
        name: 'Coca-Cola 350ml',
        description: 'Refrigerante de cola gelado',
        price: 5.50,
        category_id: bebidasId,
        is_promo: false
      },
      {
        name: 'Água Mineral 500ml',
        description: 'Água mineral natural',
        price: 3.50,
        category_id: bebidasId,
        is_promo: false
      },
      {
        name: 'Suco de Laranja 300ml',
        description: 'Suco natural de laranja',
        price: 8.90,
        category_id: bebidasId,
        is_promo: false
      }
    ];

    console.log('🍽️ Inserindo items...');
    const { data: insertedItems, error: itemsError } = await supabase
      .from('items')
      .insert(items)
      .select();

    if (itemsError) {
      console.error('❌ Erro ao inserir items:', itemsError);
      return;
    }

    console.log('✅ Items criados:', insertedItems?.length);
  }

  console.log('🎉 Dados de exemplo criados com sucesso!');
}

createSampleData().catch(console.error);