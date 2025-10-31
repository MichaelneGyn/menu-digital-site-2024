
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

  return (
    <button 
      id="cart-float-button"
      className={`cart-float ${isAnimating ? 'cart-animate' : ''}`}
      onClick={handleCartClick}
      type="button"
    >
      {/* Layout circular compacto para todas as telas */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ShoppingCart size={24} strokeWidth={2.5} />
        {totalItems > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'white',
            color: '#EA1D2C',
            padding: '4px 6px',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 'bold',
            minWidth: '18px',
            textAlign: 'center',
            lineHeight: '1',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
        {/* Preço pequeno abaixo do ícone */}
        {totalPrice > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {formatPrice(totalPrice)}
          </div>
        )}
      </div>
    </button>
  );
}
