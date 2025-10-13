/**
 * Script de Re-importação Forçada
 * Importa APENAS categorias e itens do menu
 */

const { PrismaClient } = require('@prisma/client');

const NEON_URL = "postgresql://neondb_owner:npg_yNdZ2kQMiz7K@ep-bold-waterfall-acoz96nv-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const SUPABASE_URL = "postgresql://postgres.vppvfgmkfrycktsulahd:Mcqs%40%40250%21@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

async function reimportar() {
  console.log('🔄 Reimportando dados...\n');

  const prismaNeon = new PrismaClient({
    datasources: { db: { url: NEON_URL } }
  });

  const prismaSupabase = new PrismaClient({
    datasources: { db: { url: SUPABASE_URL } }
  });

  try {
    // 1. BUSCAR CATEGORIAS DO NEON
    console.log('📁 Buscando categorias no Neon...');
    const categories = await prismaNeon.category.findMany();
    console.log(`   Encontradas: ${categories.length} categorias`);
    
    if (categories.length > 0) {
      console.log('\n📥 Importando categorias no Supabase...');
      for (const cat of categories) {
        try {
          await prismaSupabase.category.create({
            data: {
              id: cat.id,
              name: cat.name,
              icon: cat.icon,
              restaurantId: cat.restaurantId,
              createdAt: cat.createdAt,
              updatedAt: cat.updatedAt
            }
          });
          console.log(`   ✅ ${cat.name}`);
        } catch (err) {
          if (err.code === 'P2002') {
            console.log(`   ⚠️  ${cat.name} (já existe)`);
          } else {
            console.log(`   ❌ ${cat.name}: ${err.message}`);
          }
        }
      }
    }

    // 2. BUSCAR ITENS DO MENU DO NEON
    console.log('\n🍕 Buscando itens do menu no Neon...');
    const items = await prismaNeon.menuItem.findMany();
    console.log(`   Encontrados: ${items.length} itens`);

    if (items.length > 0) {
      console.log('\n📥 Importando itens no Supabase...');
      for (const item of items) {
        try {
          await prismaSupabase.menuItem.create({
            data: {
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image,
              isPromo: item.isPromo,
              originalPrice: item.originalPrice,
              restaurantId: item.restaurantId,
              categoryId: item.categoryId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            }
          });
          console.log(`   ✅ ${item.name} - R$ ${item.price}`);
        } catch (err) {
          if (err.code === 'P2002') {
            console.log(`   ⚠️  ${item.name} (já existe)`);
          } else {
            console.log(`   ❌ ${item.name}: ${err.message}`);
          }
        }
      }
    }

    console.log('\n\n🎉 REIMPORTAÇÃO CONCLUÍDA!\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error);
  } finally {
    await prismaNeon.$disconnect();
    await prismaSupabase.$disconnect();
  }
}

reimportar();
