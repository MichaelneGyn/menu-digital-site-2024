
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center page-transition">
      <div className="max-w-4xl mx-auto text-center p-8">
        <div className="hero-section-landing">
          <h1 className="landing-main-title">
            Cardápio Online Editável
          </h1>
          <p className="landing-main-subtitle">
            Sistema SaaS completo para restaurantes gerenciarem seus cardápios online
          </p>
          
          <div className="flex gap-4 justify-center mb-12 flex-wrap">
            <Link href="/di-sarda-pizzaria">
              <Button size="lg" className="cta-button-primary">
                Cardápio Di Sarda Pizzaria
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" className="cta-button-secondary">
                Área do Restaurante
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="feature-card-old">
              <div className="feature-icon-old">📱</div>
              <h3 className="feature-title-old">Totalmente Responsivo</h3>
              <p className="feature-description-old">Funciona perfeitamente em celulares, tablets e desktops</p>
            </div>
            
            <div className="feature-card-old">
              <div className="feature-icon-old">⚡</div>
              <h3 className="feature-title-old">Fácil de Gerenciar</h3>
              <p className="feature-description-old">Interface intuitiva para adicionar, editar e remover itens do cardápio</p>
            </div>
            
            <div className="feature-card-old">
              <div className="feature-icon-old">🛒</div>
              <h3 className="feature-title-old">Carrinho Integrado</h3>
              <p className="feature-description-old">Sistema de carrinho funcional para facilitar os pedidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
