import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Delete existing user if exists
  await prisma.user.deleteMany({
    where: { email: 'john@doe.com' }
  });

  // Create fresh user
  const hashedPassword = await bcrypt.hash('johndoe123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'john@doe.com',
      name: 'João Silva',
      password: hashedPassword,
      role: UserRole.STAFF,
    },
  });

  console.log('✅ User created successfully!');
  console.log('Email:', user.email);
  console.log('Password: johndoe123');
  console.log('Role:', user.role);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
