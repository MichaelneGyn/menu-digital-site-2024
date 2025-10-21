import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions, userIsAdmin } from '@/lib/auth';

/**
 * 🔒 Rota de teste PROTEGIDA para verificar conexão Supabase
 * Apenas ADMIN pode acessar
 * Acesse: /api/test-supabase
 */
export async function GET(request: NextRequest) {
  try {
    // 🔒 SEGURANÇA: Verificar autenticação de ADMIN
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? undefined;
    const isAdmin = await userIsAdmin(email);
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 🔒 SEGURANÇA: Não logar informações sensíveis em produção
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 [Test] Supabase URL:', supabaseUrl);
      console.log('🔍 [Test] Usando chave SERVICE_ROLE_KEY');
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Variáveis de ambiente não configuradas',
        config: {
          NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Testar listagem de buckets
    console.log('🔍 [Test] Listando buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ [Test] Erro ao listar buckets:', bucketsError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao listar buckets',
        details: bucketsError
      }, { status: 500 });
    }

    console.log('✅ [Test] Buckets encontrados:', buckets?.map(b => b.name));

    // Verificar bucket específico
    const menuImagesBucket = buckets?.find(b => b.name === 'menu-images');
    
    if (!menuImagesBucket) {
      return NextResponse.json({
        success: false,
        error: 'Bucket "menu-images" não encontrado',
        availableBuckets: buckets?.map(b => b.name) || []
      }, { status: 404 });
    }

    // Testar listagem de arquivos no bucket
    console.log('🔍 [Test] Listando arquivos no bucket menu-images...');
    const { data: files, error: filesError } = await supabase.storage
      .from('menu-images')
      .list('uploads', { limit: 5 });

    if (filesError) {
      console.error('❌ [Test] Erro ao listar arquivos:', filesError);
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão Supabase OK! ✅',
      buckets: buckets?.map(b => ({ name: b.name, public: b.public })),
      menuImagesBucket: {
        found: true,
        public: menuImagesBucket.public,
        filesCount: files?.length || 0
      }
    });

  } catch (error: any) {
    console.error('❌ [Test] Erro geral:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao testar Supabase',
      details: error.message
    }, { status: 500 });
  }
}
