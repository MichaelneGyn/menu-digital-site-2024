import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

// Inicialize o cliente apenas quando necessário para evitar erro no build
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase env vars ausentes: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key);
}

// POST: Adicionar tamanho
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { customizationId, name, description, priceMultiplier, displayOrder } = body;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('customization_sizes')
      .insert({
        category_customization_id: customizationId,
        name,
        description,
        price_multiplier: priceMultiplier,
        display_order: displayOrder || 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, size: data });

  } catch (error) {
    console.error('Erro ao adicionar tamanho:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT: Atualizar tamanho
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description, priceMultiplier, displayOrder } = body;

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('customization_sizes')
      .update({
        name,
        description,
        price_multiplier: priceMultiplier,
        display_order: displayOrder
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, size: data });

  } catch (error) {
    console.error('Erro ao atualizar tamanho:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE: Remover tamanho
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('customization_sizes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao remover tamanho:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
