
'use client';

import { useState, useEffect, useRef } from 'react';
import { ClientCategory } from '@/lib/restaurant';
import { Search } from 'lucide-react';

interface RestaurantNavProps {
  categories: ClientCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  primaryColor?: string;
  secondaryColor?: string;
  onSearch?: (query: string) => void;
}

export default function RestaurantNav({ 
  categories, 
  activeCategory, 
  onCategoryChange,
  primaryColor = '#EA1D2C',
  secondaryColor = '#FFC107',
  onSearch
}: RestaurantNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef<HTMLElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      // Apenas controla a sombra baseada no scroll
      setIsScrolled(scrollTop > 50);
    };

    // Adiciona listener apenas para sombra
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto-scroll para categoria ativa
  useEffect(() => {
    if (navContainerRef.current && activeCategory) {
      const activeButton = navContainerRef.current.querySelector(`[data-category="${activeCategory}"]`) as HTMLElement;
      if (activeButton) {
        const container = navContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        
        if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
          const scrollLeft = activeButton.offsetLeft - (container.offsetWidth / 2) + (activeButton.offsetWidth / 2);
          container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
      }
    }
  }, [activeCategory]);

  // Se não tem categorias, não renderiza
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <nav 
      ref={navRef}
      className="category-sticky-menu"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'white',
        boxShadow: isScrolled 
          ? '0 4px 12px rgba(0,0,0,0.15)' 
          : '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.3s ease'
      }}
    >
      {/* Campo de Busca */}
      {showSearch && (
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '12px',
                color: '#9ca3af'
              }}
            />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                onSearch?.('');
              }}
              style={{
                marginLeft: '8px',
                padding: '8px 16px',
                background: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 16px'
      }}>
        {/* Botão de Busca */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{
            minWidth: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: showSearch ? primaryColor : '#f9fafb',
            color: showSearch ? 'white' : '#4b5563',
            border: showSearch ? 'none' : '1px solid #e5e7eb',
            borderRadius: '50%',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.3s'
          }}
        >
          <Search size={20} />
        </button>
        
        <div 
          ref={navContainerRef}
          className="category-menu-container"
          style={{ 
            flex: 1,
            display: 'flex',
            gap: '12px',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          <style jsx>{`
            .category-menu-container::-webkit-scrollbar {
              display: none;
            }
            
            @keyframes pulse {
              0% { transform: translateY(-2px) scale(1); }
              50% { transform: translateY(-2px) scale(1.12); }
              100% { transform: translateY(-2px) scale(1); }
            }
            
            .category-button {
               min-width: 100px;
               height: 44px;
               padding: 0 20px;
               border: none;
               border-radius: 24px;
               font-size: 14px;
               font-weight: 600;
               cursor: pointer;
               transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
               display: flex;
               align-items: center;
               justify-content: center;
               white-space: nowrap;
               flex-shrink: 0;
               position: relative;
               overflow: hidden;
             }
            
            .category-button.active {
              background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
              color: white;
              transform: translateY(-2px) scale(1.02);
              box-shadow: 
                0 8px 25px rgba(220, 38, 38, 0.4),
                0 4px 12px rgba(0, 0, 0, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
              animation: pulse 2s ease-in-out infinite;
            }
            
            .category-button.active::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
              animation: shine 2s ease-in-out infinite;
            }
            
            .category-button.inactive {
              background: #f9fafb;
              color: #4b5563;
              border: 1px solid #e5e7eb;
            }
            
            .category-button.inactive:hover {
              background: #f3f4f6;
              color: #374151;
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            
            @keyframes shine {
               0% { left: -100%; }
               50% { left: 100%; }
               100% { left: 100%; }
             }
            
            @media (max-width: 768px) {
              .category-button {
                min-width: 100px;
                height: 40px;
                padding: 0 16px;
                font-size: 13px;
              }
              
              .category-menu-container {
                padding: 10px 12px !important;
                gap: 10px !important;
              }
            }
          `}</style>

          {categories.map((category) => {
             const isActive = category.id === activeCategory;
             return (
               <button
                 key={category.id}
                 data-category={category.id}
                 onClick={() => onCategoryChange(category.id)}
                 className={`category-button ${isActive ? 'active' : 'inactive'}`}
                 aria-pressed={isActive}
                 role="tab"
               >
                 <span>{category.name}</span>
               </button>
             );
           })}
        </div>
      </div>
    </nav>
  );
}
