import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET - Obter estatísticas das assinaturas
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

    // Buscar todas as assinaturas
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*');

    if (error) {
      console.error('Erro ao buscar assinaturas:', error);
      return NextResponse.json({ error: 'Erro ao buscar assinaturas' }, { status: 500 });
    }

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Calcular estatísticas
    const stats = {
      total_subscriptions: subscriptions?.length || 0,
      active_subscriptions: 0,
      expired_subscriptions: 0,
      free_plans: 0,
      paid_plans: 0,
      revenue_current_month: 0,
      revenue_last_month: 0,
      new_subscriptions_this_month: 0,
      expiring_soon: 0
    };

    subscriptions?.forEach(subscription => {
      const endDate = new Date(subscription.end_date);
      const createdDate = new Date(subscription.created_at);
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Status das assinaturas
      if (subscription.status === 'active' && diffDays > 0) {
        stats.active_subscriptions++;
      } else {
        stats.expired_subscriptions++;
      }

      // Tipos de plano
      if (subscription.plan === 'free') {
        stats.free_plans++;
      } else if (subscription.plan === 'paid') {
        stats.paid_plans++;
      }

      // Assinaturas criadas este mês
      if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
        stats.new_subscriptions_this_month++;
      }

      // Assinaturas expirando em breve (próximos 7 dias)
      if (subscription.status === 'active' && diffDays > 0 && diffDays <= 7) {
        stats.expiring_soon++;
      }

      // Receita (simulada - você pode ajustar conforme sua lógica de preços)
      if (subscription.plan === 'paid' && subscription.status === 'active') {
        const subscriptionMonth = createdDate.getMonth();
        const subscriptionYear = createdDate.getFullYear();
        
        // Assumindo um valor fixo de R$ 29.90 por mês para planos pagos
        const monthlyValue = 29.90;
        
        if (subscriptionMonth === currentMonth && subscriptionYear === currentYear) {
          stats.revenue_current_month += monthlyValue;
        }
        
        if (subscriptionMonth === lastMonth && subscriptionYear === lastMonthYear) {
          stats.revenue_last_month += monthlyValue;
        }
      }
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}