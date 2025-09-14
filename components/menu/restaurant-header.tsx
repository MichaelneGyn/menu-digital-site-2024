
'use client';

import Image from 'next/image';
import { ClientRestaurant } from '@/lib/restaurant';

interface RestaurantHeaderProps {
  restaurant: ClientRestaurant;
}

export default function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <header className="restaurant-header">
      <div className="header-content w-full max-w-7xl mx-auto px-3 py-3 sm:px-8 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="logo flex items-center gap-2 sm:gap-4 cursor-pointer hover:transform hover:scale-105 transition-transform">
            <div className="logo-icon w-8 h-8 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center text-lg sm:text-2xl flex-shrink-0">
              {restaurant?.logo ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={restaurant.logo} 
                    alt={`${restaurant.name} logo`}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                '🍕'
              )}
            </div>
            <div className="logo-text text-left min-w-0 flex-1">
              <h1 className="text-red-600 text-lg sm:text-3xl font-bold truncate">{restaurant?.name}</h1>
              <p className="text-gray-600 text-xs sm:text-sm truncate">{restaurant?.description || 'Tradição e Sabor'}</p>
            </div>
          </div>
          <div className="info-bar flex flex-col gap-1 sm:flex-row sm:gap-6 text-left sm:text-left">
            <div className="info-item flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
              <span className="text-red-600 flex-shrink-0">📍</span>
              <span className="truncate max-w-[250px] sm:max-w-none">{restaurant?.address ? `${restaurant.address}, ${restaurant.city}` : 'Localização não informada'}</span>
            </div>
            <div className="info-item flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
              <span className="text-red-600 flex-shrink-0">⏰</span>
              <span className="whitespace-nowrap">{restaurant?.openTime && restaurant?.closeTime ? `${restaurant.openTime} - ${restaurant.closeTime}` : 'Horário não informado'}</span>
            </div>
            <div className="info-item flex items-center gap-1 text-gray-600 text-xs sm:text-sm">
              <span className="text-red-600 flex-shrink-0">📞</span>
              <span className="whitespace-nowrap">{restaurant?.phone || 'Telefone não informado'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
