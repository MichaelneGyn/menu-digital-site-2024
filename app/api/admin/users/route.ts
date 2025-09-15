import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar se o usuário é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se é admin
    const adminEmails = [
      "michaeldouglasqueiroz@gmail.com",
      "admin@onpedido.com"
    ];
    
    if (!adminEmails.includes(user.email || "")) {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 });
    }
    
    // Buscar dados da VIEW administrativa simplificada
    const { data: users, error: usersError } = await supabase
      .from('vw_admin_users')
      .select('*')
      .order('signup_date', { ascending: false });
    
    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError);
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }
    
    // Calcular estatísticas
    const stats = {
      total_users: users?.length || 0,
      users_with_subscription: users?.filter(u => u.status_assinatura !== 'sem_assinatura').length || 0,
      active_subscriptions: users?.filter(u => u.status_assinatura === 'ativa').length || 0,
      trial_subscriptions: users?.filter(u => u.status_assinatura === 'trial').length || 0,
      expired_subscriptions: users?.filter(u => u.status_assinatura === 'expirada').length || 0
    };
    
    return NextResponse.json({ 
      users: users || [],
      stats
    });
    
  } catch (error) {
    console.error('Erro na API admin/users:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// API para atualizar permissões de usuário
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { userId, action, plan, days } = body;
    
    // Verificar se o usuário é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    // Verificar se é admin
    const adminEmails = [
      "michaeldouglasqueiroz@gmail.com",
      "admin@onpedido.com"
    ];
    
    if (!adminEmails.includes(user.email || "")) {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 });
    }
    
    if (action === 'grant_access') {
      // Conceder acesso manual
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (days || 30));
      
      // Desativar assinaturas existentes
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');
      
      // Criar nova assinatura
      const { data: newSubscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan: plan || 'paid',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          payment_method: 'admin_grant'
        })
        .select()
        .single();
      
      if (subscriptionError) {
        console.error('Erro ao criar assinatura:', subscriptionError);
        return NextResponse.json({ error: 'Erro ao conceder acesso' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        message: 'Acesso concedido com sucesso',
        subscription: newSubscription
      });
      
    } else if (action === 'revoke_access') {
      // Revogar acesso
      const { error: revokeError } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');
      
      if (revokeError) {
        console.error('Erro ao revogar acesso:', revokeError);
        return NextResponse.json({ error: 'Erro ao revogar acesso' }, { status: 500 });
      }
      
      return NextResponse.json({ message: 'Acesso revogado com sucesso' });
    }
    
    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    
  } catch (error) {
    console.error('Erro na API admin/users PATCH:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}