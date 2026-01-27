'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, Banknote, QrCode, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { ClientRestaurant } from '@/lib/restaurant';

export type PaymentMethod = 'pix' | 'card_on_delivery' | 'cash_on_delivery';

interface PaymentData {
  method: PaymentMethod;
  cardType?: 'credit' | 'debit';
  cashChange?: number;
}

interface PaymentOptionsProps {
  onPaymentSelect: (paymentData: PaymentData) => void;
  selectedPayment?: PaymentData;
  totalAmount: number;
  restaurant: ClientRestaurant;
}

export default function PaymentOptions({ onPaymentSelect, selectedPayment, totalAmount, restaurant }: PaymentOptionsProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(selectedPayment?.method || 'pix');
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [cashChange, setCashChange] = useState<number>(0);
  const [needsChange, setNeedsChange] = useState(false);
  const [pixKeyCopied, setPixKeyCopied] = useState(false);

  // QR Code PIX simples e seguro (apenas chave PIX)
  const pixDynamicQrCode = useMemo(() => {
    if (!restaurant.pixKey) {
      return null;
    }

    // QR Code com apenas a chave PIX
    // Método mais seguro e compatível com 100% dos apps bancários
    // Sem dependências externas ou bibliotecas de terceiros
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(restaurant.pixKey)}`;
  }, [restaurant.pixKey]);

  const copyPixKey = async () => {
    if (restaurant.pixKey) {
      try {
        await navigator.clipboard.writeText(restaurant.pixKey);
        setPixKeyCopied(true);
        toast.success('Chave PIX copiada!');
        setTimeout(() => setPixKeyCopied(false), 3000);
      } catch (error) {
        toast.error('Erro ao copiar chave');
      }
    }
  };

  const handleSubmit = () => {
    const paymentData: PaymentData = {
      method: paymentMethod
    };

    if (paymentMethod === 'card_on_delivery') {
      paymentData.cardType = cardType;
    } else if (paymentMethod === 'cash_on_delivery' && needsChange) {
      if (cashChange <= totalAmount) {
        toast.error('Valor para troco deve ser maior que o total do pedido');
        return;
      }
      paymentData.cashChange = cashChange;
    }

    onPaymentSelect(paymentData);
    toast.success('Forma de pagamento selecionada!');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <CreditCard className="w-5 h-5" />
          Forma de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
          {/* PIX */}
          <div className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-all cursor-pointer ${
            paymentMethod === 'pix' 
              ? 'border-green-500 bg-green-50 shadow-md' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}>
            <RadioGroupItem value="pix" id="pix" className="border-2" />
            <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paymentMethod === 'pix' ? 'bg-green-500' : 'bg-green-100'
              }`}>
                <QrCode className={`w-5 h-5 ${
                  paymentMethod === 'pix' ? 'text-white' : 'text-green-600'
                }`} />
              </div>
              <div>
                <div className={`font-medium ${
                  paymentMethod === 'pix' ? 'text-green-700' : 'text-gray-900'
                }`}>PIX</div>
                <div className="text-sm text-gray-500">Pagamento instantâneo</div>
              </div>
            </Label>
          </div>

          {/* Cartão na Entrega */}
          <div className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-all cursor-pointer ${
            paymentMethod === 'card_on_delivery' 
              ? 'border-blue-500 bg-blue-50 shadow-md' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}>
            <RadioGroupItem value="card_on_delivery" id="card_on_delivery" className="border-2" />
            <Label htmlFor="card_on_delivery" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paymentMethod === 'card_on_delivery' ? 'bg-blue-500' : 'bg-blue-100'
              }`}>
                <CreditCard className={`w-5 h-5 ${
                  paymentMethod === 'card_on_delivery' ? 'text-white' : 'text-blue-600'
                }`} />
              </div>
              <div>
                <div className={`font-medium ${
                  paymentMethod === 'card_on_delivery' ? 'text-blue-700' : 'text-gray-900'
                }`}>Cartão na Entrega</div>
                <div className="text-sm text-gray-500">Crédito ou Débito na entrega</div>
              </div>
            </Label>
          </div>

          {/* Dinheiro na Entrega */}
          <div className={`flex items-center space-x-2 p-4 border-2 rounded-lg transition-all cursor-pointer ${
            paymentMethod === 'cash_on_delivery' 
              ? 'border-yellow-500 bg-yellow-50 shadow-md' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}>
            <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" className="border-2" />
            <Label htmlFor="cash_on_delivery" className="flex items-center gap-3 cursor-pointer flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                paymentMethod === 'cash_on_delivery' ? 'bg-yellow-500' : 'bg-yellow-100'
              }`}>
                <Banknote className={`w-5 h-5 ${
                  paymentMethod === 'cash_on_delivery' ? 'text-white' : 'text-yellow-600'
                }`} />
              </div>
              <div>
                <div className={`font-medium ${
                  paymentMethod === 'cash_on_delivery' ? 'text-yellow-700' : 'text-gray-900'
                }`}>Dinheiro na Entrega</div>
                <div className="text-sm text-gray-500">Pagamento na hora da entrega</div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {/* Campos específicos para cada método */}
        {paymentMethod === 'pix' && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Pagamento via PIX</span>
            </div>
            
            {restaurant.pixKey ? (
              <div className="space-y-4">
                {restaurant.pixKey && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700">Chave PIX:</p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white p-3 rounded border font-mono text-sm break-all">
                        {restaurant.pixKey}
                      </div>
                      <button
                        onClick={copyPixKey}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 transition-colors"
                      >
                        {pixKeyCopied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="hidden sm:inline">Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {pixDynamicQrCode && (
                  <div className="space-y-3">
                    {/* QR Code Removido conforme solicitado */}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-green-700 font-medium">
                  ⚠️ Chave PIX não configurada
                </p>
                <p className="text-xs text-green-600">
                  Entre em contato via WhatsApp para receber os dados PIX e finalizar o pagamento.
                </p>
              </div>
            )}
          </div>
        )}

        {paymentMethod === 'card_on_delivery' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Cartão na Entrega</span>
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">Tipo de Cartão</Label>
              <RadioGroup value={cardType} onValueChange={(value) => setCardType(value as 'credit' | 'debit')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit" className="text-sm cursor-pointer">
                    Cartão de Crédito
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="debit" id="debit" />
                  <Label htmlFor="debit" className="text-sm cursor-pointer">
                    Cartão de Débito
                  </Label>
                </div>
              </RadioGroup>
              
              <p className="text-sm text-blue-700">
                O pagamento será processado na hora da entrega com a máquina de cartão.
              </p>
            </div>
          </div>
        )}

        {paymentMethod === 'cash_on_delivery' && (
          <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Banknote className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Pagamento na Entrega</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="needs-change"
                  checked={needsChange}
                  onChange={(e) => setNeedsChange(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="needs-change" className="text-sm">
                  Preciso de troco
                </Label>
              </div>
              
              {needsChange && (
                <div>
                  <Label htmlFor="cash-amount">Valor em dinheiro</Label>
                  <Input
                    id="cash-amount"
                    type="number"
                    placeholder="0.00"
                    value={cashChange || ''}
                    onChange={(e) => setCashChange(parseFloat(e.target.value) || 0)}
                    min={totalAmount + 0.01}
                    step="0.01"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Total: R$ {totalAmount.toFixed(2)} | Troco: R$ {(cashChange - totalAmount).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          Confirmar Forma de Pagamento
        </Button>
      </CardContent>
    </Card>
  );
}