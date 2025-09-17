
'use client';

import { useEffect, useRef } from 'react';
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
  const navContainerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active category
  useEffect(() => {
    if (activeButtonRef.current && navContainerRef.current) {
      const container = navContainerRef.current;
      const activeButton = activeButtonRef.current;
      
      const containerWidth = container.clientWidth;
      const buttonWidth = activeButton.offsetWidth;
      const buttonLeft = activeButton.offsetLeft;
      
      // Position the active button at 1/4 from the left instead of center
      // This allows more space to show the next categories
      const scrollLeft = buttonLeft - (containerWidth / 4);
      
      // Ensure we don't scroll beyond boundaries
      const maxScrollLeft = container.scrollWidth - containerWidth;
      const finalScrollLeft = Math.max(0, Math.min(scrollLeft, maxScrollLeft));
      
      console.log('Nav Scroll Debug:', {
        activeCategory,
        containerWidth,
        buttonWidth,
        buttonLeft,
        scrollLeft,
        finalScrollLeft,
        maxScrollLeft
      });
      
      container.scrollTo({
        left: finalScrollLeft,
        behavior: 'smooth'
      });
    }
  }, [activeCategory]);

  return (
    <nav className="restaurant-nav">
      <div 
        ref={navContainerRef}
        className="container mx-auto px-2 sm:px-4 w-full flex gap-1 sm:gap-2 lg:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-red-600"
      >
        {categories?.map((category) => (
          <button
            key={category.id}
            ref={activeCategory === category.id ? activeButtonRef : null}
            className={`nav-item ${activeCategory === category.id ? 'active' : ''} px-2 py-2 sm:px-3 sm:py-2 lg:px-4 lg:py-3 text-xs sm:text-sm lg:text-base whitespace-nowrap min-w-fit flex-shrink-0`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="text-sm sm:text-base lg:text-lg mr-1">{category.icon}</span>
            <span className="font-medium text-xs sm:text-sm lg:text-base">{category.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
