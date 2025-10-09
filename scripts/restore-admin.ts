import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function restoreAdmin() {
  const email = 'michaeldouglasqueiroz@gmail.com';
  const defaultPassword = 'admin123';
  try {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Primeiro, vamos verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Se existe, apenas atualiza a senha e role
      const user = await prisma.user.update({
        where: { email },
        data: {
          role: UserRole.ADMIN,
          password: hashedPassword,
          name: 'Michael Douglas Queiroz',
        },
      });
      console.log('✅ Admin atualizado com sucesso');
      console.log('📧 Email:', user.email);
      console.log('👤 Nome:', user.name);
      console.log('🔑 Senha redefinida para:', defaultPassword);
    } else {
      // Se não existe, cria um novo usuário com campos mínimos
      const user = await prisma.user.create({
        data: {
          email,
          name: 'Michael Douglas Queiroz',
          role: UserRole.ADMIN,
          password: hashedPassword,
        },
      });
      console.log('✅ Admin criado com sucesso');
      console.log('📧 Email:', user.email);
      console.log('👤 Nome:', user.name);
      console.log('🔑 Senha definida para:', defaultPassword);
    }
    
    console.log('⚠️  Altere a senha após o primeiro login.');
  } catch (error) {
    console.error('❌ Erro ao restaurar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAdmin();