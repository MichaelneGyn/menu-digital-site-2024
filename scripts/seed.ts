
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Ensure admin user
  const adminEmail = 'michaeldouglasqueiroz@gmail.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN },
    create: {
      email: adminEmail,
      name: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  console.log('Admin ensured:', admin.email);

  // Create test user and restaurant owner
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'João Silva',
      password: hashedPassword,
      role: UserRole.STAFF,
    },
  });

  // Create Di Sarda Pizzaria restaurant
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'di-sarda-pizzaria' },
    update: {},
    create: {
      name: 'Di Sarda Pizzaria',
      slug: 'di-sarda-pizzaria',
      description: 'Tradição e Sabor desde 1995. A melhor pizza artesanal de Goiânia.',
      logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&crop=center',
      bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop&crop=center',
      primaryColor: '#d32f2f',
      secondaryColor: '#ffc107',
      address: 'Jardim Hesperia',
      city: 'Goiânia',
      state: 'GO',
      openTime: '18:00',
      closeTime: '23:00',
      workingDays: 'Segunda, Terça, Quarta, Quinta, Sexta, Sábado, Domingo',
      // Salvar apenas dígitos no WhatsApp para compatibilidade com wa.me
      whatsapp: '6200010901',
      userId: user.id,
    },
  });

  // Optionally seed a basic subscription for admin
  await prisma.subscription.upsert({
    where: { id: admin.id },
    update: {},
    create: {
      userId: admin.id,
      plan: 'pro',
      status: 'active',
    },
  });

  // Create categories
  const categories = [
    { name: 'Promoções', icon: '🎉', description: 'Combos e promoções especiais' },
    { name: 'Entradas', icon: '🥘', description: 'Deliciosas entradas para começar bem' },
    { name: 'Pizzas', icon: '🍕', description: 'Nossas famosas pizzas artesanais' },
    { name: 'Massas', icon: '🍝', description: 'Massas frescas e saborosas' },
    { name: 'Saladas', icon: '🥗', description: 'Saladas frescas e nutritivas' },
    { name: 'Sobremesas', icon: '🍰', description: 'Doces tentações para finalizar' },
    { name: 'Bebidas', icon: '🥤', description: 'Bebidas geladas e refrescantes' },
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
  const entradasCategory = createdCategories.find(c => c.name === 'Entradas')!;
  const pizzasCategory = createdCategories.find(c => c.name === 'Pizzas')!;
  const massasCategory = createdCategories.find(c => c.name === 'Massas')!;
  const saladasCategory = createdCategories.find(c => c.name === 'Saladas')!;
  const sobremesasCategory = createdCategories.find(c => c.name === 'Sobremesas')!;
  const bebidasCategory = createdCategories.find(c => c.name === 'Bebidas')!;

  // Create menu items - Promoções
  const promoItems = [
    {
      name: '1 Pizza G + Pizza P Doce + Refri 1,5l',
      description: 'Escolha uma Pizza salgada + 1 Pizza pequena doce + Refri 1,5l. Apenas 1 sabor por pizza',
      price: 109.90,
      originalPrice: 119.90,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      isPromo: true,
      promoTag: 'COMBO',
      categoryId: promosCategory.id,
    },
    {
      name: '2 Pizzas G por apenas R$119,90',
      description: '2 Pizzas G por apenas R$109,90. Apenas 1 sabor por pizza',
      price: 119.90,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
      isPromo: true,
      promoTag: '2 POR 1',
      categoryId: promosCategory.id,
    },
    {
      name: 'Pizza Média + Refri 1,5l por R$64,90',
      description: 'Pizza Média G + Refri 1,5l por R$64,90. Apenas 1 sabor na Pizza Salgada',
      price: 64.90,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      isPromo: true,
      promoTag: 'OFERTA',
      categoryId: promosCategory.id,
    },
  ];

  // Create menu items - Entradas
  const entradaItems = [
    {
      name: 'Focaccias',
      description: 'Deliciosa focaccia artesanal com azeite e ervas',
      price: 23.90,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
      categoryId: entradasCategory.id,
    },
    {
      name: 'Batata com Cheddar e Bacon',
      description: 'Batatas crocantes com molho cheddar e bacon crocante',
      price: 39.90,
      image: 'https://images.unsplash.com/photo-1633436375795-12b3b339712f?w=400',
      categoryId: entradasCategory.id,
    },
    {
      name: 'Mini Pastel',
      description: 'Porção com 10 mini pastéis sabor carne ou queijo',
      price: 24.90,
      image: 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=400',
      categoryId: entradasCategory.id,
    },
    {
      name: 'Kibe Recheado',
      description: 'Kibe de carne caseiro, crocante recheado com catupiry cremoso',
      price: 29.90,
      image: 'https://i.ytimg.com/vi/wWCboHdOSd8/maxresdefault.jpg',
      categoryId: entradasCategory.id,
    },
    {
      name: 'Bolinho de Carne Seca',
      description: 'Bolinho de mandioca crocante, recheado com carne seca e queijo',
      price: 44.90,
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400',
      categoryId: entradasCategory.id,
    },
    {
      name: 'Isca de Picanha',
      description: 'Picanha em tiras acebolada ao molho madeira, acompanhada do nosso crispy',
      price: 59.90,
      image: 'https://images.unsplash.com/photo-1626082896492-766af4eb6501?w=400',
      categoryId: entradasCategory.id,
    },
  ];

  // Create menu items - Pizzas
  const pizzaItems = [
    {
      name: 'Pizza Pequena',
      description: 'Escolha 1 sabor - Ideal para 1 pessoa',
      price: 35.90,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
      categoryId: pizzasCategory.id,
    },
    {
      name: 'Pizza Média',
      description: 'Escolha 1 ou 2 sabores - Serve 2 pessoas',
      price: 44.90,
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400',
      categoryId: pizzasCategory.id,
    },
    {
      name: 'Pizza Grande',
      description: 'Escolha 1 ou 2 sabores - Serve 3-4 pessoas',
      price: 54.90,
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400',
      categoryId: pizzasCategory.id,
    },
  ];

  // Create menu items - Massas
  const massaItems = [
    {
      name: 'Penne ao Pesto',
      description: 'Penne, pesto de manjericão, tomate seco, frango desfiado, parmesão e manjericão',
      price: 39.90,
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
      categoryId: massasCategory.id,
    },
    {
      name: 'Fettuccine ao Molho de Queijo',
      description: 'Fettuccine, carne secam tomate cereja, molho de queijo e parmesão',
      price: 39.90,
      image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400',
      categoryId: massasCategory.id,
    },
    {
      name: 'Espaguete À La Puttanesca',
      description: 'Espaguete, azeitonas, linguiça, calabresa, molho de tomate, alho frito, parmesão e manjericão',
      price: 39.90,
      image: 'https://images.unsplash.com/photo-1608219992759-8d74ed8d76eb?w=400',
      categoryId: massasCategory.id,
    },
    {
      name: 'Penne Primavera',
      description: 'Penne no azeite com tomate cereja, palmito, azeitona, champignon, abobrinha, manjericão e parmesão (opcional)',
      price: 39.90,
      image: 'https://images.unsplash.com/photo-1611270629569-8b357cb88da9?w=400',
      categoryId: massasCategory.id,
    },
  ];

  // Create menu items - Saladas
  const saladaItems = [
    {
      name: 'Frango Fitness',
      description: 'Frango desfiado, alface, tomate, rúcula e gorgonzola',
      price: 29.90,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      categoryId: saladasCategory.id,
    },
    {
      name: 'Ala di Sarda',
      description: 'Alface, rúcula, tomate cereja, ovo cozido e carne seca',
      price: 29.90,
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      categoryId: saladasCategory.id,
    },
    {
      name: 'Salada Ceasar',
      description: 'Alface, rúcula, tomate cereja, ovo e palmito',
      price: 29.90,
      image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
      categoryId: saladasCategory.id,
    },
  ];

  // Create menu items - Sobremesas
  const sobremesaItems = [
    {
      name: 'Petit Gateau de Chocolate',
      description: 'Com sorvete de creme e calda de chocolate, maracujá ou morango',
      price: 24.90,
      image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
      categoryId: sobremesasCategory.id,
    },
    {
      name: 'Bolinho de Nutella',
      description: 'Rolinho de massa extra recheado com nutella',
      price: 24.90,
      image: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=400',
      categoryId: sobremesasCategory.id,
    },
    {
      name: 'Pudim de Madre (Fatia)',
      description: 'Pudim de leite condensado artesanal com uma deliciosa calda caramelizada',
      price: 11.90,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
      categoryId: sobremesasCategory.id,
    },
    {
      name: 'Sobremesa de Churros',
      description: 'Palitos de churros quentinhos com cobertura da sua escolha, servido de creme e morango',
      price: 20.90,
      image: 'https://images.unsplash.com/photo-1639744091981-2f826321fae6?w=400',
      categoryId: sobremesasCategory.id,
    },
    {
      name: 'Churros Tradicional',
      description: 'Churros quentinho e crocante, super recheado com doce de leite, chocolate ou ninho',
      price: 9.00,
      image: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400',
      categoryId: sobremesasCategory.id,
    },
    {
      name: 'Churros Espanhol',
      description: 'Seis palitos de churros com recheio no copinho, para vc ir molhando e comendo, doce de leite, ninho ou chocolate',
      price: 17.90,
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
      categoryId: sobremesasCategory.id,
    },
    {
      name: 'Mini Churros',
      description: 'Doze unidades de mini churros, recheados em camadas, doce de leite, ninho ou chocolate',
      price: 19.90,
      image: 'https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=400',
      categoryId: sobremesasCategory.id,
    },
  ];

  // Create menu items - Bebidas
  const bebidaItems = [
    {
      name: 'Refrigerante 1,5 litro',
      description: 'Coca-Cola, Guaraná, Fanta ou Sprite',
      price: 13.50,
      image: 'https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Refrigerante 600ml',
      description: 'Coca-Cola, Guaraná, Fanta ou Sprite',
      price: 8.90,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Refrigerante Lata',
      description: 'Coca-Cola, Guaraná, Fanta ou Sprite',
      price: 6.50,
      image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Cerveja Amstel',
      description: 'Lata 350ml gelada',
      price: 6.50,
      image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Cerveja Budweiser',
      description: 'Lata 350ml gelada',
      price: 9.90,
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Cerveja Sol',
      description: 'Long neck gelada',
      price: 9.90,
      image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Cerveja Heineken',
      description: 'Long neck gelada',
      price: 10.90,
      image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Chopp de Vinho',
      description: 'Chopp artesanal de vinho 500ml',
      price: 22.90,
      image: 'https://images.tcdn.com.br/img/img_prod/1374871/wibeer_red_draft_leve_6_pague_5_e_ganhe_frete_gratis_73_1_14bd3c9da60d70af1c6fe7ecedf29821.png',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Suco de Polpa',
      description: 'Diversos sabores naturais',
      price: 13.90,
      image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Cremes',
      description: 'Creme de açaí, cupuaçu ou tapioca',
      price: 17.90,
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Suco de Caixa 1 litro',
      description: 'Del Valle diversos sabores',
      price: 13.90,
      image: 'https://images.unsplash.com/photo-1600271772470-bd22a42787b3?w=400',
      categoryId: bebidasCategory.id,
    },
    {
      name: 'Jarra de Suco 1 litro',
      description: 'Suco natural da fruta - diversos sabores',
      price: 24.90,
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
      categoryId: bebidasCategory.id,
    },
  ];

  // Insert all menu items
  const allItems = [
    ...promoItems,
    ...entradaItems,
    ...pizzaItems,
    ...massaItems,
    ...saladaItems,
    ...sobremesaItems,
    ...bebidaItems,
  ];

  for (const [index, item] of allItems.entries()) {
    await prisma.menuItem.create({
      data: {
        ...item,
        sortOrder: index,
        restaurantId: restaurant.id,
      },
    });
  }

  console.log('Database seeded successfully with Di Sarda Pizzaria data!');
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
