'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Receipt,
  ChefHat,
  UtensilsCrossed,
  Bell,
  Calculator,
  BarChart3,
  TrendingUp,
  Palette,
  Settings,
  PlayCircle,
  Link as LinkIcon,
  Users,
  Upload,
  LogOut,
  DollarSign
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const ADMIN_EMAIL = 'michaeldouglasqueiroz@gmail.com';

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
    },
    {
      label: 'Comandas',
      icon: Receipt,
      href: '/admin/orders',
    },
    {
      label: 'Cozinha',
      icon: ChefHat,
      href: '/admin/kitchen',
    },
    {
      label: 'Mesas',
      icon: UtensilsCrossed,
      href: '/admin/tables',
    },
    {
      label: 'Chamadas',
      icon: Bell,
      href: '/admin/waiter-calls',
    },
    {
      label: 'Calculadora CMV',
      icon: Calculator,
      href: '/admin/cmv',
    },
    {
      label: 'Relatórios',
      icon: BarChart3,
      href: '/admin/relatorios',
    },
    {
      label: 'Financeiro',
      icon: DollarSign,
      href: '/admin/payments',
    },
    {
      label: 'Upsell',
      icon: TrendingUp,
      href: '/admin/upsell',
    },
    {
      label: 'Personalização',
      icon: Palette,
      href: '/admin/customization',
    },
    {
      label: 'Configurações',
      icon: Settings,
      href: '/admin/settings',
    },
    {
      label: 'Tutoriais',
      icon: PlayCircle,
      href: '/admin/tutoriais',
    },
    {
      label: 'Importar Cardápio',
      icon: Upload,
      href: '/admin/import-menu',
    },
  ];

  if (isAdmin) {
    routes.push({
      label: 'Integrações',
      icon: LinkIcon,
      href: '/admin/integrations',
    });
    routes.push({
      label: 'Usuários',
      icon: Users,
      href: '/admin/customers',
    });
  }

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <Link href="/admin/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">
            Menu Digital
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => {
            const isActive = pathname?.startsWith(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                  isActive ? "text-white bg-white/10" : "text-zinc-400"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3 transition-colors", isActive ? "text-[#E53935]" : "text-zinc-400 group-hover:text-white")} />
                  {route.label}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="px-3 py-2">
         <Button 
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="ghost" 
            className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10 group"
         >
            <LogOut className="h-5 w-5 mr-3 text-zinc-400 group-hover:text-red-500 transition-colors" />
            Sair
         </Button>
      </div>
    </div>
  );
}
