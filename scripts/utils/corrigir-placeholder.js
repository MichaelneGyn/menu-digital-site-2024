const { PrismaClient } = require('@prisma/client');

async function corrigir() {
  const prisma = new PrismaClient();

  try {
    console.log('\n🔧 CORRIGINDO ITENS COM PLACEHOLDER:\n');

    // Atualizar itens com placeholder para NULL
    const result = await prisma.menuItem.updateMany({
      where: {
        image: '/placeholder-food.jpg'
      },
      data: {
        image: null
      }
    });

    console.log(`✅ ${result.count} itens corrigidos!`);
    console.log('\n📝 Os itens agora não têm imagem.');
    console.log('   Você pode editá-los no dashboard e adicionar as imagens corretas.\n');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigir();
