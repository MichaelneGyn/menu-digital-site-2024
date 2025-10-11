import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

type ParsedItem = {
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isPromo: boolean;
  originalPrice?: number;
};

type ImportResult = {
  success: number;
  errors: Array<{ line: number; error: string }>;
  items: Array<{ name: string; price: number }>;
};

/**
 * Importa itens do cardápio em massa via CSV
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Busca o usuário e seu restaurante
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        restaurants: {
          take: 1,
          include: {
            categories: true,
          },
        },
      },
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado. Crie um restaurante primeiro.' },
        { status: 404 }
      );
    }

    const restaurant = user.restaurants[0];

    // Processa o arquivo
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Lê o conteúdo do arquivo
    const text = await file.text();
    
    // Parse CSV
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Arquivo vazio ou inválido' },
        { status: 400 }
      );
    }

    // Remove header
    const dataLines = lines.slice(1);

    const result: ImportResult = {
      success: 0,
      errors: [],
      items: [],
    };

    // Cache de categorias para evitar múltiplas queries
    const categoryCache = new Map<string, string>();
    restaurant.categories.forEach(cat => {
      categoryCache.set(cat.name.toLowerCase(), cat.id);
    });

    // Processa cada linha
    for (let i = 0; i < dataLines.length; i++) {
      const lineNumber = i + 2; // +2 porque pulamos header e array é 0-indexed
      const line = dataLines[i].trim();
      
      if (!line) continue;

      try {
        const item = parseCSVLine(line);
        
        // Valida item
        if (!item.name || !item.price || !item.category) {
          result.errors.push({
            line: lineNumber,
            error: 'Nome, preço e categoria são obrigatórios',
          });
          continue;
        }

        // Busca ou cria a categoria
        let categoryId = categoryCache.get(item.category.toLowerCase());
        
        if (!categoryId) {
          const newCategory = await prisma.category.create({
            data: {
              name: item.category,
              icon: '🍽️', // Ícone padrão
              restaurantId: restaurant.id,
            },
          });
          categoryId = newCategory.id;
          categoryCache.set(item.category.toLowerCase(), categoryId);
        }

        // Cria o item do menu
        const menuItem = await prisma.menuItem.create({
          data: {
            name: item.name,
            description: item.description || '',
            price: item.price,
            image: item.image || null,
            isPromo: item.isPromo,
            originalPrice: item.originalPrice,
            categoryId,
            restaurantId: restaurant.id,
          },
        });

        result.success++;
        result.items.push({
          name: menuItem.name,
          price: menuItem.price,
        });
      } catch (error: any) {
        result.errors.push({
          line: lineNumber,
          error: error.message || 'Erro ao processar linha',
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao importar cardápio:', error);
    return NextResponse.json(
      { error: 'Erro ao importar cardápio' },
      { status: 500 }
    );
  }
}

/**
 * Faz parse de uma linha CSV
 * Formato: Nome,Descrição,Preço,Categoria,Imagem,É Promoção?,Preço Original
 */
function parseCSVLine(line: string): ParsedItem {
  // Split considerando vírgulas dentro de aspas
  const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
  const parts = line.split(regex).map(part => 
    part.trim().replace(/^"|"$/g, '')
  );

  const [
    name,
    description,
    priceStr,
    category,
    image,
    isPromoStr,
    originalPriceStr,
  ] = parts;

  // Parse price
  const price = parseFloat(priceStr?.replace(',', '.') || '0');
  
  // Parse isPromo
  const isPromo = isPromoStr?.toLowerCase() === 'sim' || 
                  isPromoStr?.toLowerCase() === 's' ||
                  isPromoStr?.toLowerCase() === 'true';

  // Parse originalPrice
  const originalPrice = originalPriceStr 
    ? parseFloat(originalPriceStr.replace(',', '.'))
    : undefined;

  if (isNaN(price) || price <= 0) {
    throw new Error('Preço inválido');
  }

  return {
    name,
    description,
    price,
    category,
    image: image || undefined,
    isPromo,
    originalPrice,
  };
}
