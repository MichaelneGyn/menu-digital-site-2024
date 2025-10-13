'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, MapPin, CreditCard, MessageCircle, Check } from 'lucide-react';
import AddressForm from './address-form';
import PaymentOptions, { PaymentMethod } from './payment-options';
import DeliveryInfo from './delivery-info';
import toast from 'react-hot-toast';
import { ClientRestaurant } from '@/lib/restaurant';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
}

interface Address {
  customerName?: string;
  customerPhone?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface PaymentData {
  method: PaymentMethod;
  cardType?: 'credit' | 'debit';
  cashChange?: number;
}

interface CheckoutFlowProps {
  items: CartItem[];
  restaurant: ClientRestaurant;
  onBack: () => void;
  onClose: () => void;
}

type CheckoutStep = 'cart' | 'address' | 'payment' | 'confirmation';

export default function CheckoutFlow({ 
  items, 
  restaurant, 
  onBack, 
  onClose 
}: CheckoutFlowProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number; type: 'percent' | 'fixed'} | null>(null);
  const [couponError, setCouponError] = useState('');

  // Configurações de entrega (podem vir de uma API)
  const deliveryConfig = {
    deliveryTime: '40-50min',
    deliveryFee: 4.00,
    minOrderValue: 25.00
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Cálculo de desconto
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = subtotal * (appliedCoupon.discount / 100);
    } else {
      discount = appliedCoupon.discount;
    }
  }
  
  const total = subtotal + deliveryConfig.deliveryFee - discount;

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSelect = (paymentData: PaymentData) => {
    setSelectedPayment(paymentData);
    setCurrentStep('confirmation');
  };

  const applyCoupon = async () => {
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          restaurantId: restaurant.id,
          cartTotal: subtotal
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        // Converte o cupom para o formato esperado pelo componente
        const coupon = {
          code: data.coupon.code,
          discount: data.discountAmount,
          type: 'fixed' as const, // Sempre tratamos como desconto fixo já calculado
          description: data.coupon.description || `Desconto de R$ ${data.discountAmount.toFixed(2)}`
        };
        
        setAppliedCoupon(coupon);
        toast.success(`🎫 Cupom "${coupon.code}" aplicado! ${coupon.description}`);
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Cupom inválido ou expirado');
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      setCouponError('Erro ao validar cupom. Tente novamente.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Cupom removido');
  };

  const generateOrderSummary = () => {
    const itemsList = items.map(item => {
      let itemText = `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`;
      if (item.customizations && item.customizations.length > 0) {
        itemText += `\n   Obs: ${item.customizations.join(', ')}`;
      }
      return itemText;
    }).join('\n');

    const addressText = selectedAddress ? 
      `${selectedAddress.street}, ${selectedAddress.number}${selectedAddress.complement ? `, ${selectedAddress.complement}` : ''} - ${selectedAddress.neighborhood}, ${selectedAddress.city}` : 
      'Endereço não informado';

    const paymentText = selectedPayment ? 
      (selectedPayment.method === 'pix' ? 'PIX' :
       selectedPayment.method === 'card_on_delivery' ? 
         `Cartão de ${selectedPayment.cardType === 'credit' ? 'Crédito' : 'Débito'} na Entrega` :
       selectedPayment.method === 'cash_on_delivery' ? 
         (selectedPayment.cashChange ? `Dinheiro (Troco para R$ ${selectedPayment.cashChange.toFixed(2)})` : 'Dinheiro (Sem troco)') :
       'Não informado') : 'Não informado';

    return `🍽️ *NOVO PEDIDO - ${restaurant.name}*\n\n` +
           `📋 *ITENS:*\n${itemsList}\n\n` +
           `📍 *ENDEREÇO DE ENTREGA:*\n${addressText}\n\n` +
           `💳 *FORMA DE PAGAMENTO:*\n${paymentText}\n\n` +
           `💰 *RESUMO:*\n` +
           `Subtotal: R$ ${subtotal.toFixed(2)}\n` +
           `Taxa de entrega: R$ ${deliveryConfig.deliveryFee.toFixed(2)}\n` +
           `*Total: R$ ${total.toFixed(2)}*\n\n` +
           `⏰ Tempo estimado: ${deliveryConfig.deliveryTime}\n\n` +
           `Obrigado pela preferência! 😊`;
  };

  const handleFinishOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      toast.error('Por favor, complete todas as etapas');
      return;
    }

    if (subtotal < deliveryConfig.minOrderValue) {
      toast.error(`Pedido mínimo de R$ ${deliveryConfig.minOrderValue.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Criar pedido completo com itens em uma única requisição
      const addressText = selectedAddress ? 
        `${selectedAddress.street}, ${selectedAddress.number}${selectedAddress.complement ? `, ${selectedAddress.complement}` : ''} - ${selectedAddress.neighborhood}, ${selectedAddress.city} - CEP: ${selectedAddress.zipCode}` : 
        '';

      const paymentMethodText = selectedPayment ? 
        (selectedPayment.method === 'pix' ? 'PIX' :
         selectedPayment.method === 'card_on_delivery' ? 
           `Cartão de ${selectedPayment.cardType === 'credit' ? 'Crédito' : 'Débito'} na Entrega` :
         selectedPayment.method === 'cash_on_delivery' ? 
           (selectedPayment.cashChange ? `Dinheiro (Troco para R$ ${selectedPayment.cashChange.toFixed(2)})` : 'Dinheiro (Sem troco)') :
         'Dinheiro') : 'Dinheiro';

      const orderData = {
        restaurantId: restaurant.id,
        total: total,
        customerName: selectedAddress?.customerName || 'Cliente',
        customerPhone: selectedAddress?.customerPhone || '',
        deliveryAddress: addressText,
        paymentMethod: paymentMethodText,
        notes: items.some(i => i.customizations) ? 'Pedido com observações' : undefined,
        items: items.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          notes: item.customizations?.join(', ') || null,
        })),
      };

      console.log('Enviando pedido:', orderData);

      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Erro da API:', errorData);
        throw new Error(errorData.error || 'Falha ao criar pedido');
      }

      const order = await orderResponse.json();
      console.log('✅ Pedido criado com sucesso:', order);

      // Gerar mensagem para WhatsApp
      const message = generateOrderSummary();
      const encodedMessage = encodeURIComponent(message);
      const phone = restaurant.whatsapp || '5562999999999';
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${phone.replace(/\D/g, '')}&text=${encodedMessage}`;

      toast.success('✅ Pedido ' + order.code + ' criado com sucesso!', {
        duration: 3000,
        style: {
          background: '#10B981',
          color: 'white',
          fontWeight: 'bold',
        },
      });
      
      // Redirecionar para WhatsApp após um breve delay
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        onClose(); // Fechar modal após redirecionar
      }, 1500);

    } catch (error: any) {
      console.error('❌ Erro ao processar pedido:', error);
      toast.error(error.message || 'Erro ao processar pedido. Tente novamente.', {
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepIcon = (step: CheckoutStep) => {
    const isCompleted = 
      (step === 'cart') ||
      (step === 'address' && selectedAddress) ||
      (step === 'payment' && selectedPayment) ||
      (step === 'confirmation' && selectedAddress && selectedPayment);
    
    const isCurrent = currentStep === step;
    
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isCompleted ? 'bg-green-500 text-white' :
        isCurrent ? 'bg-red-600 text-white' :
        'bg-gray-200 text-gray-500'
      }`}>
        {isCompleted ? <Check className="w-4 h-4" /> : 
         (step as CheckoutStep) === 'cart' ? <ShoppingCart className="w-4 h-4" /> :
         (step as CheckoutStep) === 'address' ? <MapPin className="w-4 h-4" /> :
         (step as CheckoutStep) === 'payment' ? <CreditCard className="w-4 h-4" /> :
         <MessageCircle className="w-4 h-4" />}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6 pb-8">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            {(['cart', 'address', 'payment', 'confirmation'] as CheckoutStep[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  {getStepIcon(step)}
                  <span className="text-[10px] sm:text-xs mt-1 capitalize hidden sm:block">
                    {step === 'cart' ? 'Carrinho' :
                     step === 'address' ? 'Endereço' :
                     step === 'payment' ? 'Pagamento' :
                     'Finalizar'}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-6 sm:w-16 h-0.5 mx-1 sm:mx-4 ${
                    (step === 'cart') ||
                    (step === 'address' && selectedAddress) ||
                    (step === 'payment' && selectedPayment)
                      ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delivery Info Banner */}
      <DeliveryInfo
        deliveryTime={deliveryConfig.deliveryTime}
        deliveryFee={deliveryConfig.deliveryFee}
        minOrderValue={deliveryConfig.minOrderValue}
        address={selectedAddress ? 
          `${selectedAddress.street}, ${selectedAddress.number} - ${selectedAddress.neighborhood}` : 
          undefined
        }
      />

      {/* Step Content */}
      {currentStep === 'cart' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <ShoppingCart className="w-5 h-5 text-red-600" />
              Seu Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start p-3 border rounded-lg gap-2">
                <div className="flex-1">
                  <div className="font-medium text-sm sm:text-base">{item.name}</div>
                  {item.customizations && item.customizations.length > 0 && (
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      {item.customizations.join(', ')}
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-gray-500">Quantidade: {item.quantity}</div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="font-medium text-sm sm:text-base">R$ {(item.price * item.quantity).toFixed(2)}</div>
                  <div className="text-xs sm:text-sm text-gray-500">R$ {item.price.toFixed(2)} cada</div>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span>Taxa de entrega:</span>
                <span>R$ {deliveryConfig.deliveryFee.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm sm:text-base text-green-600">
                  <span className="flex items-center gap-2">
                    Desconto ({appliedCoupon.code})
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-600 underline hover:text-red-700"
                    >
                      remover
                    </button>
                  </span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base sm:text-lg">
                <span>Total:</span>
                <span className="text-red-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Cupom de desconto */}
            {!appliedCoupon && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Cupom de desconto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite o cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <Button
                    onClick={applyCoupon}
                    disabled={!couponCode.trim()}
                    variant="outline"
                    className="px-4"
                  >
                    Aplicar
                  </Button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-600">{couponError}</p>
                )}
              </div>
            )}

            {subtotal < deliveryConfig.minOrderValue && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Pedido mínimo: R$ {deliveryConfig.minOrderValue.toFixed(2)}. 
                  Adicione mais R$ {(deliveryConfig.minOrderValue - subtotal).toFixed(2)} para continuar.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 h-12 text-base font-semibold"
              >
                Voltar ao Cardápio
              </Button>
              <Button
                onClick={() => setCurrentStep('address')}
                disabled={subtotal < deliveryConfig.minOrderValue}
                className="flex-1 bg-red-600 hover:bg-red-700 h-12 text-base font-semibold"
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'address' && (
        <div className="space-y-4">
          <AddressForm
            onAddressSelect={handleAddressSelect}
            selectedAddress={selectedAddress || undefined}
          />
          <Button
            variant="outline"
            onClick={() => setCurrentStep('cart')}
            className="w-full h-12 text-base font-semibold"
          >
            ← Voltar ao Carrinho
          </Button>
        </div>
      )}

      {currentStep === 'payment' && (
        <div className="space-y-4">
          <PaymentOptions
            onPaymentSelect={handlePaymentSelect}
            selectedPayment={selectedPayment || undefined}
            totalAmount={total}
            restaurant={restaurant}
          />
          <Button
            variant="outline"
            onClick={() => setCurrentStep('address')}
            className="w-full h-12 text-base font-semibold"
          >
            ← Voltar ao Endereço
          </Button>
        </div>
      )}

      {currentStep === 'confirmation' && (
        <Card className="flex flex-col" style={{ maxHeight: 'calc(95vh - 250px)' }}>
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              Confirmar Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(95vh - 400px)' }}>
            {/* Resumo do Pedido */}
            <div>
              <h4 className="font-medium mb-2">Itens do Pedido:</h4>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Endereço */}
            <div>
              <h4 className="font-medium mb-2">Endereço de Entrega:</h4>
              <p className="text-sm text-gray-600">
                {selectedAddress?.street}, {selectedAddress?.number}
                {selectedAddress?.complement && `, ${selectedAddress.complement}`}
                <br />
                {selectedAddress?.neighborhood} - {selectedAddress?.city}
                {selectedAddress?.zipCode && ` - ${selectedAddress.zipCode}`}
              </p>
            </div>

            <Separator />

            {/* Pagamento */}
            <div>
              <h4 className="font-medium mb-2">Forma de Pagamento:</h4>
              <p className="text-sm text-gray-600">
                {selectedPayment?.method === 'pix' && 'PIX - Pagamento instantâneo'}
                {selectedPayment?.method === 'card_on_delivery' && (
                  `Cartão de ${selectedPayment.cardType === 'credit' ? 'Crédito' : 'Débito'} na Entrega`
                )}
                {selectedPayment?.method === 'cash_on_delivery' && (
                  selectedPayment.cashChange ? 
                    `Dinheiro na entrega - Troco para R$ ${selectedPayment.cashChange.toFixed(2)}` :
                    'Dinheiro na entrega - Sem troco'
                )}
              </p>
            </div>

            <Separator />

            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de entrega:</span>
                <span>R$ {deliveryConfig.deliveryFee.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto ({appliedCoupon.code}):</span>
                  <span>- R$ {discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-800">Próximo Passo</span>
              </div>
              <p className="text-sm text-green-700">
                Após confirmar, você será redirecionado para o WhatsApp para finalizar seu pedido 
                e acompanhar a entrega diretamente com o restaurante.
              </p>
            </div>
          </CardContent>
          
          {/* Footer fixo com botões */}
          <div className="flex-shrink-0 border-t bg-white p-4 sticky bottom-0 z-10 shadow-lg rounded-b-lg">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('payment')}
                className="flex-1 h-12 text-base font-semibold"
              >
                Voltar
              </Button>
              <Button
                onClick={handleFinishOrder}
                disabled={isProcessing}
                className="flex-1 h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? 'Processando...' : '✅ Finalizar Pedido'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}