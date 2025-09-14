import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de teste
  const testUser = await prisma.user.upsert({
    where: { email: 'teste@menudigital.com' },
    update: {},
    create: {
      email: 'teste@menudigital.com',
      name: 'Usuário Teste',
    },
  });

  console.log('✅ Usuário de teste criado:', testUser.email);

  // Criar restaurante de teste
  const testRestaurant = await prisma.restaurant.upsert({
    where: { slug: 'restaurante-teste' },
    update: {},
    create: {
      name: 'Restaurante Teste',
      slug: 'restaurante-teste',
      phone: '(11) 99999-9999',
      address: 'Rua Teste, 123 - São Paulo, SP',
      userId: testUser.id,
    },
  });

  console.log('✅ Restaurante de teste criado:', testRestaurant.name);

  // Criar categorias de teste
  const categories = [
    { name: 'Pratos Principais', icon: '🍽️' },
    { name: 'Bebidas', icon: '🥤' },
    { name: 'Sobremesas', icon: '🍰' },
    { name: 'Entradas', icon: '🥗' },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { 
        restaurantId_name: {
          restaurantId: testRestaurant.id,
          name: category.name
        }
      },
      update: {},
      create: {
        name: category.name,
        icon: category.icon,
        restaurantId: testRestaurant.id,
      },
    });
    createdCategories.push(createdCategory);
  }

  console.log('✅ Categorias criadas:', createdCategories.length);

  // Criar itens de menu de teste
  const menuItems = [
    {
      name: 'Hambúrguer Artesanal',
      description: 'Hambúrguer com carne 180g, queijo, alface, tomate e molho especial',
      price: 25.90,
      categoryName: 'Pratos Principais',
      image: '',
    },
    {
      name: 'Pizza Margherita',
      description: 'Pizza tradicional com molho de tomate, mussarela e manjericão',
      price: 32.00,
      categoryName: 'Pratos Principais',
      image: '',
    },
    {
      name: 'Refrigerante Lata',
      description: 'Coca-Cola, Pepsi, Guaraná ou Fanta - 350ml',
      price: 5.50,
      categoryName: 'Bebidas',
      image: '',
    },
    {
      name: 'Suco Natural',
      description: 'Suco de laranja, limão, maracujá ou acerola - 500ml',
      price: 8.00,
      categoryName: 'Bebidas',
      image: '',
    },
    {
      name: 'Pudim de Leite',
      description: 'Pudim caseiro com calda de caramelo',
      price: 12.00,
      categoryName: 'Sobremesas',
      image: '',
    },
    {
      name: 'Salada Caesar',
      description: 'Alface americana, croutons, parmesão e molho caesar',
      price: 18.50,
      categoryName: 'Entradas',
      image: '',
    },
  ];

  for (const item of menuItems) {
    const category = createdCategories.find(c => c.name === item.categoryName);
    if (category) {
      // Verificar se o item já existe
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          name: item.name,
          restaurantId: testRestaurant.id
        }
      });

      if (!existingItem) {
        await prisma.menuItem.create({
          data: {
            name: item.name,
            description: item.description,
            price: item.price,
            image: item.image,
            categoryId: category.id,
            restaurantId: testRestaurant.id,
          }
        });
      }
    }
  }

  console.log('✅ Itens de menu criados:', menuItems.length);
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📧 Email de teste: teste@menudigital.com');
  console.log('🔑 Senha de teste: 123456');
  console.log('🏪 Restaurante: Restaurante Teste');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });