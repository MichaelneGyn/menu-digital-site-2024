
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ClientMenuItem } from '@/lib/restaurant';
import ProductCustomizationModalImproved from './product-customization-modal-improved';

interface ProductCardProps {
  item: ClientMenuItem;
  onAddToCart: (item: ClientMenuItem, customization?: ProductCustomization) => void;
  viewOnly?: boolean;
}

export interface ProductCustomization {
  // Opções comuns
  flavors?: string[];
  extras?: Array<{name: string; price: number}>;
  observations?: string;

  // Campos adicionais usados pelo novo modal
  size?: string; // ex: tamanho da pizza
  ingredients?: string[]; // ex: ingredientes selecionados de burger

  // Preço total calculado
  totalPrice: number;
}

export default function ProductCard({ item, onAddToCart, viewOnly = false }: ProductCardProps) {
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
                item.image?.startsWith('http')
                    ? item.image 
                    : item.image
                      ? `/api/image?key=${encodeURIComponent(item.image)}`
                      : '/placeholder-food.png'
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
            
            {/* Botão Adicionar - Apenas se NÃO for modo visualização */}
            {!viewOnly && (
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  marginTop: '8px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.25)';
                }}
              >
                <span style={{ fontSize: '14px', lineHeight: '1' }}>+</span>
                <span>Adicionar</span>
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
