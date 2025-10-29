import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { uploadFileToSupabase } from '@/lib/supabase-storage';
import { uploadFileToCloudinary } from '@/lib/cloudinary';
import { uploadFile } from '@/lib/s3';

// Ensure Node runtime and disable static optimization so logs appear
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      const costStr = formData.get(`items[${index}][cost]`) as string;
      const cost = costStr ? parseFloat(costStr) : undefined;
      const categoryId = formData.get(`items[${index}][categoryId]`) as string;
      const originalPriceStr = formData.get(`items[${index}][originalPrice]`) as string;
      const originalPrice = originalPriceStr ? parseFloat(originalPriceStr) : undefined;
      const imageFile = formData.get(`items[${index}][image]`) as File | null;
      const preUploadedImageUrl = formData.get(`items[${index}][imageUrl]`) as string | null;

      // Upload de imagem (se houver) - Usa Supabase/Cloudinary/S3.
      // Prefer pre-uploaded URL if provided (from /api/upload)
      let imagePath: string | null = null;

      if (preUploadedImageUrl && typeof preUploadedImageUrl === 'string' && preUploadedImageUrl.length > 0) {
        imagePath = preUploadedImageUrl;
        console.log(`✅ [BulkCreate] Usando URL de imagem já enviada: ${imagePath}`);
        console.log(`🔍 [BulkCreate] Tipo da URL:`, typeof imagePath);
        console.log(`🔍 [BulkCreate] URL começa com http?`, imagePath.startsWith('http'));
        console.log(`🔍 [BulkCreate] Tamanho da URL:`, imagePath.length, 'caracteres');
      } else if (imageFile && imageFile.size > 0) {
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
                // Se não há storage configurado, retorna erro explícito
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
        console.log(`⚠️ [BulkCreate] Item "${name}" sem imagem: nenhum URL pré-enviado e nenhum arquivo recebido.`);
      }
      
      console.log(`💾 [BulkCreate] Item "${name}" será salvo com imagem:`, imagePath || 'NULL');
      if (imagePath) {
        console.log(`📊 [BulkCreate] Estatísticas da imagem:`);
        console.log(`   - É URL válida? ${imagePath.startsWith('http')}`);
        console.log(`   - É Base64? ${imagePath.startsWith('data:')}`);
        console.log(`   - Tamanho: ${imagePath.length} caracteres`);
      }

      // Get customizations data
      const isPromo = formData.get(`items[${index}][isPromo]`) === 'true';
      const hasCustomizations = formData.get(`items[${index}][hasCustomizations]`) === 'true';
      const customizationGroupsStr = formData.get(`items[${index}][customizationGroups]`) as string;

      items.push({
        name,
        description,
        price,
        cost,
        categoryId,
        restaurantId: restaurant.id,
        image: imagePath,
        isPromo,
        originalPrice,
        hasCustomizations,
        customizationGroupsStr,
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
      const { hasCustomizations, customizationGroupsStr, ...itemCreateData } = itemData;
      
      const createdItem = await prisma.menuItem.create({
        data: itemCreateData,
      });
      
      createdItems.push(createdItem);

      // Create customization groups if needed (NOVO SISTEMA)
      if (hasCustomizations && customizationGroupsStr) {
        try {
          const customizationGroups = JSON.parse(customizationGroupsStr);
          console.log(`📦 [BulkCreate] Criando ${customizationGroups.length} grupos para "${createdItem.name}"`);
          
          for (const group of customizationGroups) {
            await prisma.customizationGroup.create({
              data: {
                name: group.name,
                description: group.description || '',
                isRequired: group.isRequired || false,
                minSelections: group.minSelections || 0,
                maxSelections: group.maxSelections || null,
                sortOrder: group.sortOrder || 0,
                isActive: true,
                restaurantId: restaurant.id,
                options: {
                  create: (group.options || []).map((option: any, i: number) => ({
                    name: option.name,
                    price: parseFloat(option.price || '0'),
                    isActive: true,
                    sortOrder: i,
                  })),
                },
                menuItems: {
                  connect: { id: createdItem.id },
                },
              },
            });
          }
          console.log(`✅ [BulkCreate] Grupos criados com sucesso para "${createdItem.name}"`);
        } catch (e) {
          console.error(`❌ [BulkCreate] Erro ao criar grupos de personalização para "${createdItem.name}":`, e);
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
