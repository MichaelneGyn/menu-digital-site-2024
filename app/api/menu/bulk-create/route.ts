import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFileToSupabase } from '@/lib/supabase-storage';
import { uploadFileToCloudinary } from '@/lib/cloudinary';
import { uploadFile } from '@/lib/s3';

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

      // Upload de imagem (se houver) - Usa Supabase/Cloudinary/S3
      let imagePath: string | null = null;
      
      console.log(`🔍 [BulkCreate] Item "${name}" - imageFile:`, imageFile ? `${imageFile.name} (${imageFile.size} bytes)` : 'NULL');
      
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        console.log(`📤 [BulkCreate] Iniciando upload da imagem "${imageFile.name}" (${buffer.length} bytes)`);
        
        try {
          // PRIORIDADE 1: Supabase Storage
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          
          if (supabaseUrl && supabaseKey) {
            console.log('📸 [BulkCreate] Usando Supabase Storage...');
            imagePath = await uploadFileToSupabase(buffer, imageFile.name);
            console.log('✅ [BulkCreate] Supabase upload bem-sucedido! URL:', imagePath);
          }
          // PRIORIDADE 2: Cloudinary
          else {
            const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
            const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
            const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
            
            if (cloudinaryName && cloudinaryKey && cloudinarySecret) {
              console.log('📸 [BulkCreate] Usando Cloudinary...');
              imagePath = await uploadFileToCloudinary(buffer, imageFile.name);
              console.log('✅ [BulkCreate] Cloudinary upload bem-sucedido! URL:', imagePath);
            }
            // PRIORIDADE 3: AWS S3
            else {
              const awsBucket = process.env.AWS_BUCKET_NAME;
              if (awsBucket) {
                console.log('📸 [BulkCreate] Usando AWS S3...');
                const s3Key = await uploadFile(buffer, imageFile.name);
                imagePath = `/api/image?key=${encodeURIComponent(s3Key)}`;
                console.log('✅ [BulkCreate] S3 upload bem-sucedido! URL:', imagePath);
              } else {
                console.error('❌ [BulkCreate] Nenhum storage configurado (Supabase/Cloudinary/S3)');
                // Se não há storage configurado, NÃO cria o item com imagem null
                throw new Error('Sistema de storage não configurado. Configure Supabase, Cloudinary ou S3.');
              }
            }
          }
        } catch (error: any) {
          console.error('❌ [BulkCreate] Erro ao fazer upload da imagem:', error);
          // Se o usuário forneceu uma imagem mas o upload falhou, retorna erro
          throw new Error(`Erro ao fazer upload da imagem "${imageFile.name}": ${error.message}`);
        }
      } else {
        console.log(`⚠️ [BulkCreate] Item "${name}" criado SEM imagem (imageFile vazio ou null)`);
      }
      
      console.log(`💾 [BulkCreate] Item "${name}" será salvo com imagem:`, imagePath || 'NULL');

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
