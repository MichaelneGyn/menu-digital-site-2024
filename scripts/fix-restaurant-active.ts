import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRestaurantActive() {
  console.log('🔧 Adicionando campo is_active=true ao restaurante DI Sarda...')
  
  try {
    // Atualizar o restaurante para ter is_active = true
    const { data, error } = await supabase
      .from('restaurants')
      .update({ is_active: true })
      .eq('slug', 'di-sarda-pizzaria')
      .select()

    if (error) {
      console.error('❌ Erro ao atualizar restaurante:', error)
      return
    }

    console.log('✅ Restaurante atualizado com sucesso:')
    console.log(JSON.stringify(data, null, 2))

    // Verificar se agora funciona com o filtro is_active
    console.log('\n🔍 Testando busca com filtro is_active=true...')
    
    const { data: testData, error: testError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', 'di-sarda-pizzaria')
      .eq('is_active', true)
      .single()

    if (testError) {
      console.error('❌ Erro no teste:', testError)
      return
    }

    console.log('✅ Teste bem-sucedido! Restaurante encontrado com is_active=true:')
    console.log(JSON.stringify(testData, null, 2))

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

fixRestaurantActive()