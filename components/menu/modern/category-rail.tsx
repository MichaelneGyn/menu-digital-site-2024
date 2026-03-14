'use client';

import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn, getContrastTextColor, normalizeHexColor, shiftHexColor, withAlpha } from "@/lib/utils";

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
  const resolvedPrimaryColor = normalizeHexColor(primaryColor, '#EA1D2C');
  const activeTextColor = getContrastTextColor(resolvedPrimaryColor);
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
                "flex-[0_0_auto] px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap hover:brightness-[0.98]",
                activeCategory === category.id
                  ? "shadow-sm scale-105"
                  : ""
              )}
              style={activeCategory === category.id ? {
                backgroundColor: resolvedPrimaryColor,
                borderColor: resolvedPrimaryColor,
                color: activeTextColor,
                boxShadow: `0 8px 20px ${withAlpha(resolvedPrimaryColor, 0.22)}`
              } : {
                backgroundColor: withAlpha(resolvedPrimaryColor, 0.1),
                borderColor: withAlpha(resolvedPrimaryColor, 0.2),
                color: shiftHexColor(resolvedPrimaryColor, -18),
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
