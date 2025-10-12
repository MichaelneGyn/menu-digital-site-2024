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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Tempo de Entrega */}
        <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Entrega</div>
              <div className="text-2xl font-bold text-emerald-900">{deliveryTime}</div>
              <div className="text-xs text-emerald-600 mt-1">Tempo estimado</div>
            </div>
          </div>
        </div>

        {/* Card Taxa de Entrega */}
        <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Taxa</div>
              <div className="text-2xl font-bold text-blue-900">
                {deliveryFee === 0 ? (
                  <span className="text-green-600">Grátis! 🎉</span>
                ) : (
                  `R$ ${deliveryFee.toFixed(2)}`
                )}
              </div>
              <div className="text-xs text-blue-600 mt-1">Frete de entrega</div>
            </div>
          </div>
        </div>

        {/* Card Pedido Mínimo */}
        {minOrderValue > 0 && (
          <div className="group relative bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-3 right-3 w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">Mínimo</div>
                <div className="text-2xl font-bold text-rose-900">R$ {minOrderValue.toFixed(2)}</div>
                <div className="text-xs text-rose-600 mt-1">Pedido mínimo</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Endereço de Entrega - Banner Premium */}
      {address && (
        <div className="mt-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-4 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-slate-500 rounded-xl flex items-center justify-center shadow-md">
              <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">📍 Área de Entrega</div>
              <div className="text-sm font-medium text-gray-800">{address}</div>
            </div>
          </div>
        </div>
      )}
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