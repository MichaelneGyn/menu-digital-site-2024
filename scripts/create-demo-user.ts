/**
 * Script para criar usuário DEMO
 * Executar: npx tsx scripts/create-demo-user.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDemoUser() {
  console.log('🎯 Criando usuário DEMO...\n');

  try {
    // Verificar se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@virtualcardapio.com' },
    });

    if (existingUser) {
      console.log('⚠️  Usuário demo já existe!');
      console.log('📧 Email: demo@virtualcardapio.com');
      console.log('🔑 Senha: demo123\n');
      
      // Atualizar senha caso tenha mudado
      const hashedPassword = await bcrypt.hash('demo123', 10);
      await prisma.user.update({
        where: { email: 'demo@virtualcardapio.com' },
        data: { password: hashedPassword },
      });
      
      console.log('✅ Senha atualizada com sucesso!');
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Criar usuário demo
    const demoUser = await prisma.user.create({
      data: {
        name: 'Usuário Demo',
        email: 'demo@virtualcardapio.com',
        password: hashedPassword,
      },
    });

    console.log('✅ Usuário demo criado com sucesso!\n');
    console.log('📋 Credenciais de acesso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: demo@virtualcardapio.com');
    console.log('🔑 Senha: demo123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Criar restaurante demo
    console.log('🍕 Criando restaurante demo...');
    
    const demoRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Restaurante Demo',
        slug: 'demo',
        userId: demoUser.id,
        whatsapp: '(11) 99999-9999',
        address: 'Rua Demo, 123',
        deliveryFee: 5.00,
        minOrderValue: 20.00,
        primaryColor: '#FF6B35',
        isActive: true,
      },
    });

    console.log('✅ Restaurante demo criado!\n');

    // Criar categorias demo
    console.log('📁 Criando categorias demo...');
    
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

    console.log('✅ Categorias criadas!\n');

    // Criar produtos demo
    console.log('🍽️  Criando produtos demo...');
    
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

    console.log('✅ Produtos criados!\n');

    console.log('🎉 SETUP COMPLETO!\n');
    console.log('📱 Acesse o painel admin:');
    console.log('   http://localhost:3001/auth/login');
    console.log('   Clique em "ACESSAR DEMONSTRAÇÃO"\n');
    console.log('🌐 Acesse o menu público:');
    console.log('   http://localhost:3001/demo\n');

  } catch (error) {
    console.error('❌ Erro ao criar usuário demo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
createDemoUser()
  .then(() => {
    console.log('✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
