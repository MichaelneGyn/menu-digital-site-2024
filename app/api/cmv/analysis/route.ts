import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    // Buscar todas as receitas do restaurante
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
        }
      });
    } catch (prismaError) {
      console.log('Prisma error (models não encontrados):', prismaError);
      recipes = [];
    }

    if (recipes.length === 0) {
      return NextResponse.json({
        averageCMV: 0,
        totalRecipes: 0,
        productsWithCMV: 0,
        productsWithoutCMV: 0,
        bestProducts: [],
        worstProducts: [],
        cmvStatus: 'no_data',
        recommendations: []
      });
    }

    // Calcular estatísticas
    const totalCMV = recipes.reduce((sum, recipe) => sum + recipe.cmv, 0);
    const averageCMV = totalCMV / recipes.length;

    // Contar produtos com e sem receita
    const totalMenuItems = await prisma.menuItem.count({
      where: { restaurantId }
    });
    const productsWithCMV = recipes.length;
    const productsWithoutCMV = totalMenuItems - productsWithCMV;

    // Ordenar por rentabilidade (menor CMV = mais rentável)
    const sortedByProfit = [...recipes].sort((a, b) => a.cmv - b.cmv);
    
    // Top 5 mais rentáveis
    const bestProducts = sortedByProfit.slice(0, 5).map(recipe => ({
      id: recipe.menuItem.id,
      name: recipe.menuItem.name,
      category: recipe.menuItem.category.name,
      price: recipe.menuItem.price,
      cost: recipe.totalCost,
      cmv: recipe.cmv,
      margin: recipe.margin,
      status: recipe.cmv <= 28 ? 'excellent' : recipe.cmv <= 32 ? 'good' : 'warning'
    }));

    // Top 5 menos rentáveis
    const worstProducts = sortedByProfit.slice(-5).reverse().map(recipe => ({
      id: recipe.menuItem.id,
      name: recipe.menuItem.name,
      category: recipe.menuItem.category.name,
      price: recipe.menuItem.price,
      cost: recipe.totalCost,
      cmv: recipe.cmv,
      margin: recipe.margin,
      status: recipe.cmv <= 28 ? 'excellent' : recipe.cmv <= 32 ? 'good' : recipe.cmv <= 35 ? 'warning' : 'danger'
    }));

    // Status geral do CMV
    let cmvStatus: 'excellent' | 'good' | 'warning' | 'danger';
    if (averageCMV <= 28) cmvStatus = 'excellent';
    else if (averageCMV <= 32) cmvStatus = 'good';
    else if (averageCMV <= 35) cmvStatus = 'warning';
    else cmvStatus = 'danger';

    // Gerar recomendações inteligentes
    const recommendations = [];

    // Recomendação: CMV Alto
    const highCMVProducts = recipes.filter(r => r.cmv > 35);
    if (highCMVProducts.length > 0) {
      recommendations.push({
        type: 'danger',
        title: `${highCMVProducts.length} produto(s) com CMV crítico (>35%)`,
        description: 'Estes produtos podem estar gerando prejuízo. Considere ajustar preços ou reduzir custos.',
        products: highCMVProducts.map(r => r.menuItem.name).slice(0, 3)
      });
    }

    // Recomendação: Produtos sem receita
    if (productsWithoutCMV > 0) {
      recommendations.push({
        type: 'warning',
        title: `${productsWithoutCMV} produto(s) sem custo cadastrado`,
        description: 'Cadastre o custo destes produtos para ter controle total do seu cardápio.',
        action: 'Cadastrar custos'
      });
    }

    // Recomendação: CMV Médio Alto
    if (averageCMV > 32 && averageCMV <= 35) {
      recommendations.push({
        type: 'warning',
        title: 'CMV médio acima do ideal',
        description: `Seu CMV médio (${averageCMV.toFixed(1)}%) está acima do recomendado (28-32%). Revise seus preços.`,
        action: 'Ver produtos com CMV alto'
      });
    }

    // Recomendação: Oportunidades de melhoria
    const opportunityProducts = recipes.filter(r => r.cmv > 32 && r.cmv <= 38);
    if (opportunityProducts.length > 0) {
      const product = opportunityProducts[0];
      const priceIncrease = ((product.totalCost / 0.30) - product.menuItem.price);
      
      recommendations.push({
        type: 'info',
        title: 'Oportunidade de melhoria',
        description: `${product.menuItem.name}: aumentando R$ ${priceIncrease.toFixed(2)}, o CMV cairia para 30%`,
        product: product.menuItem.name,
        currentPrice: product.menuItem.price,
        suggestedPrice: product.totalCost / 0.30
      });
    }

    // Análise por categoria
    const categoryAnalysis = await analyzeCMVByCategory(recipes);

    // Evolução mensal (últimos 6 meses)
    const monthlyEvolution = await getMonthlyEvolution(restaurantId);

    return NextResponse.json({
      averageCMV: parseFloat(averageCMV.toFixed(2)),
      totalRecipes: recipes.length,
      productsWithCMV,
      productsWithoutCMV,
      bestProducts,
      worstProducts,
      cmvStatus,
      recommendations,
      categoryAnalysis,
      monthlyEvolution,
      benchmarks: {
        ideal: { min: 25, max: 28, label: 'CMV Ideal' },
        good: { min: 28, max: 32, label: 'CMV Bom' },
        warning: { min: 32, max: 35, label: 'Atenção' },
        danger: { min: 35, max: 100, label: 'Crítico' }
      }
    });
  } catch (error) {
    console.error('Erro ao analisar CMV:', error);
    return NextResponse.json({ error: 'Erro ao analisar CMV' }, { status: 500 });
  }
}

// Função auxiliar: Analisar CMV por categoria
async function analyzeCMVByCategory(recipes: any[]) {
  const categoryMap = new Map();

  recipes.forEach(recipe => {
    const categoryName = recipe.menuItem.category.name;
    
    if (!categoryMap.has(categoryName)) {
      categoryMap.set(categoryName, {
        name: categoryName,
        products: [],
        totalCMV: 0,
        count: 0
      });
    }

    const category = categoryMap.get(categoryName);
    category.products.push(recipe.menuItem.name);
    category.totalCMV += recipe.cmv;
    category.count += 1;
  });

  return Array.from(categoryMap.values()).map(category => ({
    name: category.name,
    averageCMV: parseFloat((category.totalCMV / category.count).toFixed(2)),
    productsCount: category.count,
    status: 
      category.totalCMV / category.count <= 28 ? 'excellent' :
      category.totalCMV / category.count <= 32 ? 'good' :
      category.totalCMV / category.count <= 35 ? 'warning' : 'danger'
  })).sort((a, b) => a.averageCMV - b.averageCMV);
}

// Função auxiliar: Evolução mensal (simulada por agora)
async function getMonthlyEvolution(restaurantId: string) {
  // Por agora, retorna dados simulados
  // Em produção, você buscaria do histórico real
  return [
    { month: 'Jan', cmv: 32.5 },
    { month: 'Fev', cmv: 31.8 },
    { month: 'Mar', cmv: 30.5 },
    { month: 'Abr', cmv: 29.2 },
    { month: 'Mai', cmv: 28.8 },
    { month: 'Jun', cmv: 30.1 }
  ];
}
