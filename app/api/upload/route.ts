
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth';
import { uploadFile, getPublicUrl } from '@/lib/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    // Usando cliente Supabase global
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
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

    const buffer = Buffer.from(await file.arrayBuffer());
    const cloud_storage_path = await uploadFile(buffer, file.name);
    
    // Get public URL from Supabase Storage
    const imageUrl = await getPublicUrl(cloud_storage_path);

    return NextResponse.json({ 
      success: true, 
      cloud_storage_path,
      image_url: imageUrl,
      message: 'Imagem enviada com sucesso!' 
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
