
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
    >
      <div className="cart-float-content">
        <div className="cart-icon-wrapper">
          <ShoppingCart size={22} strokeWidth={2.5} />
          <span className="cart-text">Carrinho</span>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </div>
        
        <div className="cart-total">
          {formatPrice(totalPrice)}
        </div>
      </div>
    </button>
  );
}
