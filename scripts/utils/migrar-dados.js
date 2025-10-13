/**
 * Script de Migração: Neon → Supabase
 * 
 * Este script:
 * 1. Conecta no banco Neon
 * 2. Exporta todos os dados
 * 3. Conecta no Supabase
 * 4. Importa os dados
 */

const { PrismaClient } = require('@prisma/client');

// URL do Neon (banco origem)
const NEON_URL = "postgresql://neondb_owner:npg_yNdZ2kQMiz7K@ep-bold-waterfall-acoz96nv-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// URL do Supabase (banco destino)
const SUPABASE_URL = "postgresql://postgres.vppvfgmkfrycktsulahd:Mcqs%40%40250%21@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

async function migrar() {
  console.log('🔄 Iniciando migração...\n');

  // Conectar no Neon (origem)
  console.log('📥 Conectando no Neon...');
  const prismaNeon = new PrismaClient({
    datasources: {
      db: { url: NEON_URL }
    }
  });

  // Conectar no Supabase (destino)
  console.log('📤 Conectando no Supabase...');
  const prismaSupabase = new PrismaClient({
    datasources: {
      db: { url: SUPABASE_URL }
    }
  });

  try {
    // 1. EXPORTAR USUÁRIOS
    console.log('\n👤 Exportando usuários...');
    const users = await prismaNeon.user.findMany();
    console.log(`   Encontrados: ${users.length} usuários`);

    // 2. EXPORTAR RESTAURANTES
    console.log('\n🍴 Exportando restaurantes...');
    const restaurants = await prismaNeon.restaurant.findMany();
    console.log(`   Encontrados: ${restaurants.length} restaurantes`);

    // 3. EXPORTAR CATEGORIAS
    console.log('\n📁 Exportando categorias...');
    const categories = await prismaNeon.category.findMany();
    console.log(`   Encontradas: ${categories.length} categorias`);

    // 4. EXPORTAR ITENS DO MENU
    console.log('\n🍕 Exportando itens do menu...');
    const menuItems = await prismaNeon.menuItem.findMany();
    console.log(`   Encontrados: ${menuItems.length} itens`);

    // 5. EXPORTAR PEDIDOS
    console.log('\n🧾 Exportando pedidos...');
    const orders = await prismaNeon.order.findMany({
      select: {
        id: true,
        restaurantId: true,
        code: true,
        status: true,
        total: true,
        createdAt: true,
        updatedAt: true,
        customerAddress: true,
        customerName: true,
        customerPhone: true,
        deliveryAddress: true,
        notes: true,
        paymentMethod: true,
        orderItems: true
      }
    });
    console.log(`   Encontrados: ${orders.length} pedidos`);

    // AGORA IMPORTAR NO SUPABASE
    console.log('\n\n📤 Iniciando importação no Supabase...\n');

    // 1. IMPORTAR USUÁRIOS
    if (users.length > 0) {
      console.log('👤 Importando usuários...');
      for (const user of users) {
        try {
          await prismaSupabase.user.upsert({
            where: { id: user.id },
            update: user,
            create: user
          });
        } catch (err) {
          console.log(`   ⚠️ Erro ao importar usuário ${user.email}: ${err.message}`);
        }
      }
      console.log(`   ✅ ${users.length} usuários importados`);
    }

    // 2. IMPORTAR RESTAURANTES
    if (restaurants.length > 0) {
      console.log('\n🍴 Importando restaurantes...');
      for (const restaurant of restaurants) {
        try {
          await prismaSupabase.restaurant.upsert({
            where: { id: restaurant.id },
            update: restaurant,
            create: restaurant
          });
        } catch (err) {
          console.log(`   ⚠️ Erro ao importar restaurante ${restaurant.name}: ${err.message}`);
        }
      }
      console.log(`   ✅ ${restaurants.length} restaurantes importados`);
    }

    // 3. IMPORTAR CATEGORIAS
    if (categories.length > 0) {
      console.log('\n📁 Importando categorias...');
      for (const category of categories) {
        try {
          await prismaSupabase.category.upsert({
            where: { id: category.id },
            update: category,
            create: category
          });
        } catch (err) {
          console.log(`   ⚠️ Erro ao importar categoria ${category.name}: ${err.message}`);
        }
      }
      console.log(`   ✅ ${categories.length} categorias importadas`);
    }

    // 4. IMPORTAR ITENS DO MENU
    if (menuItems.length > 0) {
      console.log('\n🍕 Importando itens do menu...');
      for (const item of menuItems) {
        try {
          await prismaSupabase.menuItem.upsert({
            where: { id: item.id },
            update: item,
            create: item
          });
        } catch (err) {
          console.log(`   ⚠️ Erro ao importar item ${item.name}: ${err.message}`);
        }
      }
      console.log(`   ✅ ${menuItems.length} itens importados`);
    }

    // 5. IMPORTAR PEDIDOS
    if (orders.length > 0) {
      console.log('\n🧾 Importando pedidos...');
      for (const order of orders) {
        try {
          const { orderItems, ...orderData } = order;
          
          await prismaSupabase.order.upsert({
            where: { id: order.id },
            update: orderData,
            create: orderData
          });

          // Importar itens do pedido
          for (const item of orderItems) {
            await prismaSupabase.orderItem.upsert({
              where: { id: item.id },
              update: item,
              create: item
            });
          }
        } catch (err) {
          console.log(`   ⚠️ Erro ao importar pedido ${order.code}: ${err.message}`);
        }
      }
      console.log(`   ✅ ${orders.length} pedidos importados`);
    }

    console.log('\n\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
    console.log('📊 Resumo:');
    console.log(`   - Usuários: ${users.length}`);
    console.log(`   - Restaurantes: ${restaurants.length}`);
    console.log(`   - Categorias: ${categories.length}`);
    console.log(`   - Itens do menu: ${menuItems.length}`);
    console.log(`   - Pedidos: ${orders.length}`);
    console.log('\n✅ Todos os dados foram migrados para o Supabase!\n');

  } catch (error) {
    console.error('\n❌ ERRO NA MIGRAÇÃO:', error);
  } finally {
    await prismaNeon.$disconnect();
    await prismaSupabase.$disconnect();
  }
}

// Executar migração
migrar();
