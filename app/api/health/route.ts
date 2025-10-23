import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Verifica conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: 'healthy',
      ok: true, 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ 
      status: 'unhealthy',
      ok: false, 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}