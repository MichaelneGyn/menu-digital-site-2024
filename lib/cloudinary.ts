/**
 * Cloudinary Upload
 * Alternativa simples e com limites generosos (25 GB grátis)
 */

import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary não configurado. Verifique CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
};

/**
 * Faz upload de arquivo para Cloudinary
 * @param buffer Buffer do arquivo
 * @param fileName Nome original do arquivo
 * @returns URL pública otimizada
 */
export async function uploadFileToCloudinary(buffer: Buffer, fileName: string): Promise<string> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    // Criar stream de upload
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'menu-digital', // Pasta para organizar no Cloudinary
        public_id: `${Date.now()}-${fileName.replace(/\.[^/.]+$/, '')}`, // Nome único sem extensão
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // Limita tamanho máximo
          { quality: 'auto' }, // Qualidade automática
          { fetch_format: 'auto' }, // Formato automático (WebP se suportado)
        ],
        tags: ['menu-item', 'product'], // Tags para organização
      },
      (error, result) => {
        if (error) {
          console.error('❌ [Cloudinary] Upload error:', error);
          reject(new Error(`Erro ao fazer upload: ${error.message}`));
          return;
        }

        if (!result) {
          console.error('❌ [Cloudinary] No result returned');
          reject(new Error('Erro ao fazer upload: resultado vazio'));
          return;
        }

        console.log('✅ [Cloudinary] Upload successful:', result.secure_url);
        
        // Retorna URL otimizada
        resolve(result.secure_url);
      }
    );

    // Envia o buffer para o stream
    uploadStream.end(buffer);
  });
}

/**
 * Deleta arquivo do Cloudinary
 * @param imageUrl URL pública da imagem
 */
export async function deleteFileFromCloudinary(imageUrl: string): Promise<void> {
  configureCloudinary();

  try {
    // Extrair public_id da URL
    // Exemplo: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/menu-digital/12345-image.jpg
    const urlParts = imageUrl.split('/upload/');
    if (urlParts.length < 2) {
      console.warn('⚠️ [Cloudinary] Invalid URL format:', imageUrl);
      return;
    }

    const pathWithVersion = urlParts[1];
    // Remove version (v1234567890/)
    const pathParts = pathWithVersion.split('/').slice(1);
    const publicId = pathParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extensão

    console.log('🗑️ [Cloudinary] Deleting file:', publicId);

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('✅ [Cloudinary] File deleted');
    } else {
      console.warn('⚠️ [Cloudinary] Delete result:', result);
    }
  } catch (error) {
    console.error('❌ [Cloudinary] Delete error:', error);
    throw error;
  }
}

/**
 * Gera URL otimizada para uma imagem existente
 * @param publicId Public ID da imagem no Cloudinary
 * @param width Largura desejada (opcional)
 * @param height Altura desejada (opcional)
 * @returns URL otimizada
 */
export function getOptimizedUrl(publicId: string, width?: number, height?: number): string {
  configureCloudinary();

  return cloudinary.url(publicId, {
    width: width || 800,
    height: height,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  });
}
