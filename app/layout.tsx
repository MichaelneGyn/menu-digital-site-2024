import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "sonner";
import ConditionalWhatsApp from "@/components/ConditionalWhatsApp";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cardápio Digital para Restaurantes | Menu Online com QR Code - Teste Grátis",
  description: "Crie seu cardápio digital em minutos! Sistema completo com QR Code, pedidos online, relatórios de lucro e muito mais. Teste grátis por 30 dias. Aumente suas vendas hoje!",
  keywords: "cardápio digital, menu digital, cardápio online, qr code restaurante, pedidos online, sistema para restaurante, menu qr code, cardápio digital grátis",
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
    title: 'Cardápio Digital para Restaurantes | Menu Online com QR Code',
    description: 'Crie seu cardápio digital em minutos! Sistema completo com QR Code, pedidos online e relatórios. Teste grátis por 30 dias.',
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
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers session={session}>
          {children}
          <ConditionalWhatsApp />
          <Toaster 
            position="top-right" 
            richColors 
            closeButton
            duration={4000}
            toastOptions={{
              style: {
                background: 'white',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
              },
              className: 'toast-custom',
              descriptionClassName: 'toast-description',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}