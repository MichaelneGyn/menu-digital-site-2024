import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.redirect(new URL('/auth/login', process.env.NEXTAUTH_URL || 'http://localhost:3001'));
  
  // Clear NextAuth cookies
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  response.cookies.delete('next-auth.csrf-token');
  response.cookies.delete('__Secure-next-auth.csrf-token');
  response.cookies.delete('next-auth.callback-url');
  response.cookies.delete('__Secure-next-auth.callback-url');
  
  return response;
}

export async function POST() {
  return GET();
}
