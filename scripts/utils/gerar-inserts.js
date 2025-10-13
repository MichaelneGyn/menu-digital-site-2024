/**
 * Gera SQL INSERTs para executar manualmente
 */

const { PrismaClient } = require('@prisma/client');

const NEON_URL = "postgresql://neondb_owner:npg_yNdZ2kQMiz7K@ep-bold-waterfall-acoz96nv-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function gerarInserts() {
  console.log('📝 Gerando INSERTs...\n');

  const prisma = new PrismaClient({
    datasources: { db: { url: NEON_URL } }
  });

  try {
    // CATEGORIAS
    const categories = await prisma.category.findMany();
    console.log('-- ========================================');
    console.log('-- CATEGORIAS');
    console.log('-- ========================================\n');
    
    for (const cat of categories) {
      console.log(`INSERT INTO "Category" (id, name, icon, "restaurantId", "createdAt", "updatedAt") VALUES ('${cat.id}', '${cat.name.replace(/'/g, "''")}', '${cat.icon}', '${cat.restaurantId}', '${cat.createdAt.toISOString()}', '${cat.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;`);
    }

    // ITENS DO MENU
    const items = await prisma.menuItem.findMany();
    console.log('\n-- ========================================');
    console.log('-- ITENS DO MENU');
    console.log('-- ========================================\n');
    
    for (const item of items) {
      const desc = item.description ? `'${item.description.replace(/'/g, "''")}'` : 'NULL';
      const img = item.image ? `'${item.image}'` : 'NULL';
      const origPrice = item.originalPrice ? item.originalPrice : 'NULL';
      
      console.log(`INSERT INTO "MenuItem" (id, name, description, price, image, "isPromo", "originalPrice", "restaurantId", "categoryId", "createdAt", "updatedAt") VALUES ('${item.id}', '${item.name.replace(/'/g, "''")}', ${desc}, ${item.price}, ${img}, ${item.isPromo}, ${origPrice}, '${item.restaurantId}', '${item.categoryId}', '${item.createdAt.toISOString()}', '${item.updatedAt.toISOString()}') ON CONFLICT (id) DO NOTHING;`);
    }

    console.log('\n\n✅ SQL gerado! Copie e execute no Supabase SQL Editor.\n');

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

gerarInserts();
