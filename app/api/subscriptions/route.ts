import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// GET - visualizar assinatura do usuário atual
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("end_date", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // Se não encontrar assinatura, retorna null ao invés de erro
    if (error.code === 'PGRST116') {
      return NextResponse.json(null);
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  // Verificar se a assinatura está expirada
  const now = new Date();
  const endDate = new Date(data.end_date);
  const isExpired = endDate < now;
  
  return NextResponse.json({
    ...data,
    is_expired: isExpired,
    days_remaining: isExpired ? 0 : Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  });
}

// POST - criar assinatura free trial ao cadastrar usuário
export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { fingerprint, ip_address, user_agent } = body;

    // Verificar se já existe uma assinatura ativa para este usuário
    const { data: existingSubscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (existingSubscription) {
      return NextResponse.json({ error: "Usuário já possui uma assinatura ativa" }, { status: 400 });
    }

    // Verificar anti-burla se fingerprint foi fornecido
    if (fingerprint) {
      const { data: fingerprintCheck } = await supabase
        .rpc('check_fingerprint_usage', { fingerprint });

      if (fingerprintCheck) {
        return NextResponse.json({ 
          error: "Este dispositivo já foi usado para criar uma conta gratuita recentemente. Considere fazer upgrade para o plano pago." 
        }, { status: 403 });
      }

      // Salvar fingerprint
      await supabase
        .from("device_fingerprints")
        .insert([{
          user_id: user.id,
          fingerprint_hash: fingerprint,
          ip_address,
          user_agent
        }]);
    }

    // Plano free: 3 dias
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 3);

    const { data, error } = await supabase
      .from("subscriptions")
      .insert([{
        user_id: user.id,
        plan: "free",
        status: "active",
        start_date: now.toISOString(),
        end_date: endDate.toISOString()
      }])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    
    return NextResponse.json({
      ...data,
      days_remaining: 3,
      is_expired: false
    });
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// PUT - atualizar status da assinatura (para expirar manualmente)
export async function PUT(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { status } = body;

    const { data, error } = await supabase
      .from("subscriptions")
      .update({ status })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}