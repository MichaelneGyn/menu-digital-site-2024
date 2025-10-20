'use client';

import { usePathname } from 'next/navigation';
import WhatsAppButton from './WhatsAppButton';

export default function ConditionalWhatsApp() {
  const pathname = usePathname();
  
  // NÃO mostrar botão WhatsApp nas páginas admin ou auth
  const isAdminPage = pathname?.startsWith('/admin');
  const isAuthPage = pathname?.startsWith('/auth');
  
  // Só mostra em páginas públicas (landing page, cardápio do restaurante, etc)
  if (isAdminPage || isAuthPage) {
    return null;
  }
  
  return <WhatsAppButton />;
}
