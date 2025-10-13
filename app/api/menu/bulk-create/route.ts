import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Cria múltiplos itens do menu de uma vez
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
        restaurants: { take: 1 },
      },
    });

    if (!user || !user.restaurants[0]) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      );
    }

    const restaurant = user.restaurants[0];
    const formData = await req.formData();

    // Processa os itens
    const items = [];
    let index = 0;

    while (formData.has(`items[${index}][name]`)) {
      const name = formData.get(`items[${index}][name]`) as string;
      const description = formData.get(`items[${index}][description]`) as string || '';
      const price = parseFloat(formData.get(`items[${index}][price]`) as string);
      const categoryId = formData.get(`items[${index}][categoryId]`) as string;
      const isPromo = formData.get(`items[${index}][isPromo]`) === 'true';
      const originalPriceStr = formData.get(`items[${index}][originalPrice]`) as string;
      const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : undefined;
      const imageFile = formData.get(`items[${index}][image]`) as File | null;

      // Upload de imagem (se houver)
      let imagePath: string | null = null;
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Gera nome único para a imagem
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `${uniqueSuffix}-${imageFile.name.replace(/\s/g, '-')}`;
        const filepath = join(process.cwd(), 'public', 'uploads', filename);
        
        try {
          await writeFile(filepath, buffer);
          imagePath = `/uploads/${filename}`;
        } catch (error) {
          console.error('Erro ao salvar imagem:', error);
          // Deixa como null se falhar
        }
      }

      // Get customizations data
      const hasCustomizations = formData.get(`items[${index}][hasCustomizations]`) === 'true';
      const flavorsStr = formData.get(`items[${index}][flavors]`) as string;
      const maxFlavors = formData.get(`items[${index}][maxFlavors]`) as string;
      const bordersStr = formData.get(`items[${index}][borders]`) as string;
      const extrasStr = formData.get(`items[${index}][extras]`) as string;

      items.push({
        name,
        description,
        price,
        categoryId,
        restaurantId: restaurant.id,
        image: imagePath,
        isPromo,
        originalPrice,
        hasCustomizations,
        flavorsStr,
        maxFlavors,
        bordersStr,
        extrasStr,
      });

      index++;
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum item para criar' },
        { status: 400 }
      );
    }

    // Cria itens individualmente para pegar os IDs
    const createdItems = [];
    for (const itemData of items) {
      const { hasCustomizations, flavorsStr, maxFlavors, bordersStr, extrasStr, ...itemCreateData } = itemData;
      
      const createdItem = await prisma.menuItem.create({
        data: itemCreateData,
      });
      
      createdItems.push(createdItem);

      // Create customization groups if needed
      if (hasCustomizations) {
        const groups = [];

        // Flavors group
        if (flavorsStr) {
          try {
            const flavors = JSON.parse(flavorsStr);
            if (flavors.length > 0) {
              const flavorsGroup = await prisma.customizationGroup.create({
                data: {
                  name: 'Sabores',
                  description: `Escolha até ${maxFlavors || '2'} ${parseInt(maxFlavors || '2') > 1 ? 'sabores' : 'sabor'}`,
                  isRequired: true,
                  minSelections: 1,
                  maxSelections: parseInt(maxFlavors || '2'),
                  sortOrder: 0,
                  isActive: true,
                  restaurantId: restaurant.id,
                  options: {
                    create: flavors.map((flavor: string, i: number) => ({
                      name: flavor,
                      price: 0,
                      isActive: true,
                      sortOrder: i,
                    })),
                  },
                  menuItems: {
                    connect: { id: createdItem.id },
                  },
                },
              });
              groups.push(flavorsGroup.id);
            }
          } catch (e) {
            console.error('Error parsing flavors:', e);
          }
        }

        // Borders group
        if (bordersStr) {
          try {
            const borders = JSON.parse(bordersStr);
            if (borders.length > 0) {
              const bordersGroup = await prisma.customizationGroup.create({
                data: {
                  name: 'Bordas',
                  description: 'Escolha uma borda',
                  isRequired: false,
                  minSelections: 0,
                  maxSelections: 1,
                  sortOrder: 1,
                  isActive: true,
                  restaurantId: restaurant.id,
                  options: {
                    create: borders.map((border: any, i: number) => ({
                      name: border.name,
                      price: parseFloat(border.price || '0'),
                      isActive: true,
                      sortOrder: i,
                    })),
                  },
                  menuItems: {
                    connect: { id: createdItem.id },
                  },
                },
              });
              groups.push(bordersGroup.id);
            }
          } catch (e) {
            console.error('Error parsing borders:', e);
          }
        }

        // Extras group
        if (extrasStr) {
          try {
            const extras = JSON.parse(extrasStr);
            if (extras.length > 0) {
              const extrasGroup = await prisma.customizationGroup.create({
                data: {
                  name: 'Extras',
                  description: 'Adicione extras ao seu pedido',
                  isRequired: false,
                  minSelections: 0,
                  maxSelections: null,
                  sortOrder: 2,
                  isActive: true,
                  restaurantId: restaurant.id,
                  options: {
                    create: extras.map((extra: any, i: number) => ({
                      name: extra.name,
                      price: parseFloat(extra.price || '0'),
                      isActive: true,
                      sortOrder: i,
                    })),
                  },
                  menuItems: {
                    connect: { id: createdItem.id },
                  },
                },
              });
              groups.push(extrasGroup.id);
            }
          } catch (e) {
            console.error('Error parsing extras:', e);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: createdItems.length,
      message: `${createdItems.length} itens criados com sucesso!`,
    });
  } catch (error) {
    console.error('Erro ao criar itens em massa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar itens' },
      { status: 500 }
    );
  }
}
