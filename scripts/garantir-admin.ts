/**
 * Script para garantir que sempre existe um usuário admin
 * Execute: npx ts-node scripts/garantir-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function garantirAdmin() {
  console.log('🔐 Verificando usuário admin...\n');

  const email = 'michaeldouglasqueiroz@gmail.com';
  const senha = 'admin123'; // Troque isso em produção!

  try {
    // Verificar se usuário existe
    let user = await prisma.user.findUnique({
      where: { email }
    });

    const hashedPassword = await bcrypt.hash(senha, 10);

    if (user) {
      // Atualizar senha
      user = await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Senha do admin atualizada!');
    } else {
      // Criar novo usuário
      user = await prisma.user.create({
        data: {
          email,
          name: 'Administrador',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('✅ Usuário admin criado!');
    }

    console.log('\n📧 Email:', email);
    console.log('🔑 Senha:', senha);
    console.log('\n⚠️  IMPORTANTE: Troque essa senha após o primeiro login!\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

garantirAdmin();
