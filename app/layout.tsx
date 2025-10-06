import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cardápio Online Editável - Sistema SaaS para Restaurantes",
  description: "Sistema completo de cardápio online editável para restaurantes. Gerencie seu menu de forma fácil e profissional.",
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
        </Providers>
      </body>
    </html>
  );
}