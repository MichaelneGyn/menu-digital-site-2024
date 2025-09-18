'use client';

import { Clock, Truck, MapPin } from 'lucide-react';

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
    <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Tempo de Entrega */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-red-800">Entrega</div>
              <div className="text-sm text-red-600 font-semibold">{deliveryTime}</div>
            </div>
          </div>

          {/* Taxa de Entrega */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-red-800">Taxa</div>
              <div className="text-sm text-red-600 font-semibold">
                {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Pedido Mínimo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">R$</span>
            </div>
            <div>
              <div className="text-sm font-medium text-red-800">Mínimo</div>
              <div className="text-sm text-red-600 font-semibold">
                R$ {minOrderValue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        {address && (
          <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-red-200">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-red-800">Endereço</div>
              <div className="text-sm text-red-600">{address}</div>
            </div>
          </div>
        )}
      </div>
    </div>
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