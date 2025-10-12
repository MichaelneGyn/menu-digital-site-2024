import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cardápio Online Editável - Sistema SaaS para Restaurantes",
  description: "Sistema completo de cardápio online editável para restaurantes. Gerencie seu menu de forma fácil e profissional.",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes",
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
      <body className={inter.className} suppressHydrationWarning>
        <Providers session={session}>
          {children}
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