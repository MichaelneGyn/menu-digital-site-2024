import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createRestaurantForAdmin() {
  try {
    // Buscar o usuário admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'michaeldouglasqueiroz@gmail.com' },
      include: { restaurants: true }
    });

    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado!');
      return;
    }

    // Verificar se já tem restaurante
    if (adminUser.restaurants.length > 0) {
      console.log('✅ Usuário já possui restaurante:', adminUser.restaurants[0].name);
      console.log('🔗 Slug:', adminUser.restaurants[0].slug);
      return;
    }

    // Criar restaurante para o admin
    const restaurant = await prisma.restaurant.create({
      data: {
        name: 'Meu Restaurante',
        slug: 'meu-restaurante-admin',
        description: 'Restaurante administrado por Michael Douglas Queiroz',
        logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop&crop=center',
        bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop&crop=center',
        primaryColor: '#d32f2f',
        secondaryColor: '#ffc107',
        address: 'Endereço do Restaurante',
        city: 'Goiânia',
        state: 'GO',
        openTime: '18:00',
        closeTime: '23:00',
        workingDays: 'Segunda a Domingo',
        // Salvar apenas dígitos no WhatsApp para compatibilidade com wa.me
        whatsapp: '62999999999',
        userId: adminUser.id,
      },
    });

    console.log('🎉 Restaurante criado com sucesso para o admin!');
    console.log('🏪 Nome:', restaurant.name);
    console.log('🔗 Slug:', restaurant.slug);
    console.log('👤 Proprietário:', adminUser.name);
    console.log('');
    console.log('✅ Agora você pode acessar o dashboard administrativo!');

  } catch (error) {
    console.error('❌ Erro ao criar restaurante:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRestaurantForAdmin();