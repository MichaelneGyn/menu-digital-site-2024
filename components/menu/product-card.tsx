
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ClientMenuItem } from '@/lib/restaurant';
import ProductCustomizationModalDynamic from './product-customization-modal-dynamic';

interface ProductCardProps {
  item: ClientMenuItem;
  onAddToCart: (item: ClientMenuItem, customization?: ProductCustomization) => void;
}

export interface ProductCustomization {
  flavors?: string[];
  extras?: Array<{name: string; price: number}>;
  observations?: string;
  totalPrice: number;
}

export default function ProductCard({ item, onAddToCart }: ProductCardProps) {
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [hasCustomizations, setHasCustomizations] = useState(false);
  const [checkingCustomizations, setCheckingCustomizations] = useState(false);

  useEffect(() => {
    checkForCustomizations();
  }, [item.id]);

  const checkForCustomizations = async () => {
    try {
      setCheckingCustomizations(true);
      console.log('🔍 Checking customizations for item:', item.id, item.name);
      const response = await fetch(`/api/menu-items/${item.id}/customizations`);
      console.log('📡 Response status:', response.status);
      if (response.ok) {
        const customizations = await response.json();
        console.log('📦 Customizations received:', customizations);
        console.log('✅ Has customizations?', customizations.length > 0);
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
    // SEMPRE abre modal se tiver customizações no banco (prioridade máxima)
    if (hasCustomizations) {
      setShowCustomizationModal(true);
      return;
    }
    
    // Se não tem customizações no banco, adiciona direto ao carrinho
    onAddToCart(item);
  };

  const handleCustomizedAdd = (customization: ProductCustomization) => {
    onAddToCart(item, customization);
    setShowCustomizationModal(false);
  };

  return (
    <>
      <div className={`product-card ${item?.isPromo ? 'promo' : ''}`}>
        {item?.isPromo && item?.promoTag && (
          <span className="promo-tag">{item.promoTag}</span>
        )}
        
        {item?.image && (
          <div className="product-image-container">
            <Image
              src={
                item.image?.startsWith('/') 
                  ? item.image 
                  : item.image?.startsWith('http') 
                    ? item.image 
                    : item.image
                      ? `/api/image?key=${encodeURIComponent(item.image)}`
                      : 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
              }
              alt={item?.name || 'Produto'}
              fill
              className="product-image"
            />
          </div>
        )}
        
        <div className="product-info">
          <h3 className="product-name">{item?.name}</h3>
          <p className="product-description">{item?.description}</p>
          
          <div className="product-footer">
            <div className="product-price-container">
              {item?.originalPrice && item.originalPrice > item.price && (
                <span className="product-old-price">
                  {formatPrice(Number(item.originalPrice))}
                </span>
              )}
              <span className="product-price">
                {formatPrice(Number(item?.price || 0))}
              </span>
            </div>
            
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              + Adicionar
            </button>
          </div>
        </div>
      </div>

      {showCustomizationModal && hasCustomizations && (
        <ProductCustomizationModalDynamic
          item={item}
          onAdd={handleCustomizedAdd}
          onClose={() => setShowCustomizationModal(false)}
        />
      )}
    </>
  );
}
