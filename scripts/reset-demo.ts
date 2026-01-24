/**
 * Script para resetar dados do usuário DEMO
 * Executar: npx tsx scripts/reset-demo.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDemo() {
  console.log('🔄 Resetando dados da demonstração...\n');

  try {
    // Buscar usuário demo
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@virtualcardapio.com' },
      include: { restaurants: true },
    });

    if (!demoUser) {
      console.log('⚠️  Usuário demo não encontrado!');
      console.log('💡 Execute: npx tsx scripts/create-demo-user.ts\n');
      return;
    }

    const demoRestaurant = demoUser.restaurants[0];

    if (!demoRestaurant) {
      console.log('⚠️  Restaurante demo não encontrado!');
      return;
    }

    console.log('🗑️  Deletando pedidos...');
    const deletedOrders = await prisma.order.deleteMany({
      where: { restaurantId: demoRestaurant.id },
    });
    console.log(`✅ ${deletedOrders.count} pedidos deletados`);

    console.log('🗑️  Deletando produtos...');
    const deletedProducts = await prisma.menuItem.deleteMany({
      where: { restaurantId: demoRestaurant.id },
    });
    console.log(`✅ ${deletedProducts.count} produtos deletados`);

    console.log('🗑️  Deletando categorias...');
    const deletedCategories = await prisma.category.deleteMany({
      where: { restaurantId: demoRestaurant.id },
    });
    console.log(`✅ ${deletedCategories.count} categorias deletadas\n`);

    console.log('🎯 Recriando dados de demonstração...\n');

    // Recriar categorias
    const pizzasCategory = await prisma.category.create({
      data: {
        name: 'Pizzas',
        restaurantId: demoRestaurant.id,
        sortOrder: 1,
        icon: '🍕',
      },
    });

    const bebidasCategory = await prisma.category.create({
      data: {
        name: 'Bebidas',
        restaurantId: demoRestaurant.id,
        sortOrder: 2,
        icon: '🥤',
      },
    });

    console.log('✅ Categorias recriadas');

    // Recriar produtos
    const products = [
        {
          name: 'Pizza Margherita',
          description: 'Molho de tomate, mussarela, manjericão fresco',
          price: 45.90,
          categoryId: pizzasCategory.id,
          restaurantId: demoRestaurant.id,
          isActive: true,
          image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
        },
        {
          name: 'Pizza Calabresa',
          description: 'Molho de tomate, mussarela, calabresa, cebola',
          price: 49.90,
          categoryId: pizzasCategory.id,
          restaurantId: demoRestaurant.id,
          isActive: true,
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        },
        {
          name: 'Pizza Portuguesa',
          description: 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitona',
          price: 52.90,
          categoryId: pizzasCategory.id,
          restaurantId: demoRestaurant.id,
          isActive: true,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
        },
        {
          name: 'Coca-Cola 2L',
          description: 'Refrigerante Coca-Cola 2 litros',
          price: 12.00,
          categoryId: bebidasCategory.id,
          restaurantId: demoRestaurant.id,
          isActive: true,
          image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500',
        },
        {
          name: 'Suco Natural 500ml',
          description: 'Suco natural de laranja',
          price: 8.00,
          categoryId: bebidasCategory.id,
          restaurantId: demoRestaurant.id,
          isActive: true,
          image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
        },
    ];

    // Criar produtos um por um
    for (const productData of products) {
      await prisma.menuItem.create({
        data: productData,
      });
    }

    console.log('✅ Produtos recriados\n');

    console.log('🎉 RESET COMPLETO!\n');
    console.log('📋 Demonstração resetada para estado inicial');
    console.log('📧 Email: demo@virtualcardapio.com');
    console.log('🔑 Senha: demo123\n');

  } catch (error) {
    console.error('❌ Erro ao resetar demo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
resetDemo()
  .then(() => {
    console.log('✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
