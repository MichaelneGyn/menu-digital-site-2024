'use client';

import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface CategoryRailProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  primaryColor?: string;
}

export function CategoryRail({ 
  categories, 
  activeCategory, 
  onSelectCategory,
  primaryColor = '#EA1D2C',
  isSticky = true
}: CategoryRailProps & { isSticky?: boolean }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: "start", 
    containScroll: "trimSnaps",
    dragFree: true
  });

  // Auto-scroll the rail to keep the active category in view
  useEffect(() => {
    if (emblaApi && activeCategory) {
      const index = categories.findIndex(c => c.id === activeCategory);
      if (index !== -1) {
        emblaApi.scrollTo(index);
      }
    }
  }, [emblaApi, activeCategory, categories]);

  return (
    <div className={cn(
      isSticky ? "sticky top-[64px] z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 py-3 shadow-sm" : "",
      !isSticky && "w-full overflow-hidden" // If not sticky, just provide container styles
    )}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex px-4 gap-3 touch-pan-x">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "flex-[0_0_auto] px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap",
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                  : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
              )}
              style={activeCategory === category.id ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
