
import { NextRequest, NextResponse } from 'next/server';
import { downloadFile } from '@/lib/s3';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key da imagem é obrigatória' }, { status: 400 });
    }

    const isDev = process.env.NODE_ENV !== 'production';

    // Se estiver em dev e a key parecer ser um caminho local de uploads, redireciona para o público
    if (isDev && (key.startsWith('uploads/') || key.startsWith('/uploads/'))) {
      const baseName = path.basename(key);
      const url = new URL(`/uploads/${encodeURIComponent(baseName)}`, request.url);
      return NextResponse.redirect(url);
    }

    const signedUrl = await downloadFile(key);
    return NextResponse.redirect(signedUrl);

  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
  }
}
