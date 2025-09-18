import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ludfeemuwrxjhiqcjywx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZGZlZW11d3J4amhpcWNqeXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgwNDUyOCwiZXhwIjoyMDczMzgwNTI4fQ.T7MJcQ86vx979qqR12bwMhbXZ4JnjfT1o6hY-cp7BIs'

// Usar service role key para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRestaurant() {
  console.log('🔍 Verificando restaurante no Supabase...')
  
  try {
    // Verificar se o restaurante existe
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', 'di-sarda-pizzaria')
    
    if (error) {
      console.error('❌ Erro ao buscar restaurante:', error)
      return
    }
    
    console.log('📊 Resultado da busca:')
    console.log('Total de restaurantes encontrados:', restaurants?.length || 0)
    
    if (restaurants && restaurants.length > 0) {
      console.log('✅ Restaurante encontrado:')
      console.log(JSON.stringify(restaurants[0], null, 2))
    } else {
      console.log('❌ Nenhum restaurante encontrado com slug "di-sarda-pizzaria"')
      
      // Vamos listar todos os restaurantes para ver o que existe
      console.log('\n📋 Listando todos os restaurantes:')
      const { data: allRestaurants } = await supabase
        .from('restaurants')
        .select('id, name, slug')
      
      if (allRestaurants && allRestaurants.length > 0) {
        allRestaurants.forEach((restaurant, index) => {
          console.log(`${index + 1}. ${restaurant.name} (slug: ${restaurant.slug})`)
        })
      } else {
        console.log('Nenhum restaurante encontrado na tabela')
      }
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error)
  }
}

checkRestaurant()