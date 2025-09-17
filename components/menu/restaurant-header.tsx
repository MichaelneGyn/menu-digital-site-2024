
'use client';

import Image from 'next/image';
import { ClientRestaurant } from '@/lib/restaurant';

interface RestaurantHeaderProps {
  restaurant: ClientRestaurant;
}

export default function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <header className="restaurant-header">
      <div className="header-content w-full max-w-7xl mx-auto px-2 py-2 sm:px-4 sm:py-3 lg:px-8 lg:py-4">
        <div className="flex flex-col gap-2 sm:gap-3 lg:flex-row lg:justify-between lg:items-center">
          <div className="logo flex items-center gap-2 sm:gap-3 lg:gap-4 cursor-pointer hover:transform hover:scale-105 transition-transform">
            <div className="logo-icon w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-600 rounded-full flex items-center justify-center text-lg sm:text-xl lg:text-2xl flex-shrink-0">
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
              <h1 className="text-red-600 text-base sm:text-lg lg:text-2xl xl:text-3xl font-bold truncate leading-tight">{restaurant?.name}</h1>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base truncate leading-tight">{restaurant?.description || 'Tradição e Sabor'}</p>
            </div>
          </div>
          <div className="info-bar flex flex-col gap-1 sm:gap-2 lg:flex-row lg:gap-4 xl:gap-6 text-left lg:text-left">
            <div className="info-item flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm lg:text-base">
              <span className="text-red-600 flex-shrink-0 text-sm sm:text-base">📍</span>
              <span className="truncate max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] xl:max-w-none">{restaurant?.address ? `${restaurant.address}, ${restaurant.city}` : 'Localização não informada'}</span>
            </div>
            <div className="info-item flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm lg:text-base">
              <span className="text-red-600 flex-shrink-0 text-sm sm:text-base">⏰</span>
              <span className="whitespace-nowrap">{restaurant?.openTime && restaurant?.closeTime ? `${restaurant.openTime} - ${restaurant.closeTime}` : 'Horário não informado'}</span>
            </div>
            <div className="info-item flex items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm lg:text-base">
              <span className="text-red-600 flex-shrink-0 text-sm sm:text-base">📞</span>
              <span className="whitespace-nowrap">{restaurant?.phone || 'Telefone não informado'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
