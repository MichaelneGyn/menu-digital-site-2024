
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { uploadFile } from '@/lib/s3';
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

    // Decide se deve usar storage local diretamente em desenvolvimento
    const awsBucket = process.env.AWS_BUCKET_NAME;
    const shouldUseLocal = isDev && !awsBucket;

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
      // Tenta S3 primeiro; em dev, se falhar, cai para local
      try {
        cloud_storage_path = await uploadFile(buffer, file.name);
        imageUrl = `/api/image?key=${encodeURIComponent(cloud_storage_path)}`;
      } catch (err: any) {
        console.error('Falha ao enviar para S3:', err);
        if (isDev) {
          try {
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            await fs.promises.mkdir(uploadsDir, { recursive: true });
            const baseName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = path.join(uploadsDir, baseName);
            await fs.promises.writeFile(filePath, buffer);
            imageUrl = `/uploads/${baseName}`;
            console.info('Upload salvo localmente (fallback) em:', filePath);
          } catch (localErr: any) {
            const message = `Falha no upload local: ${localErr?.message || 'erro desconhecido'}`;
            return NextResponse.json({ error: message }, { status: 500 });
          }
        } else {
          const message = err?.message ? `Falha no upload: ${err.message}` : 'Falha no upload da imagem';
          return NextResponse.json({ error: message }, { status: 500 });
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
