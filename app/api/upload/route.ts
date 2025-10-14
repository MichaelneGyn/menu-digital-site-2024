
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { uploadFile } from '@/lib/s3';
import { uploadFileToSupabase } from '@/lib/supabase-storage';
import { uploadFileToCloudinary } from '@/lib/cloudinary';
import { apiRateLimiter } from '@/lib/rate-limit';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    
    // Rate limiting (60 uploads por minuto por IP)
    if (!isDev) {
      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      const limitResult = apiRateLimiter(ip);
      
      if (!limitResult.success) {
        return limitResult.response!;
      }
    }
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email && !isDev) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use apenas imagens.' }, { status: 400 });
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 });
    }

    // Validar extensão do arquivo
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json({ error: 'Extensão de arquivo não permitida.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validar magic numbers (assinaturas de arquivo) para garantir que é realmente uma imagem
    const magicNumbers: { [key: string]: number[] } = {
      jpg: [0xFF, 0xD8, 0xFF],
      jpeg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      gif: [0x47, 0x49, 0x46],
      webp: [0x52, 0x49, 0x46, 0x46]
    };

    const signature = magicNumbers[fileExtension];
    if (signature && !signature.every((byte, index) => buffer[index] === byte)) {
      return NextResponse.json({ error: 'Arquivo corrompido ou tipo inválido.' }, { status: 400 });
    }
    let imageUrl: string | undefined;
    let cloud_storage_path: string | undefined;

    // PRIORIDADE 1: Supabase Storage (mais confiável - você já tem!)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const useSupabase = supabaseUrl && supabaseKey;

    if (useSupabase) {
      console.log('📸 [Upload] Usando Supabase Storage...');
      try {
        imageUrl = await uploadFileToSupabase(buffer, file.name);
        console.log('✅ [Upload] Supabase upload bem-sucedido:', imageUrl);
        
        return NextResponse.json({ 
          success: true, 
          image_url: imageUrl,
          message: 'Imagem enviada com sucesso via Supabase!' 
        });
      } catch (supabaseError: any) {
        console.error('❌ [Upload] Supabase falhou:', supabaseError.message);
        // Continua para próximas opções
      }
    }

    // PRIORIDADE 2: Cloudinary (se Supabase falhar)
    const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME;
    const cloudinaryKey = process.env.CLOUDINARY_API_KEY;
    const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
    const useCloudinary = cloudinaryName && cloudinaryKey && cloudinarySecret;

    if (useCloudinary) {
      console.log('📸 [Upload] Tentando Cloudinary...');
      try {
        imageUrl = await uploadFileToCloudinary(buffer, file.name);
        console.log('✅ [Upload] Cloudinary upload bem-sucedido:', imageUrl);
        
        return NextResponse.json({ 
          success: true, 
          image_url: imageUrl,
          message: 'Imagem enviada com sucesso via Cloudinary!' 
        });
      } catch (cloudinaryError: any) {
        console.error('❌ [Upload] Cloudinary falhou:', cloudinaryError.message);
        // Continua para próximas opções
      }
    }

    // PRIORIDADE 3: AWS S3 (se configurado)
    const awsBucket = process.env.AWS_BUCKET_NAME;
    const shouldUseLocal = isDev && !awsBucket && !useSupabase && !useCloudinary;

    if (shouldUseLocal) {
      // Grava localmente sem tentar S3
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        const baseName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = path.join(uploadsDir, baseName);
        await fs.promises.writeFile(filePath, buffer);
        imageUrl = `/uploads/${baseName}`;
        console.info('Upload salvo localmente em:', filePath);
      } catch (localErr: any) {
        const message = `Falha no upload local: ${localErr?.message || 'erro desconhecido'}`;
        return NextResponse.json({ error: message }, { status: 500 });
      }
    } else {
      // Tenta S3 primeiro; se falhar, usa imagem padrão
      try {
        cloud_storage_path = await uploadFile(buffer, file.name);
        imageUrl = `/api/image?key=${encodeURIComponent(cloud_storage_path)}`;
      } catch (err: any) {
        console.error('Falha ao enviar para S3:', err);
        
        // Se S3 não está configurado, retorna URL de imagem padrão (Unsplash)
        if (err?.message?.includes('AWS_BUCKET_NAME') || err?.message?.includes('não configurado')) {
          console.warn('⚠️ AWS S3 não configurado. Usando imagem padrão do Unsplash.');
          
          // Usar diferentes imagens padrão baseadas no tipo de arquivo
          const defaultImages = [
            'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800', // Pizza
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800', // Burger
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800', // Pizza 2
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', // Salad
          ];
          
          // Seleciona uma imagem aleatória
          imageUrl = defaultImages[Math.floor(Math.random() * defaultImages.length)];
          
          console.info('✅ Usando imagem padrão:', imageUrl);
        } else if (isDev) {
          // Em desenvolvimento, tenta salvar localmente
          try {
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            await fs.promises.mkdir(uploadsDir, { recursive: true });
            const baseName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = path.join(uploadsDir, baseName);
            await fs.promises.writeFile(filePath, buffer);
            imageUrl = `/uploads/${baseName}`;
            console.info('Upload salvo localmente (fallback) em:', filePath);
          } catch (localErr: any) {
            // Se falhar local também, usa imagem padrão
            console.warn('⚠️ Fallback local falhou. Usando imagem padrão.');
            imageUrl = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800';
          }
        } else {
          // Em produção sem S3, usa imagem padrão
          console.warn('⚠️ Produção sem S3 configurado. Usando imagem padrão.');
          imageUrl = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800';
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      cloud_storage_path,
      image_url: imageUrl,
      message: 'Imagem enviada com sucesso!' 
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    const isDev = process.env.NODE_ENV !== 'production';
    const message = isDev && (error as any)?.message ? (error as any).message : 'Erro interno do servidor';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
