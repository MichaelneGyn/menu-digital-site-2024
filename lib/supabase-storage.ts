/**
 * Supabase Storage - Upload de imagens
 * Alternativa mais simples ao AWS S3
 */

import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para Storage
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey);
};

/**
 * Faz upload de arquivo para Supabase Storage
 * @param buffer Buffer do arquivo
 * @param fileName Nome original do arquivo
 * @returns URL pública do arquivo
 */
export async function uploadFileToSupabase(buffer: Buffer, fileName: string): Promise<string> {
  const supabase = getSupabaseClient();
  const bucketName = 'menu-images'; // Nome do bucket criado no Supabase

  // DEBUG: Listar buckets disponíveis
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    console.log('📦 [Supabase] Buckets disponíveis:', buckets?.map(b => b.name));
    if (listError) {
      console.error('❌ [Supabase] Erro ao listar buckets:', listError);
    }
  } catch (e) {
    console.error('❌ [Supabase] Exceção ao listar buckets:', e);
  }

  // Gerar nome único para evitar conflitos
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFileName = `${timestamp}-${sanitizedFileName}`;
  const filePath = `uploads/${uniqueFileName}`;

  console.log('📸 [Supabase] Uploading file:', filePath);
  console.log('📸 [Supabase] Bucket name:', bucketName);

  // Upload do arquivo
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: getContentType(fileName),
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('❌ [Supabase] Upload error:', error);
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  console.log('✅ [Supabase] Upload successful:', data.path);

  // Obter URL pública
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Deleta arquivo do Supabase Storage
 * @param fileUrl URL pública do arquivo
 */
export async function deleteFileFromSupabase(fileUrl: string): Promise<void> {
  const supabase = getSupabaseClient();
  const bucketName = 'menu-images';

  // Extrair caminho do arquivo da URL
  const urlParts = fileUrl.split(`/storage/v1/object/public/${bucketName}/`);
  if (urlParts.length < 2) {
    console.warn('⚠️ [Supabase] Invalid file URL:', fileUrl);
    return;
  }

  const filePath = urlParts[1];

  console.log('🗑️ [Supabase] Deleting file:', filePath);

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    console.error('❌ [Supabase] Delete error:', error);
    throw new Error(`Erro ao deletar arquivo: ${error.message}`);
  }

  console.log('✅ [Supabase] File deleted');
}

/**
 * Determina o Content-Type baseado na extensão do arquivo
 */
function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}
