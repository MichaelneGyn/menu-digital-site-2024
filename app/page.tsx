
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center page-transition px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center p-4 sm:p-6 lg:p-8">
        <div className="hero-section">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 relative z-10 animate-slide-in-up">
            Cardápio Online Editável
          </h1>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 relative z-10 animate-slide-in-up animate-stagger-1 px-2">
            Sistema SaaS completo para restaurantes gerenciarem seus cardápios online
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 animate-slide-in-up animate-stagger-2">
            <Link href="/di-sarda-pizzaria" className="w-full sm:w-auto">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl animate-pulse-slow btn-gradient w-full sm:w-auto text-sm sm:text-base">
                Cardápio Di Sarda Pizzaria
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" className="bg-white text-red-600 hover:bg-red-600 hover:text-white px-6 sm:px-8 py-3 rounded-full cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white font-semibold w-full sm:w-auto text-sm sm:text-base">
                Área do Restaurante
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <div className="bg-red-600 bg-opacity-90 backdrop-blur p-4 sm:p-6 rounded-lg hover-scale transition-all duration-500 hover:bg-red-700 cursor-pointer animate-slide-in-up animate-stagger-3 shadow-lg">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 rotate-on-hover animate-float">📱</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Totalmente Responsivo</h3>
              <p className="text-red-100 text-sm sm:text-base">Funciona perfeitamente em celulares, tablets e desktops</p>
            </div>
            
            <div className="bg-red-600 bg-opacity-90 backdrop-blur p-4 sm:p-6 rounded-lg hover-scale transition-all duration-500 hover:bg-red-700 cursor-pointer animate-slide-in-up animate-stagger-4 shadow-lg">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 rotate-on-hover animate-float-reverse">⚡</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Fácil de Gerenciar</h3>
              <p className="text-red-100 text-sm sm:text-base">Interface intuitiva para adicionar, editar e remover itens do cardápio</p>
            </div>
            
            <div className="bg-red-600 bg-opacity-90 backdrop-blur p-4 sm:p-6 rounded-lg hover-scale transition-all duration-500 hover:bg-red-700 cursor-pointer animate-slide-in-up animate-stagger-5 shadow-lg sm:col-span-2 lg:col-span-1">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 rotate-on-hover animate-float">🛒</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Carrinho Integrado</h3>
              <p className="text-red-100 text-sm sm:text-base">Sistema de carrinho funcional para facilitar os pedidos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
