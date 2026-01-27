
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        userId: true
      }
    });

    console.log('Restaurantes encontrados:', restaurants.length);
    restaurants.forEach(r => {
      console.log(`- ID: ${r.id} | Nome: ${r.name} | Slug: ${r.slug} | UserID: ${r.userId}`);
    });

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
