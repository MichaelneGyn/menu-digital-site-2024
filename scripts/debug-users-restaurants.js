
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('--- Checking Users and Restaurants ---');
    const users = await prisma.user.findMany({
      include: {
        restaurants: true
      }
    });

    console.log(`Found ${users.length} users.`);
    users.forEach(user => {
      console.log(`User: ${user.email} (ID: ${user.id})`);
      if (user.restaurants.length > 0) {
        user.restaurants.forEach(r => {
          console.log(`  - Restaurant: ${r.name} (ID: ${r.id}, Slug: ${r.slug})`);
        });
      } else {
        console.log('  - No restaurants found for this user.');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
