import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Usando cliente Supabase global
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { fileName, fileType, fileSize } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'Nome e tipo do arquivo são obrigatórios' }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use apenas imagens.' }, { status: 400 });
    }

    // Validar tamanho (máx 10MB para upload direto)
    if (fileSize && fileSize > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 10MB.' }, { status: 400 });
    }

    // Para Supabase, vamos usar upload direto via API
    // Gerar um nome único para o arquivo
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${uniqueFileName}`;
    
    // Retornar informações para upload direto via nossa API
    const uploadUrl = '/api/upload';
    const imageUrl = null; // Será gerado após o upload

    return NextResponse.json({ 
      success: true, 
      uploadUrl: uploadUrl,
      cloud_storage_path: filePath,
      image_url: imageUrl,
      message: 'Informações de upload geradas com sucesso!' 
    });

  } catch (error) {
    console.error('Erro ao gerar URL pré-assinada:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}