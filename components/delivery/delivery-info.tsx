'use client';

import { Clock, Truck, MapPin, DollarSign } from 'lucide-react';
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
    <div className={`w-full max-w-6xl mx-auto px-4 mb-6 ${className}`}>
      {/* Card Principal - Estilo iFood/Uber Eats */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Tempo de Entrega */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Entrega</div>
                <div className="text-base font-semibold text-gray-900">{deliveryTime}</div>
              </div>
            </div>

            {/* Divisor vertical */}
            <div className="h-10 w-px bg-gray-200"></div>

            {/* Taxa de Entrega */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Taxa</div>
                <div className="text-base font-semibold text-gray-900">
                  {deliveryFee === 0 ? (
                    <span className="text-green-600">Grátis</span>
                  ) : (
                    `R$ ${deliveryFee.toFixed(2)}`
                  )}
                </div>
              </div>
            </div>

            {/* Pedido Mínimo */}
            {minOrderValue > 0 && (
              <>
                <div className="h-10 w-px bg-gray-200"></div>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">Mínimo</div>
                    <div className="text-base font-semibold text-gray-900">R$ {minOrderValue.toFixed(2)}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Endereço - Integrado */}
        {address && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{address}</span>
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