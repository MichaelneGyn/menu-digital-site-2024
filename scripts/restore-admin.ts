import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function restoreAdmin() {
  const email = 'michaeldouglasqueiroz@gmail.com';
  const defaultPassword = 'admin123';
  try {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: UserRole.ADMIN,
        password: hashedPassword,
        name: 'Michael Douglas Queiroz',
      },
      create: {
        email,
        name: 'Michael Douglas Queiroz',
        role: UserRole.ADMIN,
        password: hashedPassword,
      },
    });

    console.log('✅ Admin restaurado com sucesso');
    console.log('📧 Email:', user.email);
    console.log('👤 Nome:', user.name);
    console.log('🔑 Senha redefinida para:', defaultPassword);
    console.log('⚠️  Altere a senha após o primeiro login.');
  } catch (error) {
    console.error('❌ Erro ao restaurar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAdmin();