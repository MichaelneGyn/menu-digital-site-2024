import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente com service role para criar assinaturas
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTrialSubscription() {
  const userEmail = 'teste@menudigital.com';
  
  try {
    console.log(`🔍 Procurando usuário: ${userEmail}`);
    
    // 1. Buscar o usuário pelo email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Erro ao buscar usuários:', userError);
      return;
    }
    
    const user = users.users.find(u => u.email === userEmail);
    
    if (!user) {
      console.error(`❌ Usuário não encontrado: ${userEmail}`);
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.id}`);
    
    // 2. Verificar se já tem assinatura ativa
    const { data: existingSubscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    if (subError) {
      console.error('❌ Erro ao verificar assinaturas:', subError);
      return;
    }
    
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      console.log('⚠️ Usuário já possui assinatura ativa:', existingSubscriptions[0]);
      return;
    }
    
    // 3. Criar nova assinatura trial de 3 dias
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    
    const { data: newSubscription, error: createError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: 'free',
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erro ao criar assinatura:', createError);
      return;
    }
    
    console.log('🎉 Assinatura trial criada com sucesso!');
    console.log('📋 Detalhes:', {
      id: newSubscription.id,
      user_id: newSubscription.user_id,
      plan: newSubscription.plan,
      status: newSubscription.status,
      start_date: newSubscription.start_date,
      end_date: newSubscription.end_date
    });
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
createTrialSubscription()
  .then(() => {
    console.log('\n🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  });