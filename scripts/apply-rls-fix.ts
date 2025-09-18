import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ludfeemuwrxjhiqcjywx.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZGZlZW11d3J4amhpcWNqeXd4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzgwNDUyOCwiZXhwIjoyMDczMzgwNTI4fQ.T7MJcQ86vx979qqR12bwMhbXZ4JnjfT1o6hY-cp7BIs'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSPolicy() {
  console.log('🔧 Corrigindo política RLS para permitir visualização pública...')
  
  try {
    // Dropar política restritiva existente
    const dropPolicy = `
      DROP POLICY IF EXISTS "Users can view own restaurants" ON public.restaurants;
    `
    
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropPolicy 
    })
    
    if (dropError) {
      console.log('⚠️ Erro ao dropar política (pode não existir):', dropError.message)
    } else {
      console.log('✅ Política restritiva removida')
    }
    
    // Criar nova política pública
    const createPolicy = `
      CREATE POLICY "Public can view restaurants"
      ON public.restaurants FOR SELECT
      USING (true);
    `
    
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createPolicy 
    })
    
    if (createError) {
      console.error('❌ Erro ao criar nova política:', createError)
      return
    }
    
    console.log('✅ Nova política pública criada com sucesso!')
    
    // Verificar se funcionou
    console.log('\n🧪 Testando acesso público...')
    const publicSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1ZGZlZW11d3J4amhpcWNqeXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDQ1MjgsImV4cCI6MjA3MzM4MDUyOH0.nUZyvOBFoqB3B5ZVJycmANtSm9Ii2bdsjN01VWbHEI0')
    
    const { data: testData, error: testError } = await publicSupabase
      .from('restaurants')
      .select('*')
      .eq('slug', 'di-sarda-pizzaria')
    
    if (testError) {
      console.error('❌ Teste falhou:', testError)
    } else if (testData && testData.length > 0) {
      console.log('🎉 Sucesso! Restaurante agora é visível publicamente')
      console.log('Restaurante encontrado:', testData[0].name)
    } else {
      console.log('⚠️ Restaurante ainda não visível')
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error)
  }
}

fixRLSPolicy()