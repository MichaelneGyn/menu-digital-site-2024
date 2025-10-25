
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

    // 🔒 SEGURANÇA 1: Validar magic numbers (assinaturas de arquivo)
    // Garante que é REALMENTE uma imagem, não um executável renomeado!
    const magicNumbers: { [key: string]: number[] } = {
      jpg: [0xFF, 0xD8, 0xFF],
      jpeg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      gif: [0x47, 0x49, 0x46],
      webp: [0x52, 0x49, 0x46, 0x46]
    };

    const signature = magicNumbers[fileExtension];
    if (signature && !signature.every((byte, index) => buffer[index] === byte)) {
      return NextResponse.json({ 
        error: '🚨 Arquivo corrompido ou tipo inválido. Possível tentativa de ataque detectada.' 
      }, { status: 400 });
    }

    // 🔒 SEGURANÇA 2: Validar dimensões da imagem (previne DoS com imagens gigantes)
    // Usa sharp (se disponível) ou fallback para validação básica
    try {
      // Tenta importar sharp (biblioteca de processamento de imagem)
      const sharp = require('sharp');
      const metadata = await sharp(buffer).metadata();
      
      // Limites razoáveis: máx 8000x8000 pixels (previne DoS)
      const MAX_WIDTH = 8000;
      const MAX_HEIGHT = 8000;
      const MAX_PIXELS = 50_000_000; // 50 megapixels (previne bomba de descompressão)
      
      if (metadata.width && metadata.height) {
        if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
          return NextResponse.json({ 
            error: `🚨 Imagem muito grande! Máximo: ${MAX_WIDTH}x${MAX_HEIGHT} pixels. Sua imagem: ${metadata.width}x${metadata.height}` 
          }, { status: 400 });
        }
        
        const totalPixels = metadata.width * metadata.height;
        if (totalPixels > MAX_PIXELS) {
          return NextResponse.json({ 
            error: `🚨 Imagem com muitos pixels! Possível ataque DoS detectado.` 
          }, { status: 400 });
        }
        
        console.log(`✅ [Security] Image validated: ${metadata.width}x${metadata.height} (${metadata.format})`);
      }
    } catch (sharpError) {
      // Sharp não disponível ou erro ao processar
      // Continua sem validação de dimensões (fallback)
      console.warn('⚠️ [Security] Sharp não disponível - dimensões não validadas:', sharpError);
    }
    let imageUrl: string | undefined;
    let cloud_storage_path: string | undefined;

    // PRIORIDADE 1: Supabase Storage (agora funcionando após recriar bucket!)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // 🔒 SEGURANÇA: Usar APENAS SERVICE_ROLE_KEY, nunca ANON_KEY para uploads
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseKey) {
      console.error('❌ [SECURITY] SUPABASE_SERVICE_ROLE_KEY não configurada!');
      return NextResponse.json(
        { error: 'Configuração de storage incorreta. Contate o administrador.' },
        { status: 500 }
      );
    }
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
      // Tenta S3 primeiro; se falhar, em DEV salva localmente
      try {
        cloud_storage_path = await uploadFile(buffer, file.name);
        imageUrl = `/api/image?key=${encodeURIComponent(cloud_storage_path)}`;
      } catch (err: any) {
        console.error('Falha ao enviar para S3:', err);
        
        if (isDev) {
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
            // NUNCA substitui a imagem do usuário por imagens genéricas
            return NextResponse.json({ 
              error: 'Erro ao salvar imagem. Verifique as configurações de storage.' 
            }, { status: 500 });
          }
        } else {
          // Em produção, retorna erro se não conseguir fazer upload
          return NextResponse.json({ 
            error: 'Erro ao fazer upload da imagem. Verifique as configurações de storage (Supabase/Cloudinary/S3).' 
          }, { status: 500 });
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
