import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleOrders() {
  try {
    // Buscar o restaurante Di Sarda
    const restaurant = await prisma.restaurant.findFirst({
      where: { slug: 'di-sarda-pizzaria' }
    });

    if (!restaurant) {
      console.error('Restaurante não encontrado');
      return;
    }

    // Buscar alguns itens do menu
    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      take: 5
    });

    if (menuItems.length === 0) {
      console.error('Nenhum item do menu encontrado');
      return;
    }

    // Criar pedidos de exemplo
    const sampleOrders = [
      {
        orderNumber: `PED${Date.now()}001`,
        customerName: 'João Silva',
        customerPhone: '(62) 99999-1111',
        customerEmail: 'joao@email.com',
        customerAddress: 'Rua das Flores, 123 - Jardim América',
        paymentMethod: 'Cartão de Crédito',
        status: 'PENDING',
        total: 45.90,
        items: [
          {
            menuItemId: menuItems[0].id,
            quantity: 1,
            unitPrice: Number(menuItems[0].price),
            totalPrice: Number(menuItems[0].price),
            notes: 'Sem cebola'
          },
          {
            menuItemId: menuItems[1].id,
            quantity: 2,
            unitPrice: Number(menuItems[1].price),
            totalPrice: Number(menuItems[1].price) * 2,
            notes: null
          }
        ]
      },
      {
        orderNumber: `PED${Date.now()}002`,
        customerName: 'Maria Santos',
        customerPhone: '(62) 99999-2222',
        customerEmail: 'maria@email.com',
        customerAddress: 'Av. Principal, 456 - Centro',
        paymentMethod: 'PIX',
        status: 'PREPARING',
        total: 67.80,
        items: [
          {
            menuItemId: menuItems[2].id,
            quantity: 1,
            unitPrice: Number(menuItems[2].price),
            totalPrice: Number(menuItems[2].price),
            notes: 'Bem passado'
          }
        ]
      },
      {
        orderNumber: `PED${Date.now()}003`,
        customerName: 'Pedro Costa',
        customerPhone: '(62) 99999-3333',
        customerEmail: 'pedro@email.com',
        customerAddress: 'Rua do Comércio, 789 - Vila Nova',
        paymentMethod: 'Dinheiro',
        status: 'READY',
        total: 89.50,
        items: [
          {
            menuItemId: menuItems[3].id,
            quantity: 2,
            unitPrice: Number(menuItems[3].price),
            totalPrice: Number(menuItems[3].price) * 2,
            notes: 'Extra queijo'
          },
          {
            menuItemId: menuItems[4].id,
            quantity: 1,
            unitPrice: Number(menuItems[4].price),
            totalPrice: Number(menuItems[4].price),
            notes: null
          }
        ]
      }
    ];

    // Criar os pedidos no banco
    for (const orderData of sampleOrders) {
      await prisma.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          restaurantId: restaurant.id,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          customerEmail: orderData.customerEmail,
          customerAddress: orderData.customerAddress,
          paymentMethod: orderData.paymentMethod,
          status: orderData.status as any,
          total: orderData.total,
          orderItems: {
            create: orderData.items
          }
        }
      });
    }

    console.log('✅ Pedidos de exemplo criados com sucesso!');
    console.log(`📦 Criados ${sampleOrders.length} pedidos`);
    console.log('🏪 Restaurante:', restaurant.name);
    
  } catch (error) {
    console.error('❌ Erro ao criar pedidos de exemplo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleOrders();