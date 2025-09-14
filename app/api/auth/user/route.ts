import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    console.log('API /api/auth/user: Verificando autenticação...');
    
    // Verificar sessão primeiro
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('API /api/auth/user: Erro ao obter sessão:', sessionError);
      return NextResponse.json({ error: 'Erro de sessão: ' + sessionError.message }, { status: 401 });
    }
    
    if (!session) {
      console.log('API /api/auth/user: Nenhuma sessão ativa');
      return NextResponse.json({ error: 'Nenhuma sessão ativa' }, { status: 401 });
    }
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error } = await supabase.auth.getUser();
    
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