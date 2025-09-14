import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = ['/admin'];

// Rotas que redirecionam usuários autenticados
const authRoutes = ['/auth/login', '/auth/register'];

// Rotas públicas que não precisam de verificação
const publicRoutes = ['/', '/api/debug'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;
  
  // Log para debug
  console.log(`[Middleware] ${req.method} ${pathname} - Session: ${session ? 'Yes' : 'No'}`);
  
  // Se houver erro na sessão, limpar cookies e redirecionar para login
  if (error) {
    console.error('[Middleware] Session error:', error);
    const response = NextResponse.redirect(new URL('/auth/login', req.url));
    response.cookies.delete('supabase-auth-token');
    return response;
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar se é uma rota de autenticação
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/') || pathname.startsWith('/_next/')
  );

  // Se usuário não está autenticado e tenta acessar rota protegida
  if (!session && isProtectedRoute) {
    console.log('[Middleware] Redirecting to login - no session for protected route');
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // Permitir acesso à página de login mesmo para usuários autenticados
  // (necessário para demonstrações e vendas do serviço)
  // Se usuário está autenticado e tenta acessar registro, redirecionar para admin
  if (session && pathname.startsWith('/auth/register')) {
    console.log('[Middleware] Redirecting to admin - authenticated user on register route');
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // Para rotas dinâmicas de restaurante [slug], permitir acesso público
  if (pathname.match(/^\/[^/]+$/)) {
    return res;
  }

  // Adicionar headers de segurança
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Cache control para rotas de API
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};