import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Rotas que não precisam de autenticação
  const publicRoutes = ["/", "/auth/login", "/auth/register", "/assinatura"];
  const isPublicRoute = publicRoutes.some((path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith("/api/auth"));

  if (!session?.user && !isPublicRoute) {
    // Não logado → redireciona para login
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Se não está logado, permite acesso às rotas públicas
  if (!session?.user) {
    return res;
  }

  // Rotas que exigem plano pago (recursos premium)
  const paidRoutes = [
    "/admin/dashboard/comandas",
    "/admin/dashboard/relatorios", 
    "/admin/personalizar",
    "/admin/analytics"
  ];
  
  // Rotas que funcionam com plano free mas têm limitações de tempo
  const freeRoutes = [
    "/admin/dashboard",
    "/admin/cardapio",
    "/admin/categorias",
    "/admin/itens"
  ];

  const isPaidRoute = paidRoutes.some((path) => req.nextUrl.pathname.startsWith(path));
  const isFreeRoute = freeRoutes.some((path) => req.nextUrl.pathname.startsWith(path));
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  // Se é uma rota admin, verificar assinatura
  if (isAdminRoute) {
    // Admin bypass - emails de administradores têm acesso completo
    const adminEmails = [
      "michaeldouglasqueiroz@gmail.com", // Email do dono do site
      "admin@onpedido.com",     // Email admin alternativo
    ];
    
    const isAdmin = adminEmails.includes(session.user.email || "");
    
    if (isAdmin) {
      // Admin tem acesso completo a todas as rotas
      return res;
    }

    try {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan, end_date")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Se não tem assinatura, redirecionar para página de assinatura
      if (!subscription) {
        const subscriptionUrl = new URL("/assinatura", req.url);
        subscriptionUrl.searchParams.set("reason", "no_subscription");
        subscriptionUrl.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(subscriptionUrl);
      }

      const now = new Date();
      const isExpired = subscription.end_date && new Date(subscription.end_date) < now;

      // Se a assinatura expirou
      if (isExpired) {
        const subscriptionUrl = new URL("/assinatura", req.url);
        subscriptionUrl.searchParams.set("reason", "expired");
        subscriptionUrl.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(subscriptionUrl);
      }

      // Se é rota paga mas usuário tem plano free
      if (isPaidRoute && subscription.plan === "free") {
        const subscriptionUrl = new URL("/assinatura", req.url);
        subscriptionUrl.searchParams.set("reason", "upgrade_required");
        subscriptionUrl.searchParams.set("redirect", req.nextUrl.pathname);
        return NextResponse.redirect(subscriptionUrl);
      }

      // Se é rota free, permitir acesso (incluindo trial de 3 dias)
      if (isFreeRoute) {
        return res;
      }

    } catch (error) {
      console.error("Erro ao verificar assinatura:", error);
      // Em caso de erro, redirecionar para página de assinatura
      const subscriptionUrl = new URL("/assinatura", req.url);
      subscriptionUrl.searchParams.set("reason", "error");
      return NextResponse.redirect(subscriptionUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};