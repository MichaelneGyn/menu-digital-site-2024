
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ClientMenuItem } from '@/lib/restaurant';
import ProductCustomizationModalImproved from './product-customization-modal-improved';
import { Plus } from 'lucide-react';

interface ProductCardProps {
  item: ClientMenuItem;
  onAddToCart: (item: ClientMenuItem, customization?: ProductCustomization) => void;
  viewOnly?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface ProductCustomization {
  flavors?: string[];
  extras?: Array<{name: string; price: number}>;
  observations?: string;
  size?: string;
  ingredients?: string[];
  totalPrice: number;
}

export default function ProductCard({ 
  item, 
  onAddToCart, 
  viewOnly = false,
  primaryColor = '#EA1D2C',
  secondaryColor = '#FFC107'
}: ProductCardProps) {
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [hasCustomizations, setHasCustomizations] = useState(false);
  const [checkingCustomizations, setCheckingCustomizations] = useState(false);

  useEffect(() => {
    checkForCustomizations();
  }, [item.id]);

  const checkForCustomizations = async () => {
    try {
      setCheckingCustomizations(true);
      const response = await fetch(`/api/menu-items/${item.id}/customizations`);
      if (response.ok) {
        const customizations = await response.json();
        setHasCustomizations(customizations.length > 0);
      }
    } catch (error) {
      console.error('❌ Error checking customizations:', error);
    } finally {
      setCheckingCustomizations(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleAddToCart = () => {
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

  return (
    <>
      <div 
        className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 flex flex-col h-full"
        style={{
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        {/* Promo Tag */}
        {item?.isPromo && item?.promoTag && (
          <div 
            className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
            style={{ backgroundColor: secondaryColor, color: '#1a1a1a' }}
          >
            {item.promoTag}
          </div>
        )}
        
        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
          <Image
            src={
              item.image?.startsWith('http')
                  ? item.image 
                  : item.image
                    ? `/api/image?key=${encodeURIComponent(item.image)}`
                    : '/placeholder-food.png'
            }
            alt={item?.name || 'Produto'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        </div>
        
        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight group-hover:text-gray-900">
              {item?.name}
            </h3>
            
            {item?.description && (
              <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-3">
                {item.description}
              </p>
            )}
          </div>
          
          {/* Footer: Price & Action */}
          <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex flex-col">
              {item?.originalPrice && item.originalPrice > item.price && (
                <span className="text-xs text-gray-400 line-through mb-0.5">
                  {formatPrice(Number(item.originalPrice))}
                </span>
              )}
              <span 
                className="text-lg font-bold"
                style={{ color: primaryColor }}
              >
                {formatPrice(Number(item?.price || 0))}
              </span>
            </div>
            
            {!viewOnly && (
              <button
                onClick={handleAddToCart}
                className="relative overflow-hidden rounded-full p-2.5 transition-all duration-300 active:scale-95 flex items-center gap-2 pr-4 pl-3"
                style={{
                  backgroundColor: `${primaryColor}15`, // 15 = approx 10% opacity hex
                  color: primaryColor,
                }}
              >
                <div 
                  className="rounded-full p-1"
                  style={{ backgroundColor: primaryColor, color: 'white' }}
                >
                   <Plus size={16} strokeWidth={3} />
                </div>
                <span className="text-sm font-bold">Adicionar</span>
              </button>
            )}
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
