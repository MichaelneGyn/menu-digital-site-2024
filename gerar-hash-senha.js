const bcrypt = require('bcryptjs');

async function gerarHash() {
  const senha = 'admin123';
  const hash = await bcrypt.hash(senha, 10);
  
  console.log('\n📝 SQL para atualizar senha no Supabase:\n');
  console.log(`UPDATE "User" SET password = '${hash}' WHERE email = 'michaeldouglasqueiroz@gmail.com';\n`);
  console.log('🔑 Senha definida: admin123\n');
  console.log('⚠️  Copie o SQL acima e execute no Supabase SQL Editor!\n');
}

gerarHash();
