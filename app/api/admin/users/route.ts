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
    
    // Verificar se é admin através da tabela profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 });
    }
    
    // Buscar dados da VIEW administrativa unificada
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
      users_with_subscription: users?.filter(u => u.status_assinatura !== 'sem assinatura').length || 0,
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
    
    // Verificar se é admin através da tabela profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado - Admin apenas' }, { status: 403 });
    }
    
    if (action === 'grant_access') {
      // Conceder acesso manual
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (days || 30));
      
      // Verificar se já existe uma assinatura ativa
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existingSubscription) {
        // Atualizar assinatura existente
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan: plan || 'paid',
            start_date: new Date().toISOString(),
            end_date: endDate.toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          console.error('Erro ao atualizar assinatura:', updateError);
          return NextResponse.json({ error: 'Erro ao conceder acesso' }, { status: 500 });
        }
      } else {
        // Criar nova assinatura
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan: plan || 'paid',
            start_date: new Date().toISOString(),
            end_date: endDate.toISOString()
          });
        
        if (insertError) {
          console.error('Erro ao criar assinatura:', insertError);
          return NextResponse.json({ error: 'Erro ao conceder acesso' }, { status: 500 });
        }
      }
      
      return NextResponse.json({ 
        message: 'Acesso concedido com sucesso'
      });
      
    } else if (action === 'revoke_access') {
      // Revogar acesso - definir data de fim como agora
      const { error: revokeError } = await supabase
        .from('subscriptions')
        .update({ end_date: new Date().toISOString() })
        .eq('user_id', userId);
      
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