'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface BottomNavProps {
  cartItemsCount: number;
  restaurantSlug: string;
}

export default function BottomNav({ cartItemsCount, restaurantSlug }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('inicio');

  // Detecta qual aba está ativa baseado na URL
  useEffect(() => {
    if (pathname) {
      if (pathname.includes('/pedido')) {
        setActiveTab('pedidos');
      } else if (pathname === `/${restaurantSlug}`) {
        setActiveTab('inicio');
      }
    }
  }, [pathname, restaurantSlug]);

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'inicio') {
      router.push(`/${restaurantSlug}`);
    } else if (tab === 'pedidos') {
      router.push(`/${restaurantSlug}/meus-pedidos`);
    }
    // 'carrinho' não navega, apenas abre o modal (será tratado no componente pai)
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      style={{
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
    >
      <div className="flex justify-around items-center h-16 sm:h-18 max-w-full px-4 sm:px-6 gap-2">
        {/* INÍCIO */}
        <button
          onClick={() => handleNavigation('inicio')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
            activeTab === 'inicio' ? 'text-red-600' : 'text-gray-500'
          }`}
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div className="relative">
            {activeTab === 'inicio' ? (
              // Ícone de casa preenchido (ativo)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
              </svg>
            ) : (
              // Ícone de casa outline (inativo)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            )}
          </div>
          <span
            className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium ${
              activeTab === 'inicio' ? 'font-semibold' : ''
            }`}
          >
            Início
          </span>
        </button>

        {/* CARRINHO */}
        <button
          onClick={() => {
            setActiveTab('carrinho');
            // Dispara evento customizado para abrir o carrinho
            window.dispatchEvent(new CustomEvent('openCart'));
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative ${
            activeTab === 'carrinho' ? 'text-red-600' : 'text-gray-500'
          }`}
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div className="relative">
            {activeTab === 'carrinho' ? (
              // Ícone de carrinho preenchido (ativo)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
              </svg>
            ) : (
              // Ícone de carrinho outline (inativo)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            )}
            
            {/* Badge com contador */}
            {cartItemsCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-600 text-white text-[9px] sm:text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse"
                style={{
                  minWidth: '16px',
                  padding: '0 3px',
                }}
              >
                {cartItemsCount > 9 ? '9+' : cartItemsCount}
              </span>
            )}
          </div>
          <span
            className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium ${
              activeTab === 'carrinho' ? 'font-semibold' : ''
            }`}
          >
            Carrinho
          </span>
        </button>

        {/* PEDIDOS */}
        <button
          onClick={() => handleNavigation('pedidos')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
            activeTab === 'pedidos' ? 'text-red-600' : 'text-gray-500'
          }`}
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div className="relative">
            {activeTab === 'pedidos' ? (
              // Ícone de pedidos preenchido (ativo)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path
                  fillRule="evenodd"
                  d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zm9.586 4.594a.75.75 0 00-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.116-.062l3-3.75z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              // Ícone de pedidos outline (inativo)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                />
              </svg>
            )}
          </div>
          <span
            className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium ${
              activeTab === 'pedidos' ? 'font-semibold' : ''
            }`}
          >
            Pedidos
          </span>
        </button>
      </div>
    </nav>
  );
}
