'use client';

import { Home, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  slug: string;
  cartItemCount?: number;
}

export function BottomNav({ slug, cartItemCount = 0 }: BottomNavProps) {
  const pathname = usePathname();

  const items = [
    { icon: Home, label: "Início", href: `/${slug}` },
    { icon: Search, label: "Buscar", href: `/${slug}?search=true` },
    { icon: ShoppingBag, label: "Pedidos", href: `/${slug}/meus-pedidos`, hasBadge: true },
    { icon: User, label: "Perfil", href: slug ? `/${slug}/perfil` : '#' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          
          // Special handling for search if it's just a query param
          const isSearch = item.label === "Buscar";
          
          return (
            <Link key={item.href} href={item.href} className="w-full">
              <div className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative py-1",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )}>
                <div className="relative">
                  <item.icon className={cn("h-6 w-6", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                  {item.hasBadge && cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in duration-200">
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
