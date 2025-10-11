
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
        zIndex: 1000,
        background: 'white',
        borderBottom: '2px solid #f3f4f6',
        boxShadow: isScrolled ? '0 4px 12px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        width: '100%',
        minHeight: '64px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div 
        ref={navContainerRef}
        className="category-menu-container"
        style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <style jsx>{`
          .category-menu-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              ref={isActive ? activeButtonRef : null}
              onClick={() => onCategoryChange(category.id)}
              style={{ 
                flexShrink: 0,
                minWidth: '120px',
                height: '44px',
                padding: '0 20px',
                borderRadius: '24px',
                border: 'none',
                background: isActive 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                  : '#f9fafb',
                color: isActive ? 'white' : '#4b5563',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                boxShadow: isActive 
                  ? '0 4px 12px rgba(239, 68, 68, 0.4), 0 2px 4px rgba(0,0,0,0.1)' 
                  : '0 1px 3px rgba(0,0,0,0.1)',
                transform: isActive ? 'translateY(-2px) scale(1.02)' : 'scale(1)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                outline: 'none',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = isActive 
                  ? 'translateY(-2px) scale(1.02)' 
                  : 'scale(1)';
              }}
            >
              <span style={{ 
                fontSize: '20px',
                lineHeight: 1,
                filter: isActive ? 'brightness(1.2)' : 'none'
              }}>
                {category.icon}
              </span>
              <span style={{ 
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                letterSpacing: '0.01em'
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
