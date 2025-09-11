
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
    <nav className="restaurant-nav">
      <div className="nav-container max-w-6xl mx-auto px-8 flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-red-600">
        {categories?.map((category) => (
          <button
            key={category.id}
            className={`nav-item ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
