import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ConditionalWhatsApp from "@/components/ConditionalWhatsApp";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleTagManager from "@/components/GoogleTagManager";
import { LanguageProvider } from "@/contexts/LanguageContext";
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Cardápio Digital | Menu QR Code para Restaurante - 30 Dias Grátis",
  description: "⚡ Cardápio Digital Profissional por R$ 69,90/mês! QR Code + Pedidos Online + Relatórios + Suporte 24/7. Teste GRÁTIS 30 dias. Sem taxa por pedido. Cancele quando quiser. ✅",
  keywords: "cardápio digital, menu digital, cardápio online, qr code restaurante, pedidos online, sistema para restaurante, menu qr code, cardápio digital grátis, cardápio digital barato, melhor cardápio digital, cardápio digital whatsapp, cardápio digital delivery, sistema delivery restaurante, app cardápio digital, cardápio digital profissional",
  authors: [{ name: "Virtual Cardápio" }],
  creator: "Virtual Cardápio",
  publisher: "Virtual Cardápio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://virtualcardapio.com.br',
    title: 'Cardápio Digital | R$ 69,90/mês - 30 Dias Grátis',
    description: '⚡ Cardápio Digital Profissional! QR Code + Pedidos Online + Relatórios. Teste GRÁTIS 30 dias. Sem taxa por pedido. ✅',
    siteName: 'Virtual Cardápio',
    images: [
      {
        url: 'https://virtualcardapio.com.br/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Virtual Cardápio - Sistema de Cardápio Digital',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cardápio Digital para Restaurantes | Menu Online com QR Code',
    description: 'Crie seu cardápio digital em minutos! Sistema completo com QR Code, pedidos online e relatórios. Teste grátis.',
    images: ['https://virtualcardapio.com.br/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://virtualcardapio.com.br',
  },
  verification: {
    google: 'google4b8f3a2228e927e8',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: any = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error('getServerSession failed:', err);
    session = null;
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
        <GoogleTagManager />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans`} suppressHydrationWarning>
        <Providers session={session}>
          <LanguageProvider>
            {children}
            <ConditionalWhatsApp />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
