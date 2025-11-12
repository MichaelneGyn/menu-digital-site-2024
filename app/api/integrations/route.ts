import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Listar todas as integrações do restaurante
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    // Buscar restaurante do usuário
    const restaurant = await prisma.restaurant.findFirst({
      where: { user: { email: session.user.email } }
    });

    if (!restaurant) {
      return new NextResponse('Restaurante não encontrado', { status: 404 });
    }

    // Buscar integrações
    const integrations = await (prisma as any).integration.findMany({
      where: { restaurantId: restaurant.id },
      select: {
        id: true,
        platform: true,
        displayName: true,
        isActive: true,
        syncStatus: true,
        lastSyncAt: true,
        autoAcceptOrders: true,
        autoSyncMenu: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(integrations);
  } catch (error) {
    console.error('Erro ao buscar integrações:', error);
    return new NextResponse('Erro interno', { status: 500 });
  }
}

// POST - Criar ou atualizar integração
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: { user: { email: session.user.email } }
    });

    if (!restaurant) {
      return new NextResponse('Restaurante não encontrado', { status: 404 });
    }

    const body = await request.json();
    const {
      platform,
      client_id,
      client_secret,
      api_key,
      store_id,
      merchant_id,
      auto_accept_orders,
      auto_sync_menu
    } = body;

    if (!platform) {
      return new NextResponse('Plataforma é obrigatória', { status: 400 });
    }

    // Verificar se já existe
      const existing = await (prisma as any).integration.findFirst({
      where: {
        restaurantId: restaurant.id,
        platform: platform
      }
    });

    const platformNames: any = {
      ifood: 'iFood',
      '99food': '99Food',
      rappi: 'Rappi',
      ubereats: 'Uber Eats',
      aiqfome: 'aiqfome'
    };

    if (existing) {
      // Atualizar
      const updated = await (prisma as any).integration.update({
        where: { id: existing.id },
        data: {
          clientId: client_id,
          clientSecret: client_secret,
          apiKey: api_key,
          storeId: store_id,
          merchantId: merchant_id,
          autoAcceptOrders: auto_accept_orders || false,
          autoSyncMenu: auto_sync_menu !== false,
          updatedAt: new Date()
        }
      });

      return NextResponse.json(updated);
    } else {
      // Criar novo
      const integration = await (prisma as any).integration.create({
        data: {
          restaurantId: restaurant.id,
          platform: platform,
          displayName: platformNames[platform] || platform,
          clientId: client_id,
          clientSecret: client_secret,
          apiKey: api_key,
          storeId: store_id,
          merchantId: merchant_id,
          autoAcceptOrders: auto_accept_orders || false,
          autoSyncMenu: auto_sync_menu !== false,
          isActive: false,
          syncStatus: 'pending'
        }
      });

      return NextResponse.json(integration);
    }
  } catch (error) {
    console.error('Erro ao salvar integração:', error);
    return new NextResponse('Erro ao salvar integração', { status: 500 });
  }
}
