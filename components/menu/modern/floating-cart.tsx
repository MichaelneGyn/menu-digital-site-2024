'use client';

import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface FloatingCartProps {
  totalItems: number;
  totalPrice: number;
  onOpenCart: () => void;
  primaryColor?: string;
}

export function FloatingCart({ totalItems, totalPrice, onOpenCart, primaryColor = '#EA1D2C' }: FloatingCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isBumping, setIsBumping] = useState(false);

  useEffect(() => {
    if (totalItems > 0) {
      setIsVisible(true);
      setIsBumping(true);
      const timer = setTimeout(() => setIsBumping(false), 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [totalItems]);

  if (!isVisible) return null;

  return (
    <div 
      onClick={onOpenCart}
      className={cn(
        "fixed bottom-24 right-4 z-50 flex items-center gap-3 text-white px-6 py-3 rounded-full shadow-xl cursor-pointer hover:opacity-90 transition-all duration-300 active:scale-95 animate-in slide-in-from-bottom-5 fade-in",
        isBumping && "scale-110"
      )}
      style={{ backgroundColor: primaryColor }}
    >
      <div className="relative flex items-center">
        <ShoppingCart className="h-6 w-6 fill-white" />
        <span className="absolute -top-2 -right-2 bg-white text-xs font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm" style={{ color: primaryColor }}>
          {totalItems}
        </span>
      </div>
      
      <div className="flex flex-col text-sm leading-none items-start">
        <span className="font-semibold text-xs opacity-90">Ver cesta</span>
        <span className="font-bold text-base">
          {totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>
    </div>
  );
}
