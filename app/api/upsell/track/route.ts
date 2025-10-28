import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Registrar evento de tracking (view, click, conversion)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { ruleId, event, revenue } = data;

    if (!ruleId || !event) {
      return NextResponse.json({ error: 'ruleId e event são obrigatórios' }, { status: 400 });
    }

    // Validar tipo de evento
    if (!['view', 'click', 'conversion'].includes(event)) {
      return NextResponse.json({ error: 'Evento inválido' }, { status: 400 });
    }

    // Buscar regra
    const rule = await prisma.upsellRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      return NextResponse.json({ error: 'Regra não encontrada' }, { status: 404 });
    }

    // Atualizar métrica correspondente
    const updateData: any = {};

    switch (event) {
      case 'view':
        updateData.views = { increment: 1 };
        break;
      case 'click':
        updateData.clicks = { increment: 1 };
        break;
      case 'conversion':
        updateData.conversions = { increment: 1 };
        if (revenue && typeof revenue === 'number') {
          updateData.revenue = { increment: revenue };
        }
        break;
    }

    // Atualizar regra
    const updatedRule = await prisma.upsellRule.update({
      where: { id: ruleId },
      data: updateData,
    });

    return NextResponse.json({ success: true, rule: updatedRule });
  } catch (error) {
    console.error('Erro ao registrar tracking de upsell:', error);
    return NextResponse.json({ error: 'Erro ao registrar tracking' }, { status: 500 });
  }
}
