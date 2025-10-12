import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Usar a URL da request atual ao invés da variável de ambiente
  const origin = request.nextUrl.origin;
  const loginUrl = `${origin}/auth/login`;
  
  const response = NextResponse.redirect(loginUrl);
  
  // Clear NextAuth cookies
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  response.cookies.delete('next-auth.csrf-token');
  response.cookies.delete('__Secure-next-auth.csrf-token');
  response.cookies.delete('next-auth.callback-url');
  response.cookies.delete('__Secure-next-auth.callback-url');
  
  return response;
}

export async function POST(request: NextRequest) {
  return GET(request);
}
