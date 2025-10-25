import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUnsplashImages() {
  try {
    console.log('🔍 Procurando itens com imagens do Unsplash...');
    
    // Busca todos os itens com imagens do Unsplash
    const itemsWithUnsplash = await prisma.menuItem.findMany({
      where: {
        image: {
          contains: 'unsplash.com'
        }
      }
    });
    
    console.log(`📊 Encontrados ${itemsWithUnsplash.length} itens com imagens do Unsplash`);
    
    if (itemsWithUnsplash.length === 0) {
      console.log('✅ Nenhum item com imagem do Unsplash encontrado!');
      return;
    }
    
    // Lista os itens afetados
    console.log('\n📋 Itens afetados:');
    itemsWithUnsplash.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (ID: ${item.id})`);
    });
    
    // Atualiza todos removendo as URLs do Unsplash
    console.log('\n🔧 Removendo imagens do Unsplash...');
    
    const result = await prisma.menuItem.updateMany({
      where: {
        image: {
          contains: 'unsplash.com'
        }
      },
      data: {
        image: null
      }
    });
    
    console.log(`✅ ${result.count} itens atualizados com sucesso!`);
    console.log('\n💡 Agora você pode fazer upload das imagens corretas para cada item.');
    
  } catch (error) {
    console.error('❌ Erro ao limpar imagens:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixUnsplashImages()
  .then(() => {
    console.log('\n✅ Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
