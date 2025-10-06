
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center page-transition">
      <div className="max-w-4xl mx-auto text-center p-8">
        <div className="hero-section">
          <h1 className="text-5xl font-bold mb-6 relative z-10 animate-slide-in-up">
            Cardápio Online Editável
          </h1>
          <p className="text-xl mb-8 relative z-10 animate-slide-in-up animate-stagger-1">
            Sistema SaaS completo para restaurantes gerenciarem seus cardápios online
          </p>
          
          <div className="flex gap-4 justify-center mb-8 animate-slide-in-up animate-stagger-2">
            <Link href="/di-sarda-pizzaria">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse-slow btn-gradient">
                Cardápio Di Sarda Pizzaria
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-600 hover:text-white px-8 py-3 rounded-full cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white font-semibold">
                Área do Restaurante
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-red-600 bg-opacity-90 backdrop-blur p-6 rounded-lg hover-scale transition-all duration-500 hover:bg-red-700 cursor-pointer animate-slide-in-up animate-stagger-3 shadow-lg">
              <div className="text-3xl mb-3 rotate-on-hover animate-float">📱</div>
              <h3 className="text-xl font-semibold mb-2 text-white">Totalmente Responsivo</h3>
              <p className="text-red-100">Funciona perfeitamente em celulares, tablets e desktops</p>
            </div>
            
            <div className="bg-red-600 bg-opacity-90 backdrop-blur p-6 rounded-lg hover-scale transition-all duration-500 hover:bg-red-700 cursor-pointer animate-slide-in-up animate-stagger-4 shadow-lg">
              <div className="text-3xl mb-3 rotate-on-hover animate-float-reverse">⚡</div>
              <h3 className="text-xl font-semibold mb-2 text-white">Fácil de Gerenciar</h3>
              <p className="text-red-100">Interface intuitiva para adicionar, editar e remover itens do cardápio</p>
            </div>
            
            <div className="bg-red-600 bg-opacity-90 backdrop-blur p-6 rounded-lg hover-scale transition-all duration-500 hover:bg-red-700 cursor-pointer animate-slide-in-up animate-stagger-5 shadow-lg">
              <div className="text-3xl mb-3 rotate-on-hover animate-float">🛒</div>
              <h3 className="text-xl font-semibold mb-2 text-white">Carrinho Integrado</h3>
              <p className="text-red-100">Sistema de carrinho funcional para facilitar os pedidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
