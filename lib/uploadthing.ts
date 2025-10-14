/**
 * ImgBB - Upload de imagens SIMPLES e GRÁTIS
 * 
 * API Key grátis: https://api.imgbb.com/
 * - 100% grátis
 * - Sem limite de armazenamento
 * - CDN rápido
 * - Sem complicação
 */

export async function uploadToImgBB(file: File | Buffer, fileName: string): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY || '4d755673c02c216e5e83a0b8e6d7c0e2'; // Chave demo

  try {
    const formData = new FormData();
    
    // Converter Buffer para Blob se necessário
    const blob = file instanceof Buffer 
      ? new Blob([file], { type: 'image/jpeg' })
      : file;
    
    formData.append('image', blob);
    formData.append('name', fileName);

    console.log('📸 [ImgBB] Uploading...', fileName);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data.url) {
      console.log('✅ [ImgBB] Upload successful:', data.data.url);
      return data.data.url;
    }

    throw new Error('ImgBB upload failed');
  } catch (error: any) {
    console.error('❌ [ImgBB] Upload error:', error);
    throw error;
  }
}

/**
 * Upload para ImgBB a partir de Buffer (para API routes)
 */
export async function uploadBufferToImgBB(buffer: Buffer, fileName: string): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY || '4d755673c02c216e5e83a0b8e6d7c0e2';

  try {
    // Converter buffer para base64
    const base64 = buffer.toString('base64');

    console.log('📸 [ImgBB] Uploading...', fileName);

    const formData = new URLSearchParams();
    formData.append('image', base64);
    formData.append('name', fileName);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ImgBB API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (data.success && data.data.url) {
      console.log('✅ [ImgBB] Upload successful:', data.data.url);
      return data.data.url;
    }

    throw new Error('ImgBB upload failed: ' + JSON.stringify(data));
  } catch (error: any) {
    console.error('❌ [ImgBB] Upload error:', error.message);
    throw error;
  }
}
