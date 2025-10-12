
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ClientMenuItem } from '@/lib/restaurant';
import ProductCustomizationModalDynamic from './product-customization-modal-dynamic';
import ProductCustomizationModal from './product-customization-modal';

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
      const response = await fetch(`/api/menu-items/${item.id}/customizations`);
      if (response.ok) {
        const customizations = await response.json();
        setHasCustomizations(customizations.length > 0);
      }
    } catch (error) {
      console.error('Error checking customizations:', error);
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
    // Se tem customizações vinculadas, sempre abre o modal
    if (hasCustomizations) {
      setShowCustomizationModal(true);
    } else {
      // Fallback: verificar por palavras-chave (comportamento antigo)
      const needsCustomization = ['pizza', 'massa', 'lanche'].some(type => 
        item.name?.toLowerCase().includes(type) || 
        item.description?.toLowerCase().includes(type)
      );

      if (needsCustomization) {
        setShowCustomizationModal(true);
      } else {
        onAddToCart(item);
      }
    }
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

      {showCustomizationModal && (
        <>
          {hasCustomizations ? (
            <ProductCustomizationModalDynamic
              item={item}
              onAdd={handleCustomizedAdd}
              onClose={() => setShowCustomizationModal(false)}
            />
          ) : (
            <ProductCustomizationModal
              item={item}
              onAdd={handleCustomizedAdd}
              onClose={() => setShowCustomizationModal(false)}
            />
          )}
        </>
      )}
    </>
  );
}
