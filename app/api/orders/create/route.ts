import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { apiRateLimiter } from '@/lib/rate-limit';
import { cookies } from 'next/headers';

// Configurar CORS (APENAS para seu domínio)
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXTAUTH_URL || 'https://menu-digital-site-2024-8773d37d6064-git-main-michaeldouglasqueiroz.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

const createOrderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  notes: z.string().nullable().optional(),
});

const createFullOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(createOrderItemSchema).min(1),
  total: z.number().positive(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limiting (60 pedidos por minuto por IP)
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const limitResult = apiRateLimiter(ip);
    
    if (!limitResult.success) {
      return limitResult.response!;
    }
    
    const body = await req.json();
    console.log('Dados recebidos:', body);
    
    const { restaurantId, items, total, customerName, customerPhone, deliveryAddress, paymentMethod, notes } = createFullOrderSchema.parse(body);

    // Verificar se o restaurante existe
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    // Gerar código incremental por restaurante
    let code = '';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const lastOrder = await prisma.order.findFirst({
        where: { restaurantId },
        orderBy: { createdAt: 'desc' },
      });
      
      const nextNum = lastOrder ? Number((lastOrder.code.match(/\d+/)?.[0] ?? '0')) + 1 : 1;
      const proposedCode = `#${String(nextNum).padStart(5, '0')}`;
      
      // Verificar se o código já existe
      const existingOrder = await prisma.order.findUnique({
        where: { code: proposedCode }
      });
      
      if (!existingOrder) {
        code = proposedCode;
        break;
      }
      
      // Se existir, adicionar timestamp para garantir unicidade
      code = `#${String(nextNum).padStart(5, '0')}-${Date.now().toString().slice(-4)}`;
      attempts++;
    }
    
    if (!code) {
      // Fallback: usar timestamp completo
      code = `#${Date.now().toString().slice(-8)}`;
    }

    // Validar que todos os menuItems existem
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });
      
      if (!menuItem) {
        console.error('MenuItem não encontrado:', item.menuItemId);
        return NextResponse.json(
          { error: `Item do menu não encontrado: ${item.menuItemId}` },
          { status: 404 }
        );
      }
      
      console.log('MenuItem válido:', menuItem.name);
    }

    // Gerar ou buscar ID do cliente no cookie
    const cookieStore = cookies();
    let customerId = cookieStore.get('customerId')?.value;
    
    // Se não tem cookie, gerar novo ID único
    if (!customerId) {
      customerId = crypto.randomUUID();
      cookieStore.set('customerId', customerId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 ano
        path: '/',
      });
    }

    // Gerar URL de rastreamento
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/track/${code.replace('#', '')}`;

    // Criar pedido e itens em uma transação
    const order = await prisma.$transaction(async (tx) => {
      // Criar pedido (salvar customerId no campo customerPhone se não tiver telefone)
      const newOrder = await tx.order.create({
        data: {
          restaurantId,
          status: 'PENDING',
          total,
          code,
          customerName: customerName || null,
          customerPhone: customerPhone || customerId, // Usa telefone ou customerId
          deliveryAddress: deliveryAddress || null,
          paymentMethod: paymentMethod || 'Dinheiro',
          notes: notes || null,
          trackingUrl,
          notificationSent: false,
        },
      });
      
      console.log('Pedido criado:', newOrder.id);

      // Criar itens do pedido
      const orderItems = await Promise.all(
        items.map(async (item) => {
          console.log('Criando orderItem:', {
            orderId: newOrder.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
          });
          
          return tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
              notes: item.notes || null,
            },
          });
        })
      );

      return {
        ...newOrder,
        orderItems,
      };
    });

    console.log('Pedido criado com sucesso:', order);
    
    return NextResponse.json(order, { status: 201, headers: corsHeaders });
  } catch (error: any) {
    console.error('Erro ao criar pedido completo:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao criar pedido' },
      { status: 500, headers: corsHeaders }
    );
  }
}
