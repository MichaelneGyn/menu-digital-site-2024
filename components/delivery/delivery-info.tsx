'use client';

import { Clock, Truck, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DeliveryInfoProps {
  deliveryTime: string;
  deliveryFee: number;
  minOrderValue?: number;
  address?: string;
  className?: string;
}

export default function DeliveryInfo({ 
  deliveryTime, 
  deliveryFee, 
  minOrderValue = 0, 
  address,
  className = '' 
}: DeliveryInfoProps) {
  return (
    <Card className={`bg-red-50 border-red-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between space-x-4">
          {/* Tempo de Entrega */}
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-red-800">Entrega</div>
              <div className="text-xs text-red-600">{deliveryTime}</div>
            </div>
          </div>

          {/* Taxa de Entrega */}
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Truck className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-red-800">Taxa</div>
              <div className="text-xs text-red-600">
                {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Pedido Mínimo */}
          {minOrderValue > 0 && (
            <div className="flex items-center space-x-2 flex-1">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-red-600">R$</span>
              </div>
              <div>
                <div className="text-sm font-medium text-red-800">Mínimo</div>
                <div className="text-xs text-red-600">R$ {minOrderValue.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Endereço de Entrega */}
        {address && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-700 truncate">{address}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente compacto para usar no header/navbar
export function DeliveryInfoCompact({ deliveryTime, deliveryFee }: { deliveryTime: string; deliveryFee: number }) {
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-1">
        <Clock className="w-4 h-4 text-red-600" />
        <span className="text-gray-700">{deliveryTime}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Truck className="w-4 h-4 text-red-600" />
        <span className="text-gray-700">
          {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}

// Componente para usar como banner fixo
export function DeliveryBanner({ deliveryTime, deliveryFee, minOrderValue }: {
  deliveryTime: string;
  deliveryFee: number;
  minOrderValue?: number;
}) {
  return (
    <div className="bg-red-600 text-white py-2 px-4">
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>Entrega em {deliveryTime}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Truck className="w-4 h-4" />
          <span>
            Taxa: {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}
          </span>
        </div>
        {minOrderValue && minOrderValue > 0 && (
          <div className="flex items-center space-x-1">
            <span>Pedido mínimo: R$ {minOrderValue.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}