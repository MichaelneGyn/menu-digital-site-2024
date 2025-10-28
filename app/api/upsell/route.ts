import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Buscar regras de upsell do restaurante
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar restaurante do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true },
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const restaurantId = user.restaurants[0].id;

    // Buscar regras de upsell
    const upsellRules = await prisma.upsellRule.findMany({
      where: { restaurantId },
      orderBy: { priority: 'desc' },
    });

    return NextResponse.json(upsellRules);
  } catch (error) {
    console.error('Erro ao buscar regras de upsell:', error);
    return NextResponse.json({ error: 'Erro ao buscar regras' }, { status: 500 });
  }
}

// POST - Criar nova regra de upsell
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar restaurante do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true },
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const restaurantId = user.restaurants[0].id;
    const data = await request.json();

    // Criar regra de upsell
    const upsellRule = await prisma.upsellRule.create({
      data: {
        restaurantId,
        name: data.name,
        active: data.active ?? true,
        displayLocation: data.displayLocation ?? 'checkout',
        priority: data.priority ?? 0,
        productIds: data.productIds ?? [],
        title: data.title,
        subtitle: data.subtitle,
      },
    });

    return NextResponse.json(upsellRule, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar regra de upsell:', error);
    return NextResponse.json({ error: 'Erro ao criar regra' }, { status: 500 });
  }
}

// PUT - Atualizar regra de upsell
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'ID da regra é obrigatório' }, { status: 400 });
    }

    // Verificar se a regra pertence ao usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true },
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const existingRule = await prisma.upsellRule.findFirst({
      where: {
        id,
        restaurantId: user.restaurants[0].id,
      },
    });

    if (!existingRule) {
      return NextResponse.json({ error: 'Regra não encontrada' }, { status: 404 });
    }

    // Atualizar regra
    const updatedRule = await prisma.upsellRule.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error('Erro ao atualizar regra de upsell:', error);
    return NextResponse.json({ error: 'Erro ao atualizar regra' }, { status: 500 });
  }
}

// DELETE - Deletar regra de upsell
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da regra é obrigatório' }, { status: 400 });
    }

    // Verificar se a regra pertence ao usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true },
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const existingRule = await prisma.upsellRule.findFirst({
      where: {
        id,
        restaurantId: user.restaurants[0].id,
      },
    });

    if (!existingRule) {
      return NextResponse.json({ error: 'Regra não encontrada' }, { status: 404 });
    }

    // Deletar regra
    await prisma.upsellRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar regra de upsell:', error);
    return NextResponse.json({ error: 'Erro ao deletar regra' }, { status: 500 });
  }
}
