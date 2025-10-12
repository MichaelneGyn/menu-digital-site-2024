
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

  useEffect(() => {
    if (totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

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

  // Sempre mostrar o carrinho, mesmo quando vazio
  return (
    <button 
      className={`cart-float ${isAnimating ? 'cart-animate' : ''}`}
      onClick={handleCartClick}
      type="button"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        zIndex: 999999,
        display: 'flex',
        background: 'linear-gradient(135deg, #EA1D2C 0%, #D01726 100%)',
        padding: '14px 20px',
        borderRadius: '50px',
        border: 'none',
        color: 'white',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 30px rgba(234, 29, 44, 0.6)',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShoppingCart size={22} strokeWidth={2.5} />
        <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>Carrinho</span>
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
