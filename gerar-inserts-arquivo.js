/**
 * Gera SQL INSERTs e salva em arquivo
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const NEON_URL = "postgresql://neondb_owner:npg_yNdZ2kQMiz7K@ep-bold-waterfall-acoz96nv-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function gerarInserts() {
  console.log('📝 Gerando INSERTs em arquivo...\n');

  const prisma = new PrismaClient({
    datasources: { db: { url: NEON_URL } }
  });

  let sql = '';

  try {
    // CATEGORIAS
    const categories = await prisma.category.findMany();
    sql += '-- ========================================\n';
    sql += '-- CATEGORIAS\n';
    sql += '-- ========================================\n\n';
    
    for (const cat of categories) {
      sql += `INSERT INTO "Category" (id, name, icon, "restaurantId", "createdAt", "updatedAt") VALUES ('${cat.id}', '${cat.name.replace(/'/g, "''")}', '${cat.icon}', '${cat.restaurantId}', '${cat.createdAt.toISOString()}', '${cat.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }

    // ITENS DO MENU
    const items = await prisma.menuItem.findMany();
    sql += '\n-- ========================================\n';
    sql += '-- ITENS DO MENU\n';
    sql += '-- ========================================\n\n';
    
    for (const item of items) {
      const desc = item.description ? `'${item.description.replace(/'/g, "''")}'` : 'NULL';
      const img = item.image ? `'${item.image}'` : 'NULL';
      const origPrice = item.originalPrice ? item.originalPrice : 'NULL';
      
      sql += `INSERT INTO "MenuItem" (id, name, description, price, image, "isPromo", "originalPrice", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES ('${item.id}', '${item.name.replace(/'/g, "''")}', ${desc}, ${item.price}, ${img}, ${item.isPromo}, ${origPrice}, '${item.restaurantId}', '${item.categoryId}', '${item.createdAt.toISOString()}', '${item.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;\n`;
    }

    // Salvar em arquivo
    fs.writeFileSync('IMPORTAR_NO_SUPABASE.sql', sql);

    console.log('✅ Arquivo SQL gerado: IMPORTAR_NO_SUPABASE.sql\n');
    console.log(`📊 Resumo:`);
    console.log(`   - ${categories.length} categorias`);
    console.log(`   - ${items.length} itens do menu`);
    console.log('\n📋 Próximo passo:');
    console.log('   1. Abra o arquivo IMPORTAR_NO_SUPABASE.sql');
    console.log('   2. Copie todo o conteúdo');
    console.log('   3. Cole no Supabase SQL Editor');
    console.log('   4. Clique em RUN ▶️\n');

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

gerarInserts();
