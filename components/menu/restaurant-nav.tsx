
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

  // Auto-scroll para o botão ativo com animação suave
  useEffect(() => {
    if (activeButtonRef.current && navContainerRef.current) {
      const button = activeButtonRef.current;
      const container = navContainerRef.current;
      
      // Pequeno delay para garantir que a animação seja visível
      setTimeout(() => {
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const containerWidth = container.clientWidth;

        // Centraliza o botão ativo
        const scrollTo = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        
        container.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      }, 100);
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
        zIndex: 999,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'box-shadow 0.3s ease',
        width: '100%',
        minHeight: '60px',
        padding: '0',
        display: 'flex',
        alignItems: 'center',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)'
      }}
    >
      <div 
        ref={navContainerRef}
        className="category-menu-container"
        style={{ 
          maxWidth: '100%',
          margin: '0',
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          scrollBehavior: 'smooth'
        }}
      >
        <style jsx>{`
          .category-menu-container::-webkit-scrollbar {
            display: none;
          }
          
          @keyframes pulse {
            0% {
              transform: translateY(-2px) scale(1);
            }
            50% {
              transform: translateY(-2px) scale(1.12);
            }
            100% {
              transform: translateY(-2px) scale(1.08);
            }
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
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
                minWidth: 'auto',
                height: '36px',
                padding: '0 14px',
                borderRadius: '18px',
                border: isActive ? '2px solid #ef4444' : '1px solid #e5e7eb',
                background: isActive 
                  ? '#fef2f2' 
                  : 'white',
                color: isActive ? '#dc2626' : '#6b7280',
                fontWeight: isActive ? '600' : '500',
                fontSize: '13px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: isActive 
                  ? '0 2px 8px rgba(239, 68, 68, 0.2)' 
                  : '0 1px 2px rgba(0,0,0,0.05)',
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                outline: 'none',
                userSelect: 'none',
                position: 'relative'
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
                e.currentTarget.style.transform = isActive 
                  ? 'translateY(-1px) scale(1.03)' 
                  : 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = isActive 
                  ? 'translateY(-2px) scale(1.05)' 
                  : 'scale(1)';
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
                fontWeight: isActive ? '700' : '500',
                letterSpacing: isActive ? '0.02em' : '0.01em',
                lineHeight: 1,
                textShadow: isActive ? '0 1px 2px rgba(220, 38, 38, 0.1)' : 'none'
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
