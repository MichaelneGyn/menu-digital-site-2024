import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'michaeldouglasqueiroz@gmail.com' }
    });

    if (existingUser) {
      console.log('✅ Usuário já existe:', existingUser.email);
      console.log('📧 Email:', existingUser.email);
      console.log('👤 Nome:', existingUser.name);
      return;
    }

    // Criar hash da senha padrão
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Criar novo usuário admin
    const newUser = await prisma.user.create({
      data: {
        email: 'michaeldouglasqueiroz@gmail.com',
        name: 'Michael Douglas Queiroz',
        password: hashedPassword,
      },
    });

    console.log('🎉 Usuário admin criado com sucesso!');
    console.log('📧 Email:', newUser.email);
    console.log('👤 Nome:', newUser.name);
    console.log('🔑 Senha padrão: admin123');
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();