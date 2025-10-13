const bcrypt = require('bcryptjs');

async function gerar() {
  // Gerar 3 hashes diferentes
  const senha1 = 'admin123';
  const senha2 = '123456';
  const senha3 = 'senha123';
  
  const hash1 = await bcrypt.hash(senha1, 10);
  const hash2 = await bcrypt.hash(senha2, 10);
  const hash3 = await bcrypt.hash(senha3, 10);
  
  console.log('\n==============================================');
  console.log('COPIE E EXECUTE NO SUPABASE SQL EDITOR:');
  console.log('==============================================\n');
  
  console.log('-- OPÇÃO 1: Senha = admin123');
  console.log(`UPDATE "User" SET password = '${hash1}' WHERE email = 'michaeldouglasqueiroz@gmail.com';\n`);
  
  console.log('-- OPÇÃO 2: Senha = 123456');
  console.log(`UPDATE "User" SET password = '${hash2}' WHERE email = 'michaeldouglasqueiroz@gmail.com';\n`);
  
  console.log('-- OPÇÃO 3: Senha = senha123');
  console.log(`UPDATE "User" SET password = '${hash3}' WHERE email = 'michaeldouglasqueiroz@gmail.com';\n`);
  
  console.log('==============================================\n');
  console.log('⚠️  ESCOLHA UMA E EXECUTE NO SUPABASE!\n');
  console.log('Depois faça login com a senha correspondente.\n');
}

gerar();
