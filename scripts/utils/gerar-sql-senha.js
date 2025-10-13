const bcrypt = require('bcryptjs');
const fs = require('fs');

async function gerar() {
  const senha = 'admin123';
  const hash = await bcrypt.hash(senha, 10);
  
  const sql = `-- ATUALIZAR SENHA DO ADMIN
-- Senha: ${senha}
-- Hash gerado: ${hash}

UPDATE "User" 
SET password = '${hash}' 
WHERE email = 'michaeldouglasqueiroz@gmail.com';

-- Verificar se foi atualizado:
SELECT email, password FROM "User" WHERE email = 'michaeldouglasqueiroz@gmail.com';
`;
  
  fs.writeFileSync('ATUALIZAR_SENHA.sql', sql);
  
  console.log('✅ Arquivo criado: ATUALIZAR_SENHA.sql');
  console.log('\n📋 Conteúdo:\n');
  console.log(sql);
  console.log('\n🎯 Copie e execute no Supabase SQL Editor!\n');
}

gerar().catch(console.error);
