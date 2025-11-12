
'use client';

import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    observations: ''
  });
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  
  // Converter CartItem para o formato esperado pelo CheckoutFlow
  const orderItems = items.map(item => ({
    id: item.id, // ID real do MenuItem no banco
    cartId: item.cartId, // ID único do carrinho
    name: item.name,
    price: Number(item.price),
    quantity: item.quantity,
    customizations: item.customization ? [
      ...(item.customization.flavors || []),
      ...(item.customization.extras?.map(e => e.name) || []),
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

  // Função para tocar som de sucesso
  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99]; // Dó, Mi, Sol
      
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + index * 0.2);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + index * 0.2 + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.2 + 0.5);
        
        oscillator.start(audioContext.currentTime + index * 0.2);
        oscillator.stop(audioContext.currentTime + index * 0.2 + 0.5);
      });
    } catch (error) {
      console.log('Audio context not available');
    }
  };

  const handleQuantityChange = (cartId: string, newQuantity: number) => {
    onUpdateItem(cartId, newQuantity);
  };

  const handleRemove = (cartId: string) => {
    onRemoveItem(cartId);
    toast.success('Item removido do carrinho');
  };

  const generateOrderMessage = () => {
    let message = `🍕 *NOVO PEDIDO - ${restaurant.name}*\n\n`;
    
    message += `👤 *Cliente:* ${customerInfo.name}\n`;
    message += `📱 *Telefone:* ${customerInfo.phone}\n`;
    if (customerInfo.address) {
      message += `📍 *Endereço:* ${customerInfo.address}\n`;
    }
    message += '\n';

    message += `🛒 *ITENS DO PEDIDO:*\n`;
    items.forEach((item, index) => {
      message += `\n${index + 1}. *${item.name}* (${item.quantity}x)\n`;
      
      if (item.customization?.flavors?.length) {
        message += `   🍕 Sabor(es): ${item.customization.flavors.join(', ')}\n`;
      }
      
      if (item.customization?.extras?.length) {
        message += `   ➕ Extras: ${item.customization.extras.map(e => e.name).join(', ')}\n`;
      }
      
      if (item.customization?.observations) {
        message += `   📝 Obs: ${item.customization.observations}\n`;
      }
      
      message += `   💰 ${formatPrice(Number(item.price) * item.quantity)}\n`;
    });

    message += `\n💳 *TOTAL: ${formatPrice(totalPrice)}*\n`;
    
    if (customerInfo.observations) {
      message += `\n📝 *Observações gerais:*\n${customerInfo.observations}\n`;
    }

    message += `\n🕐 Pedido realizado em: ${new Date().toLocaleString('pt-BR')}`;
    
    return encodeURIComponent(message);
  };

  const handleFinishOrder = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error('Preencha nome e telefone para continuar');
      return;
    }

    playSuccessSound();
    
    const orderMessage = generateOrderMessage();
    const whatsappNumber = (restaurant.whatsapp || '5562999999999').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${orderMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    toast.success('🎉 Pedido enviado para o WhatsApp!', {
      duration: 4000,
      style: {
        background: '#10B981',
        color: 'white',
        fontWeight: 'bold',
      },
    });
    
    onClose();
  };

  if (step === 'checkout') {
    return (
      <div className="cart-modal-overlay" onClick={onClose}>
        <div className="checkout-modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Finalizar Pedido</h3>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="checkout-body">
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

        <div className="cart-items">
          {items.map((item) => {
            if (!item || !item.cartId) return null;
            
            return (
              <div key={item.cartId} className="cart-item">
                <div className="item-image">
                  <img 
                    src={
                      item.image?.startsWith('http')
                        ? item.image 
                        : item.image
                          ? `/api/image?key=${encodeURIComponent(item.image)}`
                          : '/placeholder-food.png'
                    }
                    alt={item.name || 'Produto'}
                  />
                </div>
              
                <h4>{item.name}</h4>
                
                {item.customization?.flavors?.length && (
                  <p className="item-customization">
                    🍕 Sabor: {item.customization.flavors.join(', ')}
                  </p>
                )}
                
                {item.customization?.extras?.length && (
                  <p className="item-customization">
                    ➕ Extras: {item.customization.extras.map(e => e.name).join(', ')}
                  </p>
                )}
                
                {item.customization?.observations && (
                  <p className="item-customization">
                    📝 Obs: {item.customization.observations}
                  </p>
                )}

                <div className="item-controls">
                  <div className="quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.cartId, item.quantity - 1)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.cartId, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemove(item.cartId)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="item-price">
                  {formatPrice(Number(item.price) * item.quantity)}
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
