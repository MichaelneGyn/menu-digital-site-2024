import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar o restaurante do usuário logado
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json([]);
    }

    // Buscar pedidos do restaurante
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        customer_name,
        customer_phone,
        customer_email,
        customer_address,
        total,
        status,
        payment_method,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          unit_price,
          notes,
          menu_item:items (
            id,
            name,
            price
          )
        )
      `)
      .eq('restaurant_id', restaurant.id)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Erro ao buscar pedidos:', ordersError);
      return NextResponse.json([]);
    }

    // Formatar os dados para o frontend
    const formattedOrders = orders?.map((order: any) => ({
      id: order.id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      address: order.customer_address,
      total: Number(order.total),
      status: order.status?.toLowerCase() || 'pending',
      paymentMethod: order.payment_method,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: order.order_items?.map((item: any) => ({
        id: item.id,
        name: item.menu_item?.name || 'Item',
        quantity: item.quantity,
        price: Number(item.unit_price),
        customizations: item.notes ? [item.notes] : []
      })) || []
    })) || [];

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error('Erro na API de pedidos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - atualizar status do pedido
export async function PUT(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios' }, { status: 400 });
    }

    // Buscar o restaurante do usuário logado
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json({ error: 'Restaurante não encontrado' }, { status: 404 });
    }

    // Atualizar o status do pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('restaurant_id', restaurant.id);

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Pedido atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro na API de atualização de pedidos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}