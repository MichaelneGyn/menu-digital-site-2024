'use client';

import { usePathname } from 'next/navigation';
import WhatsAppButton from './WhatsAppButton';

export default function ConditionalWhatsApp() {
  const pathname = usePathname();
  
  // Mostrar botão WhatsApp APENAS na landing page (página inicial)
  const isHomePage = pathname === '/';
  
  // Só mostra na homepage
  if (!isHomePage) {
    return null;
  }
  
  return <WhatsAppButton />;
}
