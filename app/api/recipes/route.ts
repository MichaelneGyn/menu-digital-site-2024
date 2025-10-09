import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Listar todas as receitas do restaurante
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user!.email },
      include: { restaurants: true }
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    const restaurantId = user.restaurants[0].id;

    // Buscar todas as receitas
    let recipes: any[] = [];
    try {
      recipes = await (prisma as any).recipe.findMany({
      where: {
        menuItem: {
          restaurantId
        }
      },
      include: {
        menuItem: {
          include: {
            category: true
          }
        },
        items: {
          include: {
            ingredient: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    } catch (prismaError) {
      console.log('Receitas ainda não disponíveis:', prismaError);
    }

    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return NextResponse.json({ error: 'Erro ao buscar receitas' }, { status: 500 });
  }
}

// POST - Criar nova receita
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { menuItemId, items, notes } = body;

    if (!menuItemId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Item do menu e ingredientes são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar item do menu para pegar o preço
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId }
    });

    if (!menuItem) {
      return NextResponse.json({ error: 'Item do menu não encontrado' }, { status: 404 });
    }

    // Calcular custo total
    let totalCost = 0;
    const ingredientsData = [];

    for (const item of items) {
      const ingredient = await (prisma as any).ingredient.findUnique({
        where: { id: item.ingredientId }
      });

      if (!ingredient) {
        return NextResponse.json(
          { error: `Ingrediente ${item.ingredientId} não encontrado` },
          { status: 404 }
        );
      }

      const cost = (item.quantity * ingredient.pricePerUnit);
      totalCost += cost;

      ingredientsData.push({
        ingredientId: item.ingredientId,
        quantity: parseFloat(item.quantity),
        cost
      });
    }

    // Calcular CMV e margem
    const cmv = (totalCost / menuItem.price) * 100;
    const margin = 100 - cmv;

    // Criar receita
    const recipe = await (prisma as any).recipe.create({
      data: {
        menuItemId,
        totalCost,
        cmv,
        margin,
        notes: notes || null,
        items: {
          create: ingredientsData
        }
      },
      include: {
        items: {
          include: {
            ingredient: true
          }
        },
        menuItem: true
      }
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar receita:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma receita para este item do menu' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Erro ao criar receita' }, { status: 500 });
  }
}

// PUT - Atualizar receita
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
    const { items, notes } = body;

    // Buscar receita existente com item do menu
    const existingRecipe = await (prisma as any).recipe.findUnique({
      where: { id },
      include: { menuItem: true }
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Receita não encontrada' }, { status: 404 });
    }

    // Deletar ingredientes antigos
    await (prisma as any).recipeItem.deleteMany({
      where: { recipeId: id }
    });

    // Calcular novo custo total
    let totalCost = 0;
    const ingredientsData = [];

    for (const item of items) {
      const ingredient = await (prisma as any).ingredient.findUnique({
        where: { id: item.ingredientId }
      });

      if (!ingredient) {
        return NextResponse.json(
          { error: `Ingrediente ${item.ingredientId} não encontrado` },
          { status: 404 }
        );
      }

      const cost = (item.quantity * ingredient.pricePerUnit);
      totalCost += cost;

      ingredientsData.push({
        ingredientId: item.ingredientId,
        quantity: parseFloat(item.quantity),
        cost
      });
    }

    // Calcular CMV e margem
    const cmv = (totalCost / existingRecipe.menuItem.price) * 100;
    const margin = 100 - cmv;

    // Atualizar receita
    const recipe = await (prisma as any).recipe.update({
      where: { id },
      data: {
        totalCost,
        cmv,
        margin,
        notes: notes !== undefined ? notes : existingRecipe.notes,
        items: {
          create: ingredientsData
        }
      },
      include: {
        items: {
          include: {
            ingredient: true
          }
        },
        menuItem: true
      }
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    return NextResponse.json({ error: 'Erro ao atualizar receita' }, { status: 500 });
  }
}

// DELETE - Deletar receita
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

    // Deletar receita
    await (prisma as any).recipe.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Receita deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar receita:', error);
    return NextResponse.json({ error: 'Erro ao deletar receita' }, { status: 500 });
  }
}