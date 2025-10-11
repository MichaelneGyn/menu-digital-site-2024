const { PrismaClient } = require('@prisma/client');

async function verificar() {
  const prisma = new PrismaClient();

  try {
    console.log('\n🔍 VERIFICANDO VÍNCULOS:\n');

    // 1. Buscar usuário
    const user = await prisma.user.findFirst({
      where: { email: 'michaeldouglasqueiroz@gmail.com' }
    });

    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.name);

    // 2. Buscar restaurantes
    const restaurants = await prisma.restaurant.findMany();
    console.log('\n📋 Restaurantes no banco:', restaurants.length);
    restaurants.forEach(r => {
      console.log(`   - "${r.name}" (ID: ${r.id}, userId: ${r.userId})`);
      console.log(`     ✓ Vinculado ao user correto? ${r.userId === user.id ? '✅ SIM' : '❌ NÃO'}`);
    });

    // 3. Buscar restaurante do usuário
    console.log('\n🔗 Restaurantes vinculados ao usuário:');
    const userRestaurants = await prisma.restaurant.findMany({
      where: { userId: user.id },
      include: {
        categories: true,
        menuItems: true
      }
    });

    if (userRestaurants.length === 0) {
      console.log('   ❌ NENHUM restaurante vinculado!');
      console.log('\n💡 SOLUÇÃO: Precisamos vincular o restaurante ao usuário!\n');
      
      // Mostrar SQL para corrigir
      if (restaurants.length > 0) {
        console.log('📝 Execute este SQL no Supabase:\n');
        restaurants.forEach(r => {
          console.log(`UPDATE "Restaurant" SET "userId" = '${user.id}' WHERE id = '${r.id}';`);
        });
        console.log('');
      }
    } else {
      console.log(`   ✅ ${userRestaurants.length} restaurante(s) encontrado(s):`);
      userRestaurants.forEach(r => {
        console.log(`   - ${r.name}`);
        console.log(`     Categorias: ${r.categories.length}`);
        console.log(`     Itens: ${r.menuItems.length}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificar();
