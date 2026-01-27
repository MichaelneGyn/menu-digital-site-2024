
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'x-lanches';
  console.log(`Checking for restaurant with slug: ${slug}`);

  const restaurant = await prisma.restaurant.findFirst({
    where: { slug: slug }
  });

  if (restaurant) {
    console.log('Restaurant found:');
    console.log(`ID: ${restaurant.id}`);
    console.log(`Name: ${restaurant.name}`);
    console.log(`Active: ${restaurant.isActive}`);
  } else {
    console.log('Restaurant NOT found.');
  }
  
  // Also list all restaurants to see what's available
  const allRestaurants = await prisma.restaurant.findMany({
    select: { slug: true, name: true, isActive: true }
  });
  
  console.log('\nAll available restaurants:');
  allRestaurants.forEach(r => {
    console.log(`- ${r.name} (slug: ${r.slug}, active: ${r.isActive})`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
