import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET - Exportar relatório de assinaturas em CSV
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

    // Preparar dados para CSV
    const csvHeaders = [
      'ID da Assinatura',
      'Email do Usuário',
      'Nome do Usuário',
      'Plano',
      'Status',
      'Data de Início',
      'Data de Vencimento',
      'Dias Restantes',
      'Data de Criação'
    ];

    const csvRows = subscriptions?.map(subscription => {
      const endDate = new Date(subscription.end_date);
      const today = new Date();
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return [
        subscription.id,
        subscription.user?.email || 'N/A',
        subscription.user?.full_name || 'Nome não informado',
        subscription.plan === 'paid' ? 'Pago' : 'Gratuito',
        subscription.status === 'active' ? 'Ativo' : 'Expirado',
        new Date(subscription.start_date).toLocaleDateString('pt-BR'),
        new Date(subscription.end_date).toLocaleDateString('pt-BR'),
        Math.max(0, diffDays),
        new Date(subscription.created_at).toLocaleDateString('pt-BR')
      ];
    }) || [];

    // Gerar CSV
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field}"` 
          : field
      ).join(','))
    ].join('\n');

    // Adicionar BOM para UTF-8 (para Excel reconhecer acentos)
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    // Retornar arquivo CSV
    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="assinaturas_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}