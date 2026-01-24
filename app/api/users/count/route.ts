import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Contar total de usuários (público, para mostrar estatísticas)
export async function GET() {
  try {
    const count = await prisma.user.count();
    
    return NextResponse.json({ 
      count,
      limit: null, // ✅ SEM LIMITE - Cadastros ilimitados
      spotsLeft: null, // ✅ Vagas ilimitadas
      promoActive: count < 50 // Promoção ativa para primeiros 50
    });
  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    // Retorna 0 em caso de erro para não quebrar a página
    return NextResponse.json({ 
      count: 0,
      limit: null, // ✅ SEM LIMITE
      spotsLeft: null, // ✅ Vagas ilimitadas
      promoActive: true
    });
  }
}
