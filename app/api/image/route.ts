
import { NextRequest, NextResponse } from 'next/server';
import { getPublicUrl } from '@/lib/supabase-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key da imagem é obrigatória' }, { status: 400 });
    }

    const publicUrl = await getPublicUrl(key);
    return NextResponse.redirect(publicUrl);

  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
  }
}
