'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, Banknote, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

export type PaymentMethod = 'pix' | 'credit_card' | 'cash_on_delivery';

interface PaymentData {
  method: PaymentMethod;
  cardData?: {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
  };
  cashChange?: number;
}

interface PaymentOptionsProps {
  onPaymentSelect: (paymentData: PaymentData) => void;
  selectedPayment?: PaymentData;
  totalAmount: number;
  onClose?: () => void;
}

export default function PaymentOptions({ onPaymentSelect, selectedPayment, totalAmount, onClose }: PaymentOptionsProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(selectedPayment?.method || 'pix');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [cashChange, setCashChange] = useState<number>(0);
  const [needsChange, setNeedsChange] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const validateCardData = () => {
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      toast.error('Número do cartão inválido');
      return false;
    }
    if (!cardData.name.trim()) {
      toast.error('Nome do portador é obrigatório');
      return false;
    }
    if (!cardData.expiry || cardData.expiry.length < 5) {
      toast.error('Data de validade inválida');
      return false;
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      toast.error('CVV inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    const paymentData: PaymentData = {
      method: paymentMethod
    };

    if (paymentMethod === 'credit_card') {
      if (!validateCardData()) return;
      paymentData.cardData = cardData;
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
        <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
          <CreditCard className="w-5 h-5" />
          Forma de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)} className="space-y-3">
          {/* PIX */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="pix" id="pix" className="mt-2 flex-shrink-0" />
            <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <QrCode className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-base">PIX</div>
                <div className="text-sm text-gray-500">Pagamento instantâneo</div>
              </div>
            </Label>
          </div>

          {/* Cartão de Crédito */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="credit_card" id="credit_card" className="mt-2 flex-shrink-0" />
            <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-base">Cartão de Crédito</div>
                <div className="text-sm text-gray-500">Visa, Mastercard, Elo</div>
              </div>
            </Label>
          </div>

          {/* Dinheiro na Entrega */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" className="mt-2 flex-shrink-0" />
            <Label htmlFor="cash_on_delivery" className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Banknote className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-base">Dinheiro na Entrega</div>
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
            <p className="text-sm text-green-700">
              Após confirmar o pedido, você receberá o código PIX para pagamento instantâneo.
            </p>
          </div>
        )}

        {paymentMethod === 'credit_card' && (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800">Dados do Cartão</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="card-number" className="text-sm font-medium">Número do Cartão</Label>
                <Input
                  id="card-number"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cardData.number}
                  onChange={(e) => handleCardInputChange('number', e.target.value)}
                  maxLength={19}
                  className="h-12 text-base mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="card-name" className="text-sm font-medium">Nome do Portador</Label>
                <Input
                  id="card-name"
                  type="text"
                  placeholder="Nome como está no cartão"
                  value={cardData.name}
                  onChange={(e) => handleCardInputChange('name', e.target.value.toUpperCase())}
                  className="h-12 text-base mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card-expiry" className="text-sm font-medium">Validade</Label>
                  <Input
                    id="card-expiry"
                    type="text"
                    placeholder="MM/AA"
                    value={cardData.expiry}
                    onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                    maxLength={5}
                    className="h-12 text-base mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="card-cvv" className="text-sm font-medium">CVV</Label>
                  <Input
                    id="card-cvv"
                    type="text"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                    maxLength={4}
                    className="h-12 text-base mt-1"
                  />
                </div>
              </div>
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

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 text-base font-medium"
          >
            Voltar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white h-12 text-base font-medium"
          >
            Confirmar Pagamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}