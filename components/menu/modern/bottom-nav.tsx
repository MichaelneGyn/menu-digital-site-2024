'use client';

import { Home, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn, getContrastTextColor, normalizeHexColor, withAlpha } from "@/lib/utils";

interface BottomNavProps {
  slug: string;
  cartItemCount?: number;
  primaryColor?: string;
}

export function BottomNav({ slug, cartItemCount = 0, primaryColor = '#EA1D2C' }: BottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchValue = searchParams?.get('search');
  const resolvedPrimaryColor = normalizeHexColor(primaryColor, '#EA1D2C');
  const badgeTextColor = getContrastTextColor(resolvedPrimaryColor);

  const items = [
    {
      icon: Home,
      label: "Início",
      href: `/${slug}`,
      match: () => pathname === `/${slug}` && searchValue !== 'true'
    },
    {
      icon: Search,
      label: "Buscar",
      href: `/${slug}?search=true`,
      match: () => pathname === `/${slug}` && searchValue === 'true'
    },
    { icon: ShoppingBag, label: "Pedidos", href: `/${slug}/meus-pedidos`, hasBadge: true },
    { icon: User, label: "Perfil", href: slug ? `/${slug}/perfil` : '#' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = item.match ? item.match() : pathname === item.href;

          return (
            <Link key={item.href} href={item.href} className="w-full">
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative py-1",
                  !isActive && "text-gray-400 hover:text-gray-600"
                )}
                style={isActive ? { color: resolvedPrimaryColor } : undefined}
              >
                <div className="relative">
                  <item.icon
                    className="h-6 w-6"
                    strokeWidth={isActive ? 2.5 : 2}
                    style={isActive ? {
                      color: resolvedPrimaryColor,
                      fill: item.label === 'Início' ? resolvedPrimaryColor : 'none'
                    } : undefined}
                  />
                  {item.hasBadge && cartItemCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold shadow-sm ring-2 ring-white animate-in zoom-in duration-200"
                      style={{
                        backgroundColor: resolvedPrimaryColor,
                        color: badgeTextColor,
                        boxShadow: `0 4px 10px ${withAlpha(resolvedPrimaryColor, 0.28)}`
                      }}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
