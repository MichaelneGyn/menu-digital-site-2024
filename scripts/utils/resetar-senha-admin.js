/**
 * Resetar senha do admin no Supabase
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const SUPABASE_URL = "postgresql://postgres.vppvfgmkfrycktsulahd:Mcqs%40%40250%21@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

async function resetarSenha() {
  console.log('🔐 Resetando senha do admin...\n');

  const prisma = new PrismaClient({
    datasources: { db: { url: SUPABASE_URL } }
  });

  try {
    const email = 'michaeldouglasqueiroz@gmail.com';
    const novaSenha = 'admin123'; // MUDE ISSO DEPOIS!
    
    // Gerar hash da nova senha
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    
    // Atualizar usuário
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log('✅ Senha atualizada com sucesso!\n');
    console.log('📧 Email:', email);
    console.log('🔑 Nova senha:', novaSenha);
    console.log('\n⚠️  IMPORTANTE: Troque essa senha depois de fazer login!\n');

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    
    if (error.code === 'P2025') {
      console.log('\n💡 Usuário não encontrado. Vou criar um novo...\n');
      
      const email = 'michaeldouglasqueiroz@gmail.com';
      const senha = 'admin123';
      const hashedPassword = await bcrypt.hash(senha, 10);
      
      const prisma2 = new PrismaClient({
        datasources: { db: { url: SUPABASE_URL } }
      });
      
      const newUser = await prisma2.user.create({
        data: {
          email,
          name: 'Michael Douglas Queiroz',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Usuário admin criado!\n');
      console.log('📧 Email:', email);
      console.log('🔑 Senha:', senha);
      console.log('\n⚠️  Troque essa senha depois de fazer login!\n');
      
      await prisma2.$disconnect();
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetarSenha();
