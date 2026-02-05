const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' }); // Carrega .env.local

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando limpeza de notificações inválidas...');

  try {
    // Como o Prisma não deixa nem consultar 'TEST' porque quebra a validação de tipo,
    // vamos usar deleteMany com executeRaw se necessário, ou tentar deletar tudo que não seja válido.
    
    // Na verdade, o erro acontece ao LER. Para deletar, se usarmos o client tipado, ele também vai validar.
    // O jeito é usar $executeRawUnsafe para deletar direto no SQL.
    
    const count = await prisma.$executeRawUnsafe(`
      DELETE FROM "AdminNotification" WHERE "type" = 'TEST';
    `);

    console.log(`✅ ${count} notificações inválidas do tipo 'TEST' foram removidas.`);
  } catch (error) {
    console.error('❌ Erro ao limpar notificações:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();