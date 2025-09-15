import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Retornar lista vazia por enquanto
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}