import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente com service role para criar usuários
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  console.log('🔐 Criando usuário de teste no Supabase Auth...');
  
  try {
    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'teste@menudigital.com',
      password: '123456',
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: 'Usuário Teste',
        full_name: 'Usuário Teste'
      }
    });

    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      return;
    }

    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('📧 Email:', data.user.email);
    console.log('🆔 ID:', data.user.id);
    console.log('');
    console.log('🔑 Credenciais de login:');
    console.log('   Email: teste@menudigital.com');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar o script
createTestUser()
  .then(() => {
    console.log('\n🎉 Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro no script:', error);
    process.exit(1);
  });