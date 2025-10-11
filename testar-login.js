/**
 * Teste de Login - Verifica se senha e hash estão funcionando
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = "postgresql://postgres.vppvfgmkfrycktsulahd:Mcqs%40%40250%21@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

async function testarLogin() {
  console.log('\n🧪 TESTE DE LOGIN\n');

  const prisma = new PrismaClient({
    datasources: { db: { url: SUPABASE_URL } }
  });

  try {
    const email = 'michaeldouglasqueiroz@gmail.com';
    const senhaDigitada = 'admin123';

    console.log('📧 Email:', email);
    console.log('🔑 Senha digitada:', senhaDigitada);
    console.log('\n🔍 Buscando usuário no Supabase...');

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Usuário NÃO encontrado!\n');
      return;
    }

    console.log('✅ Usuário encontrado!');
    console.log('   Nome:', user.name);
    console.log('   Email:', user.email);
    console.log('\n🔐 Hash no banco:', user.password);

    if (!user.password) {
      console.log('❌ Usuário não tem senha cadastrada!\n');
      return;
    }

    console.log('\n🧪 Testando bcrypt.compare()...');
    const isValid = await bcrypt.compare(senhaDigitada, user.password);

    console.log('\n📊 RESULTADO:');
    if (isValid) {
      console.log('✅ ✅ ✅ SENHA CORRETA! Login deveria funcionar!\n');
    } else {
      console.log('❌ ❌ ❌ SENHA INCORRETA! Há algo errado!\n');
      
      // Vamos gerar um novo hash para comparar
      console.log('🔧 Gerando novo hash da senha "admin123"...');
      const novoHash = await bcrypt.hash(senhaDigitada, 10);
      console.log('   Novo hash:', novoHash);
      
      console.log('\n🧪 Testando com o novo hash...');
      const testeNovoHash = await bcrypt.compare(senhaDigitada, novoHash);
      console.log('   Resultado:', testeNovoHash ? '✅ OK' : '❌ FALHOU');
      
      if (testeNovoHash) {
        console.log('\n💡 O hash no banco está ERRADO!');
        console.log('   Execute este SQL no Supabase:');
        console.log(`   UPDATE "User" SET password = '${novoHash}' WHERE email = '${email}';\n`);
      }
    }

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testarLogin();
