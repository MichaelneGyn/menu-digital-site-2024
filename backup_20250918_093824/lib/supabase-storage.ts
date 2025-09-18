import { supabase, createServerSupabaseClient } from './supabase'

export async function uploadFile(buffer: Buffer, fileName: string): Promise<string> {
  const supabaseClient = createServerSupabaseClient()
  
  const fileExt = fileName.split('.').pop()
  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `uploads/${uniqueFileName}`

  const { data, error } = await supabaseClient.storage
    .from('menu-images')
    .upload(filePath, buffer, {
      contentType: getContentType(fileName),
      upsert: false
    })

  if (error) {
    throw new Error(`Erro ao fazer upload: ${error.message}`)
  }

  return data.path
}

export async function getPublicUrl(filePath: string): Promise<string> {
  const { data } = supabase.storage
    .from('menu-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}

export async function downloadFile(filePath: string): Promise<string> {
  // Para Supabase, podemos usar a URL pública diretamente
  return getPublicUrl(filePath)
}

export async function deleteFile(filePath: string): Promise<void> {
  const supabaseClient = createServerSupabaseClient()
  
  const { error } = await supabaseClient.storage
    .from('menu-images')
    .remove([filePath])

  if (error) {
    throw new Error(`Erro ao deletar arquivo: ${error.message}`)
  }
}

function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}