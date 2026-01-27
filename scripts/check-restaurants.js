
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: { slug: true, name: true },
      take: 5
    });
    console.log('Restaurantes encontrados:', restaurants);
  } catch (error) {
    console.error('Erro ao buscar restaurantes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
