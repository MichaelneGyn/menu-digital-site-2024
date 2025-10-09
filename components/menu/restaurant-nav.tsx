
'use client';

import { useState } from 'react';
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
  return (
    <nav 
      className="restaurant-nav" 
      style={{ 
        display: 'block', 
        visibility: 'visible', 
        opacity: 1,
        position: 'sticky',
        top: 0,
        zIndex: 999
      }}
    >
      <div 
        className="nav-container max-w-6xl mx-auto px-2 sm:px-4 md:px-8 flex gap-1 sm:gap-2 md:gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-red-600" 
        style={{ 
          scrollbarWidth: 'thin', 
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexWrap: 'nowrap',
          maxWidth: '100%'
        }}
      >
        {categories?.map((category) => (
          <button
            key={category.id}
            className={`nav-item ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
            style={{ 
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <span className="inline-block">{category.icon}</span> <span className="inline-block">{category.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
