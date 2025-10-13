const { PrismaClient } = require('@prisma/client');

async function verificar() {
  const prisma = new PrismaClient();

  try {
    console.log('\n🔍 VERIFICANDO IMAGENS DOS ITENS:\n');

    // Buscar todos os itens do menu
    const items = await prisma.menuItem.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        price: true
      }
    });

    if (items.length === 0) {
      console.log('❌ Nenhum item encontrado no banco!');
      return;
    }

    console.log(`✅ Total de itens: ${items.length}\n`);

    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Preço: R$ ${item.price}`);
      console.log(`   Imagem: ${item.image || '❌ SEM IMAGEM'}`);
      console.log('');
    });

    // Contar itens com e sem imagem
    const comImagem = items.filter(i => i.image).length;
    const semImagem = items.filter(i => !i.image).length;

    console.log(`\n📊 RESUMO:`);
    console.log(`   ✅ Com imagem: ${comImagem}`);
    console.log(`   ❌ Sem imagem: ${semImagem}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificar();
