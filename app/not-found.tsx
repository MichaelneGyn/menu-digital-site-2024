
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="hero-section max-w-2xl">
          <h1 className="text-6xl font-bold mb-4 relative z-10">404</h1>
          <h2 className="text-3xl font-bold mb-6 relative z-10">
            Página não encontrada
          </h2>
          <p className="text-xl mb-8 relative z-10">
            Ops! A página que você está procurando não existe.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full">
                Voltar ao Início
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="px-8 py-3 rounded-full">
                Área do Restaurante
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
