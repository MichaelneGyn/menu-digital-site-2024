import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Listar todos os ingredientes do restaurante
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar restaurante do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const restaurantId = user.restaurants[0].id;

    // Buscar ingredientes com histórico de preços
    try {
      const ingredients = await (prisma as any).ingredient.findMany({
        where: { restaurantId },
        include: {
          priceHistory: {
            orderBy: { date: 'desc' },
            take: 10
          },
          _count: {
            select: { recipeItems: true }
          }
        },
        orderBy: { name: 'asc' }
      });

      return NextResponse.json(ingredients);
    } catch (prismaError) {
      console.log('Ingredientes ainda não disponíveis:', prismaError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Erro ao buscar ingredientes:', error);
    return NextResponse.json({ error: 'Erro ao buscar ingredientes' }, { status: 500 });
  }
}

// POST - Criar novo ingrediente
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const restaurantId = user.restaurants[0].id;
    const body = await request.json();

    const { name, unit, pricePerUnit, supplier, lastPurchase, notes } = body;

    // Validações
    if (!name || !unit || pricePerUnit === undefined) {
      return NextResponse.json(
        { error: 'Nome, unidade e preço são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar ingrediente
    const ingredient = await (prisma as any).ingredient.create({
      data: {
        restaurantId,
        name,
        unit,
        pricePerUnit: parseFloat(pricePerUnit),
        supplier: supplier || null,
        lastPurchase: lastPurchase ? new Date(lastPurchase) : null,
        notes: notes || null
      }
    });

    // Criar registro no histórico de preços
    await (prisma as any).ingredientPriceHistory.create({
      data: {
        ingredientId: ingredient.id,
        price: parseFloat(pricePerUnit)
      }
    });

    return NextResponse.json(ingredient, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar ingrediente:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um ingrediente com esse nome' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Erro ao criar ingrediente' }, { status: 500 });
  }
}

// PUT - Atualizar ingrediente
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const body = await request.json();
    const { name, unit, pricePerUnit, supplier, lastPurchase, notes } = body;

    // Buscar ingrediente existente
    const existingIngredient = await (prisma as any).ingredient.findUnique({
      where: { id }
    });

    if (!existingIngredient) {
      return NextResponse.json({ error: 'Ingrediente não encontrado' }, { status: 404 });
    }

    // Se o preço mudou, registrar no histórico
    if (pricePerUnit && parseFloat(pricePerUnit) !== existingIngredient.pricePerUnit) {
      await (prisma as any).ingredientPriceHistory.create({
        data: {
          ingredientId: id,
          price: parseFloat(pricePerUnit)
        }
      });
    }

    // Atualizar ingrediente
    const ingredient = await (prisma as any).ingredient.update({
      where: { id },
      data: {
        name: name || existingIngredient.name,
        unit: unit || existingIngredient.unit,
        pricePerUnit: pricePerUnit ? parseFloat(pricePerUnit) : existingIngredient.pricePerUnit,
        supplier: supplier !== undefined ? supplier : existingIngredient.supplier,
        lastPurchase: lastPurchase ? new Date(lastPurchase) : existingIngredient.lastPurchase,
        notes: notes !== undefined ? notes : existingIngredient.notes
      }
    });

    return NextResponse.json(ingredient);
  } catch (error) {
    console.error('Erro ao atualizar ingrediente:', error);
    return NextResponse.json({ error: 'Erro ao atualizar ingrediente' }, { status: 500 });
  }
}

// DELETE - Deletar ingrediente
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Verificar se ingrediente está em uso
    const ingredient = await (prisma as any).ingredient.findUnique({
      where: { id },
      include: {
        _count: {
          select: { recipeItems: true }
        }
      }
    });

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingrediente não encontrado' }, { status: 404 });
    }

    if (ingredient._count.recipeItems > 0) {
      return NextResponse.json(
        { error: `Este ingrediente está sendo usado em ${ingredient._count.recipeItems} receita(s)` },
        { status: 400 }
      );
    }

    // Deletar ingrediente
    await (prisma as any).ingredient.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Ingrediente deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ingrediente:', error);
    return NextResponse.json({ error: 'Erro ao deletar ingrediente' }, { status: 500 });
  }
}
