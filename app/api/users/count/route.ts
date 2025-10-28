import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Contar total de usuários (público, para mostrar vagas restantes)
export async function GET() {
  try {
    const count = await prisma.user.count();
    
    return NextResponse.json({ 
      count,
      limit: 10, // 🔒 Limite alinhado com USER_LIMIT em signup/route.ts
      spotsLeft: Math.max(0, 10 - count),
      promoActive: count < 10
    });
  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    // Retorna 0 em caso de erro para não quebrar a página
    return NextResponse.json({ 
      count: 0,
      limit: 10, // 🔒 Limite alinhado com USER_LIMIT
      spotsLeft: 10,
      promoActive: true
    });
  }
}
