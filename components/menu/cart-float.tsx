
'use client';

import { useState, useEffect } from 'react';
import { CartItem } from './menu-page';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartFloatProps {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  onOpenCart: () => void;
}

export default function CartFloat({ items, totalItems, totalPrice, onOpenCart }: CartFloatProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      console.log('🛒 CartFloat - Detecção:', { 
        width: window.innerWidth, 
        isMobile: mobile,
        totalItems,
        totalPrice 
      });
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [totalItems, totalPrice]);

  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  // LOG para debug
  console.log('🛒 CartFloat RENDERIZANDO:', { isMobile, totalItems, totalPrice });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleCartClick = () => {
    if (totalItems === 0) {
      toast.error('Seu carrinho está vazio!');
      return;
    }
    onOpenCart();
  };

  // Estilos diferentes para mobile e desktop
  const baseStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 999999,
    display: 'flex',
    background: '#EA1D2C',
    border: 'none',
    color: 'white',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 8px 30px rgba(234, 29, 44, 0.8)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    WebkitTapHighlightColor: 'transparent'
  };

  const buttonStyle: React.CSSProperties = isMobile ? {
    ...baseStyle,
    // MOBILE: Full width na parte inferior
    bottom: '16px',
    left: '16px',
    right: '16px',
    padding: '18px 20px',
    borderRadius: '50px',
    width: 'calc(100vw - 32px)',
    maxWidth: 'none',
    fontSize: '16px'
  } : {
    ...baseStyle,
    // DESKTOP: Lado direito
    bottom: '20px',
    right: '20px',
    left: 'auto',
    padding: '14px 24px',
    borderRadius: '50px',
    minWidth: '280px',
    maxWidth: '350px',
    fontSize: '16px'
  };

  return (
    <button 
      className={`cart-float ${isAnimating ? 'cart-animate' : ''}`}
      onClick={handleCartClick}
      type="button"
      style={buttonStyle}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShoppingCart size={22} strokeWidth={2.5} />
        {!isMobile && <span>Carrinho</span>}
        {totalItems > 0 && (
          <span style={{
            background: 'white',
            color: '#EA1D2C',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {totalItems}
          </span>
        )}
      </div>
      
      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
        {formatPrice(totalPrice)}
      </div>
    </button>
  );
}
