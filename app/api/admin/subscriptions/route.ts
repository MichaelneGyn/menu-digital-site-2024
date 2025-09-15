import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET - Listar todas as assinaturas
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
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
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Buscar todas as assinaturas com informações do usuário
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        user:profiles!subscriptions_user_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar assinaturas:', error);
      return NextResponse.json({ error: 'Erro ao buscar assinaturas' }, { status: 500 });
    }

    // Calcular dias restantes para cada assinatura
    const subscriptionsWithDays = subscriptions?.map(subscription => {
      const endDate = new Date(subscription.end_date);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...subscription,
        days_remaining: Math.max(0, diffDays)
      };
    }) || [];

    return NextResponse.json({ subscriptions: subscriptionsWithDays });
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PATCH - Estender ou cancelar assinatura
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
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
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { subscriptionId, action, days } = await request.json();

    if (!subscriptionId || !action) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 });
    }

    if (action === 'extend') {
      if (!days || days <= 0) {
        return NextResponse.json({ error: 'Número de dias inválido' }, { status: 400 });
      }

      // Buscar assinatura atual
      const { data: currentSubscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (fetchError || !currentSubscription) {
        return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 });
      }

      // Calcular nova data de vencimento
      const currentEndDate = new Date(currentSubscription.end_date);
      const newEndDate = new Date(currentEndDate.getTime() + (days * 24 * 60 * 60 * 1000));

      // Atualizar assinatura
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          end_date: newEndDate.toISOString(),
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (updateError) {
        console.error('Erro ao estender assinatura:', updateError);
        return NextResponse.json({ error: 'Erro ao estender assinatura' }, { status: 500 });
      }

      // Log da ação admin
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: user.id,
          action: 'extend_subscription',
          target_id: subscriptionId,
          details: {
            days_extended: days,
            new_end_date: newEndDate.toISOString(),
            previous_end_date: currentSubscription.end_date
          }
        });

      return NextResponse.json({ message: 'Assinatura estendida com sucesso' });
    }

    if (action === 'cancel') {
      // Cancelar assinatura
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'expired',
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (updateError) {
        console.error('Erro ao cancelar assinatura:', updateError);
        return NextResponse.json({ error: 'Erro ao cancelar assinatura' }, { status: 500 });
      }

      // Log da ação admin
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: user.id,
          action: 'cancel_subscription',
          target_id: subscriptionId,
          details: {
            cancelled_at: new Date().toISOString()
          }
        });

      return NextResponse.json({ message: 'Assinatura cancelada com sucesso' });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}