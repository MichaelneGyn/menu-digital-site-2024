
'use client';

import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { ClientRestaurant, ClientMenuItem } from '@/lib/restaurant';
import { CartItem } from './menu-page';
import toast from 'react-hot-toast';
import CheckoutFlow from '@/components/delivery/checkout-flow';

interface CartModalProps {
  items: CartItem[];
  restaurant: ClientRestaurant;
  onClose: () => void;
  onUpdateItem: (cartId: string, quantity: number) => void;
  onRemoveItem: (cartId: string) => void;
  onAddItem: (item: ClientMenuItem) => void;
}

export default function CartModal({ 
  items, 
  restaurant, 
  onClose, 
  onUpdateItem, 
  onRemoveItem,
  onAddItem
}: CartModalProps) {
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  const formatExtras = (extras: Array<{name: string; quantity?: number}> = []) =>
    extras.map((extra) => `${extra.quantity && extra.quantity > 1 ? `${extra.quantity}x ` : ''}${extra.name}`);
  
  // Converter CartItem para o formato esperado pelo CheckoutFlow
  const orderItems = items.map(item => ({
    id: item.id, // ID real do MenuItem no banco
    cartId: item.cartId, // ID único do carrinho
    name: item.name,
    price: Number(item.price),
    quantity: item.quantity,
    customizations: item.customization ? [
      ...(item.customization.flavors || []),
      ...(formatExtras(item.customization.extras || []) || []),
      ...(item.customization.observations ? [item.customization.observations] : [])
    ] : undefined
  }));
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleQuantityChange = (cartId: string, newQuantity: number) => {
    onUpdateItem(cartId, newQuantity);
  };

  const handleRemove = (cartId: string) => {
    onRemoveItem(cartId);
    toast.success('Item removido do carrinho');
  };

  if (step === 'checkout') {
    return (
      <div className="cart-modal-overlay" onClick={onClose}>
        <div className="checkout-modal bg-white md:rounded-2xl w-full md:max-h-[90vh] flex flex-col md:overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="modal-header flex-shrink-0">
            <h3>Finalizar Pedido</h3>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="checkout-body flex-1 overflow-y-auto p-0">
            <CheckoutFlow 
              items={orderItems}
              restaurant={restaurant}
              onBack={() => setStep('cart')}
              onClose={onClose}
              onAddItem={onAddItem}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="cart-modal-overlay" onClick={onClose}>
        <div className="cart-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="header-info">
              <ShoppingCart size={24} />
              <h3>Carrinho Vazio</h3>
            </div>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Seu carrinho está vazio</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-info">
            <ShoppingCart size={24} />
            <h3>Seu Pedido ({totalItems} item{totalItems !== 1 ? 's' : ''})</h3>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-items flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
          {items.map((item) => {
            if (!item || !item.cartId) return null;
            
            return (
              <div key={item.cartId} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                {/* Imagem */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={
                        item.image?.startsWith('/')
                          ? item.image
                          : item.image?.startsWith('http')
                            ? item.image
                            : item.image
                              ? `/api/image?key=${encodeURIComponent(item.image)}`
                              : '/placeholder-food.png'
                    }
                    alt={item.name || 'Produto'}
                    className="w-full h-full object-cover"
                  />
                </div>
              
                {/* Conteúdo */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-gray-900 line-clamp-2 text-sm sm:text-base leading-tight">
                            {item.name}
                        </h4>
                        <div className="font-bold text-red-600 whitespace-nowrap text-sm sm:text-base">
                            {formatPrice(Number(item.price) * item.quantity)}
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                        {item.customization?.flavors?.length ? (
                            <p>🍕 {item.customization.flavors.join(', ')}</p>
                        ) : null}
                        
                        {item.customization?.extras?.length ? (
                            <p>➕ {formatExtras(item.customization.extras).join(', ')}</p>
                        ) : null}
                        
                        {item.customization?.observations ? (
                            <p className="italic">📝 {item.customization.observations}</p>
                        ) : null}
                    </div>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <button 
                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-700 hover:text-red-600 active:scale-95 transition-all disabled:opacity-50"
                            onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button 
                            className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-700 hover:text-red-600 active:scale-95 transition-all"
                            onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    
                    <button 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        onClick={() => handleRemove(item.cartId)}
                        title="Remover item"
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-footer">
          <div className="total-section">
            <span className="total-label">Total:</span>
            <span className="total-price">{formatPrice(totalPrice)}</span>
          </div>
          
          <button 
            className="checkout-button"
            onClick={() => setStep('checkout')}
            disabled={items.length === 0}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
