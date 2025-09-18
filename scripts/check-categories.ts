import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ludfeemuwrxjhiqcjywx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZGZlZW11d3J4amhpcWNqeXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgwNDUyOCwiZXhwIjoyMDczMzgwNTI4fQ.T7MJcQ86vx979qqR12bwMhbXZ4JnjfT1o6hY-cp7BIs'
);

async function checkCategories() {
  console.log('🔍 Verificando categorias do restaurante...');
  
  const restaurantId = 'b90c75c3-35ec-439b-a753-0e537beef4a6';
  
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId);
  
  console.log('📊 Resultado da busca de categorias:');
  console.log('Total de categorias encontradas:', categories?.length || 0);
  
  if (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    return;
  }
  
  if (categories && categories.length > 0) {
    console.log('✅ Primeira categoria:', JSON.stringify(categories[0], null, 2));
    
    // Buscar items da primeira categoria
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('category_id', categories[0].id);
    
    console.log('📦 Items na primeira categoria:', items?.length || 0);
    
    if (itemsError) {
      console.error('❌ Erro ao buscar items:', itemsError);
    } else if (items && items.length > 0) {
      console.log('✅ Primeiro item:', JSON.stringify(items[0], null, 2));
    }
  } else {
    console.log('⚠️ Nenhuma categoria encontrada para este restaurante');
  }
}

checkCategories().catch(console.error);