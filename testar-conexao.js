const { PrismaClient } = require('@prisma/client');

async function testarConexao() {
  console.log('🔍 Testando conexão com Supabase...\n');
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn']
  });

  try {
    // Teste 1: Conexão básica
    console.log('1️⃣ Testando conexão...');
    await prisma.$connect();
    console.log('   ✅ Conectado!\n');

    // Teste 2: Buscar usuário
    console.log('2️⃣ Buscando usuário...');
    const user = await prisma.user.findFirst();
    if (user) {
      console.log('   ✅ Usuário encontrado:', user.email);
      console.log('   ID:', user.id);
    } else {
      console.log('   ❌ Nenhum usuário encontrado!');
    }

    // Teste 3: Buscar restaurantes
    console.log('\n3️⃣ Buscando restaurantes...');
    const restaurants = await prisma.restaurant.findMany();
    console.log('   Total:', restaurants.length);
    restaurants.forEach(r => {
      console.log('   -', r.name, '(userId:', r.userId, ')');
    });

    // Teste 4: Verificar se user tem restaurante
    if (user) {
      console.log('\n4️⃣ Verificando restaurantes do usuário...');
      const userRestaurants = await prisma.restaurant.findMany({
        where: { userId: user.id }
      });
      console.log('   Restaurantes vinculados ao user:', userRestaurants.length);
    }

    console.log('\n✅ TODOS OS TESTES PASSARAM!\n');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('\nDetalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarConexao();
