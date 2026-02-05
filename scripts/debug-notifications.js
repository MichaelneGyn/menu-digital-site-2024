const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🕵️ Iniciando investigação profunda de notificações...');

  try {
    // Força o cast para TEXT para evitar erro de validação do Prisma se o valor for inválido
    const results = await prisma.$queryRawUnsafe(`
      SELECT id, type::text as type_str, message FROM "AdminNotification"
    `);

    console.log(`📊 Total de notificações encontradas: ${results.length}`);
    
    const validTypes = ['NEW_SIGNUP', 'PAYMENT_RECEIVED', 'TRIAL_ENDING', 'SUBSCRIPTION_CANCELED'];
    let deletedCount = 0;

    for (const n of results) {
        console.log(`ID: ${n.id} | Type: ${n.type_str} | Msg: ${n.message ? n.message.substring(0, 20) + '...' : 'Sem msg'}`);
        
        if (!validTypes.includes(n.type_str)) {
            console.log(`🚨 ENCONTRADO TIPO INVÁLIDO: '${n.type_str}' no ID ${n.id}`);
            
            await prisma.$executeRawUnsafe(`
                DELETE FROM "AdminNotification" WHERE id = '${n.id}'
            `);
            console.log(`🗑️ Deletado com sucesso.`);
            deletedCount++;
        }
    }

    if (deletedCount === 0) {
        console.log('✅ Nenhuma notificação inválida encontrada (via cast text).');
    } else {
        console.log(`🧹 Limpeza concluída. ${deletedCount} registros removidos.`);
    }

  } catch (error) {
    console.error('❌ Erro fatal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();