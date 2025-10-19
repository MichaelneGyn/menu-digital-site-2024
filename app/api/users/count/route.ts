import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Contar total de usuários (público, para mostrar vagas restantes)
export async function GET() {
  try {
    const count = await prisma.user.count();
    
    return NextResponse.json({ 
      count,
      limit: 50, // Limite da promoção
      spotsLeft: Math.max(0, 50 - count),
      promoActive: count < 50
    });
  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    // Retorna 0 em caso de erro para não quebrar a página
    return NextResponse.json({ 
      count: 0,
      limit: 50,
      spotsLeft: 50,
      promoActive: true
    });
  }
}
