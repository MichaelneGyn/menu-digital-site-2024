
'use client';

import { ClientRestaurant } from '@/lib/restaurant';
import { MapPin, Clock, Star, Info } from 'lucide-react';

interface RestaurantBannerProps {
  restaurant: ClientRestaurant;
}

export default function RestaurantBanner({ restaurant }: RestaurantBannerProps) {
  // Usar a cor do restaurante ou cinza neutro
  const headerColor = restaurant.headerColor || '#6b7280'; 
  const headerTextColor = restaurant.headerTextColor || '#111827'; // Default to gray-900 if not set
  const primaryColor = restaurant.primaryColor || '#EA1D2C';
  
  // Verificar se tem banner/capa
  const hasBanner = !!(restaurant.bannerImage || restaurant.bannerUrl);
  
  return (
    <div className="relative w-full bg-white mb-8">
      {/* Banner Background Area */}
      <div 
        className="relative w-full h-[200px] md:h-[280px] overflow-hidden"
        style={{
          background: hasBanner 
            ? `url(${restaurant.bannerImage || restaurant.bannerUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${headerColor} 0%, ${adjustColor(headerColor, -40)} 100%)`,
        }}
      >
        {/* Gradient Overlay for better text readability if we had text on top, 
            but here mostly for style */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
      </div>

      {/* Content Container - Overlapping the banner */}
      <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative ${hasBanner ? '-mt-16 md:-mt-20' : 'mt-4'} pb-4`}>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          
          {/* Logo Box with Shadow and Border */}
          <div className="relative shrink-0">
             <div 
               className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center"
               style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.15)' }}
             >
              {(restaurant.logo || restaurant.logoUrl) ? (
                <img 
                  src={restaurant.logo || restaurant.logoUrl || ''} 
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-4xl font-bold text-gray-300">
                  {restaurant.name.charAt(0)}
                </span>
              )}
             </div>
          </div>

          {/* Restaurant Info */}
          <div className={`flex-1 text-center md:text-left pt-2 ${hasBanner ? 'md:pt-28' : 'md:pt-4'} md:pb-4`}>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2 justify-center md:justify-start">
               <h1 
                 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900"
               >
                 {restaurant.name}
               </h1>
               
               {/* Rating Badge */}
               <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg border border-yellow-100 self-center md:self-auto">
                 <Star size={14} fill="currentColor" className="text-yellow-500" />
                 <span className="text-sm font-bold">4.8</span>
                 <span className="text-xs text-yellow-600/70 font-medium">(500+)</span>
               </div>
            </div>
            
            {restaurant.description && (
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto md:mx-0 mb-4 line-clamp-2 font-medium">
                {restaurant.description}
              </p>
            )}

            {/* Meta Info Badges */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {restaurant.openTime && restaurant.closeTime && (
                <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                  <Clock size={16} className="text-gray-500" />
                  <span className={isRestaurantOpenNow(restaurant.openTime, restaurant.closeTime) ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {isRestaurantOpenNow(restaurant.openTime, restaurant.closeTime) ? 'Aberto' : 'Fechado'}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium">{restaurant.openTime} - {restaurant.closeTime}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                <MapPin size={16} className="text-gray-500" />
                <span className="font-medium">{restaurant.deliveryFee === 0 ? 'Entrega Grátis' : `Entrega: R$ ${restaurant.deliveryFee.toFixed(2).replace('.', ',')}`}</span>
                {restaurant.minOrderValue > 0 && (
                   <>
                     <span className="text-gray-400">•</span>
                     <span className="font-medium">Min: R$ {restaurant.minOrderValue.toFixed(2).replace('.', ',')}</span>
                   </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Função auxiliar para ajustar cor (escurecer/clarear)
function adjustColor(color: string, amount: number): string {
  const clamp = (num: number) => Math.min(Math.max(num, 0), 255);
  
  const num = parseInt(color.replace('#', ''), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00FF) + amount);
  const b = clamp((num & 0x0000FF) + amount);
  
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// Função simples para verificar horário (pode ser melhorada com date-fns se necessário)
function isRestaurantOpenNow(open: string, close: string): boolean {
  try {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMinute] = open.split(':').map(Number);
    const [closeHour, closeMinute] = close.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMinute;
    let closeMinutes = closeHour * 60 + closeMinute;
    
    // Se fecha no dia seguinte (ex: abre 18:00 fecha 02:00)
    if (closeMinutes < openMinutes) {
      closeMinutes += 24 * 60;
    }
    
    // Ajuste para madrugadas (se for 01:00 e fechou as 02:00, current é menor que open, mas deve considerar o dia anterior)
    const currentAdjusted = currentMinutes < openMinutes && currentMinutes < (closeHour * 60 + closeMinute) 
      ? currentMinutes + 24 * 60 
      : currentMinutes;

    return currentAdjusted >= openMinutes && currentAdjusted <= closeMinutes;
  } catch (e) {
    return false;
  }
}
