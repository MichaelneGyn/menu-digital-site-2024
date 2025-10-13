import { NextRequest, NextResponse } from 'next/server';

/**
 * API Proxy para Geocoding (OpenStreetMap Nominatim)
 * 
 * Isso evita erros de CORS ao chamar o Nominatim diretamente do frontend.
 * A requisição passa pelo servidor Next.js primeiro.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔍 [Geocode] Searching for:', query);

    // Fazer requisição ao OpenStreetMap Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(query)}&` +
      `countrycodes=br&` +
      `limit=5&` +
      `addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MenuDigital/1.0', // OpenStreetMap requer User-Agent
        },
      }
    );

    if (!response.ok) {
      console.error('❌ [Geocode] OpenStreetMap error:', response.status);
      
      // Se OpenStreetMap falhar, retorna array vazio ao invés de erro
      return NextResponse.json([]);
    }

    const data = await response.json();
    console.log('✅ [Geocode] Found results:', data.length);

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ [Geocode] Error:', error);
    
    // Retorna array vazio ao invés de erro 500
    // Isso evita quebrar a UX se geocoding falhar
    return NextResponse.json([]);
  }
}
