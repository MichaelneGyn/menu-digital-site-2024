
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
      setIsScrolled(window.scrollY > 100);
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
      const containerScrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;

      // Centraliza o botão ativo
      const scrollTo = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
      
      container.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  return (
    <nav 
      className={`restaurant-nav ${isScrolled ? 'scrolled' : ''}`}
      style={{ 
        display: 'block', 
        visibility: 'visible', 
        opacity: 1,
        position: 'sticky',
        top: 0,
        zIndex: 999,
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        transition: 'box-shadow 0.3s ease'
      }}
    >
      <div 
        ref={navContainerRef}
        className="nav-container max-w-6xl mx-auto px-2 sm:px-4 md:px-8 flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto py-3" 
        style={{ 
          scrollbarWidth: 'none', 
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexWrap: 'nowrap',
          maxWidth: '100%',
          msOverflowStyle: 'none'
        }}
      >
        <style jsx>{`
          .nav-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {categories?.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              ref={isActive ? activeButtonRef : null}
              className={`category-nav-button ${isActive ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.id)}
              style={{ 
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
                padding: '8px 16px',
                borderRadius: '20px',
                border: isActive ? '2px solid #d32f2f' : '1px solid #e5e7eb',
                background: isActive ? '#fef2f2' : 'white',
                color: isActive ? '#d32f2f' : '#4b5563',
                fontWeight: isActive ? '600' : '500',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 2px 4px rgba(211,47,47,0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                transform: isActive ? 'translateY(-1px)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
