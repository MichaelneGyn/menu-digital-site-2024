
'use client';

import { useState, useEffect, useRef } from 'react';
import { ClientCategory } from '@/lib/restaurant';

interface RestaurantNavProps {
  categories: ClientCategory[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function RestaurantNav({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: RestaurantNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const activeButtonRef = useRef<HTMLButtonElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Detecta scroll para adicionar sombra
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll para o botão ativo
  useEffect(() => {
    if (activeButtonRef.current && navContainerRef.current) {
      const button = activeButtonRef.current;
      const container = navContainerRef.current;
      
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const containerWidth = container.clientWidth;

      // Centraliza o botão ativo
      const scrollTo = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
      
      container.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  // Se não tem categorias, não renderiza
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <nav 
      className="category-sticky-menu"
      style={{ 
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: 'linear-gradient(90deg, #3b0d6b 0%, #4a148c 25%, #6a1b9a 50%, #7b1fa2 75%, #8e24aa 100%)',
        borderBottom: 'none',
        boxShadow: isScrolled ? '0 4px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.3s ease',
        width: '100%',
        padding: '0'
      }}
    >
      <div 
        ref={navContainerRef}
        className="category-menu-container"
        style={{ 
          maxWidth: '100%',
          margin: '0',
          width: '100%',
          padding: '16px 20px',
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          position: 'relative'
        }}
      >
        <style jsx>{`
          .category-menu-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Progress bar de scroll */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'rgba(255,255,255,0.2)'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #ef4444)',
            width: '30%',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              ref={isActive ? activeButtonRef : null}
              onClick={() => onCategoryChange(category.id)}
              style={{ 
                flexShrink: 0,
                minWidth: '150px',
                height: '44px',
                padding: '0 20px',
                borderRadius: '6px',
                border: 'none',
                background: isActive 
                  ? 'rgba(255, 255, 255, 0.95)' 
                  : 'transparent',
                color: isActive ? '#6a1b9a' : 'white',
                fontWeight: isActive ? '700' : '600',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '10px',
                whiteSpace: 'nowrap',
                boxShadow: isActive 
                  ? '0 3px 12px rgba(0,0,0,0.2)' 
                  : 'none',
                transform: 'scale(1)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                outline: 'none',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span style={{ 
                fontSize: '18px',
                lineHeight: 1
              }}>
                {category.icon}
              </span>
              <span style={{ 
                fontSize: '15px',
                fontWeight: isActive ? '700' : '600',
                letterSpacing: '0.02em'
              }}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
