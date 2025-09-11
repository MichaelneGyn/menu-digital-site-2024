
import { NextRequest, NextResponse } from 'next/server';
import { downloadFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key da imagem é obrigatória' }, { status: 400 });
    }

    const signedUrl = await downloadFile(key);
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
  }
}
