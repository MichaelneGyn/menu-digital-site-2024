
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: isScrolled ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'box-shadow 0.3s ease',
        width: '100%',
        minHeight: '80px',
        padding: '0',
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
          padding: '20px 24px',
          display: 'flex',
          gap: '20px',
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
        
        {/* Remover progress bar */}
        
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
                height: '40px',
                padding: '0 16px',
                borderRadius: '20px',
                border: isActive ? '2px solid #ef4444' : '1px solid #e5e7eb',
                background: isActive 
                  ? '#fef2f2' 
                  : 'white',
                color: isActive ? '#ef4444' : '#6b7280',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: isActive 
                  ? '0 2px 8px rgba(239, 68, 68, 0.2)' 
                  : '0 1px 3px rgba(0,0,0,0.1)',
                transform: 'scale(1)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                outline: 'none',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
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
                fontSize: '16px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center'
              }}>
                {category.icon}
              </span>
              <span style={{ 
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                letterSpacing: '0.01em',
                lineHeight: 1
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
