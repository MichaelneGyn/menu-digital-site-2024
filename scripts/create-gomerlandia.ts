import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test user for Gomerlandia
  const hashedPassword = await bcrypt.hash('gomerlandia123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@gomerlandia.com' },
    update: {},
    create: {
      email: 'admin@gomerlandia.com',
      name: 'Admin Gomerlandia',
      password: hashedPassword,
    },
  });

  // Create Gomerlandia restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'gomerlandia' },
    update: {},
    create: {
      name: 'Gomerlandia',
      slug: 'gomerlandia',
      description: 'Deliciosos hambúrgueres artesanais e muito mais!',
      logo: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop&crop=center',
      bannerImage: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1200&h=400&fit=crop&crop=center',
      primaryColor: '#ff6b35',
      secondaryColor: '#ffc107',
      phone: '(62) 3333-4444',
      address: 'Setor Central',
      city: 'Goiânia',
      state: 'GO',
      openTime: '17:00',
      closeTime: '00:00',
      workingDays: 'Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo',
      whatsapp: '(62) 9999-8888',
      userId: user.id,
    },
  });

  // Create categories for Gomerlandia
  const categories = [
    { name: 'Promoções', icon: '🎉', description: 'Ofertas especiais' },
    { name: 'Hambúrgueres', icon: '🍔', description: 'Hambúrgueres artesanais' },
    { name: 'Acompanhamentos', icon: '🍟', description: 'Batatas e acompanhamentos' },
    { name: 'Bebidas', icon: '🥤', description: 'Bebidas geladas' },
    { name: 'Sobremesas', icon: '🍰', description: 'Doces e sobremesas' },
  ];

  for (const [index, categoryData] of categories.entries()) {
    await prisma.category.upsert({
      where: { 
        restaurantId_name: { 
          restaurantId: restaurant.id, 
          name: categoryData.name 
        } 
      },
      update: {},
      create: {
        ...categoryData,
        sortOrder: index,
        restaurantId: restaurant.id,
      },
    });
  }

  // Get created categories
  const createdCategories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
  });

  const promosCategory = createdCategories.find(c => c.name === 'Promoções')!;
  const hamburgueresCategory = createdCategories.find(c => c.name === 'Hambúrgueres')!;
  const acompanhamentosCategory = createdCategories.find(c => c.name === 'Acompanhamentos')!;
  const bebidasCategory = createdCategories.find(c => c.name === 'Bebidas')!;
  const sobremesasCategory = createdCategories.find(c => c.name === 'Sobremesas')!;

  // Create menu items - Promoções
  const promoItems = [
    {
      name: 'Combo Duplo',
      description: '2 Hambúrgueres + 2 Batatas + 2 Refrigerantes',
      price: 45.90,
      originalPrice: 55.90,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
      isPromo: true,
      promoTag: 'COMBO',
      categoryId: promosCategory.id,
    },
  ];

  // Create menu items - Hambúrgueres
  const hamburguerItems = [
    {
      name: 'X-Bacon',
      description: 'Hambúrguer, bacon, queijo, alface, tomate',
      price: 18.90,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
      categoryId: hamburgueresCategory.id,
    },
    {
      name: 'X-Tudo',
      description: 'Hambúrguer, bacon, queijo, ovo, presunto, alface, tomate',
      price: 22.90,
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400',
      categoryId: hamburgueresCategory.id,
    },
  ];

  // Create menu items - Acompanhamentos
  const acompanhamentoItems = [
    {
      name: 'Batata Frita',
      description: 'Porção de batata frita crocante',
      price: 8.90,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
      categoryId: acompanhamentosCategory.id,
    },
  ];

  // Create menu items - Bebidas
  const bebidaItems = [
    {
      name: 'Coca-Cola 350ml',
      description: 'Refrigerante gelado',
      price: 4.50,
      image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400',
      categoryId: bebidasCategory.id,
    },
  ];

  // Create menu items - Sobremesas
  const sobremesaItems = [
    {
      name: 'Brownie',
      description: 'Brownie de chocolate com sorvete',
      price: 12.90,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
      categoryId: sobremesasCategory.id,
    },
  ];

  // Insert all items
  const allItems = [
    ...promoItems,
    ...hamburguerItems,
    ...acompanhamentoItems,
    ...bebidaItems,
    ...sobremesaItems,
  ];

  for (const [index, item] of allItems.entries()) {
    await prisma.item.upsert({
      where: {
        categoryId_name: {
          categoryId: item.categoryId,
          name: item.name,
        },
      },
      update: {},
      create: {
        ...item,
        sortOrder: index,
        restaurantId: restaurant.id,
      },
    });
  }

  console.log('Database seeded successfully with Gomerlandia data!');
  console.log(`Created restaurant: ${restaurant.name}`);
  console.log(`Created ${categories.length} categories`);
  console.log(`Created ${allItems.length} menu items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });