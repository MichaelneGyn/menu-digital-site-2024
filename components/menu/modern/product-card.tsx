'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { ClientMenuItem } from '@/lib/restaurant';
import ProductCustomizationModalImproved, { ProductCustomization } from '../product-customization-modal-improved';

interface ProductCardProps {
  item: ClientMenuItem;
  onAddToCart: (item: ClientMenuItem, customization?: ProductCustomization) => void;
  primaryColor?: string;
}

export function ProductCard({
  item,
  onAddToCart,
  primaryColor = '#EA1D2C'
}: ProductCardProps) {
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [hasCustomizations, setHasCustomizations] = useState(false);

  useEffect(() => {
    checkForCustomizations();
  }, [item.id]);

  const checkForCustomizations = async () => {
    try {
      const response = await fetch(`/api/menu-items/${item.id}/customizations`);
      if (response.ok) {
        const customizations = await response.json();
        setHasCustomizations(customizations.length > 0);
      }
    } catch (error) {
      console.error('❌ Error checking customizations:', error);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasCustomizations) {
      setShowCustomizationModal(true);
      return;
    }
    onAddToCart(item);
  };

  const handleCustomizedAdd = (customization: ProductCustomization) => {
    onAddToCart(item, customization);
    setShowCustomizationModal(false);
  };

  const imageUrl = item.image?.startsWith('http')
    ? item.image
    : item.image
      ? `/api/image?key=${encodeURIComponent(item.image)}`
      : '/placeholder-food.png';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden bg-card rounded-2xl border border-border/50 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/20 h-full">
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          <img 
            src={imageUrl} 
            alt={item.name} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <Button 
              onClick={handleAddToCart}
              size="sm" 
              className="w-full text-white font-semibold shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              Adicionar ao carrinho
            </Button>
          </div>
          {item.isPromo && item.promoTag && (
             <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
               {item.promoTag}
             </div>
          )}
        </div>
        
        <div className="flex flex-col flex-1 p-4">
          <h3 className="font-display font-semibold text-lg leading-tight text-foreground line-clamp-1 mb-1">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(Number(item.originalPrice))}
                </span>
              )}
              <span className="font-display font-bold text-lg" style={{ color: primaryColor }}>
                {formatPrice(Number(item.price))}
              </span>
            </div>
            
            <Button 
              onClick={handleAddToCart}
              size="icon" 
              variant="secondary" 
              className="h-8 w-8 rounded-full sm:hidden shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {showCustomizationModal && hasCustomizations && (
        <ProductCustomizationModalImproved
          item={item}
          onAdd={handleCustomizedAdd}
          onClose={() => setShowCustomizationModal(false)}
        />
      )}
    </>
  );
}
