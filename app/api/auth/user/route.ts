import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const supabaseClient = createSupabaseClient();
    
    console.log('API /api/auth/user: Verificando autenticação...');
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    console.log('API /api/auth/user: User data:', user ? { id: user.id, email: user.email } : null);
    console.log('API /api/auth/user: Error:', error);
    
    if (error) {
      console.error('API /api/auth/user: Erro de autenticação:', error);
      return NextResponse.json({ error: 'Erro de autenticação: ' + error.message }, { status: 401 });
    }
    
    if (!user) {
      console.log('API /api/auth/user: Usuário não encontrado');
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    // Retornar dados do usuário do Supabase
    const userData = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name || null
    };
    
    console.log('API /api/auth/user: Retornando dados do usuário:', userData);
    return NextResponse.json(userData);
  } catch (error) {
    console.error('API /api/auth/user: Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}