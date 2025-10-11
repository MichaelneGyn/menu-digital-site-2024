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

      items.push({
        name,
        description,
        price,
        categoryId,
        restaurantId: restaurant.id,
        image: imagePath,
        isPromo,
        originalPrice,
      });

      index++;
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum item para criar' },
        { status: 400 }
      );
    }

    // Cria todos os itens
    await prisma.menuItem.createMany({
      data: items,
    });

    return NextResponse.json({
      success: true,
      count: items.length,
      message: `${items.length} itens criados com sucesso!`,
    });
  } catch (error) {
    console.error('Erro ao criar itens em massa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar itens' },
      { status: 500 }
    );
  }
}
