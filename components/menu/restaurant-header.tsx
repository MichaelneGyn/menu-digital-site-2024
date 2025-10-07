
'use client';

import Image from 'next/image';
import { ClientRestaurant } from '@/lib/restaurant';
import { BusinessHoursIndicator } from '@/components/business-hours-alert';

interface RestaurantHeaderProps {
  restaurant: ClientRestaurant;
}

export default function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <header className="restaurant-header">
      <div className="header-content max-w-6xl mx-auto px-8 flex justify-between items-center">
        <div className="logo flex items-center gap-4 cursor-pointer hover:transform hover:scale-105 transition-transform">
          <div className="logo-icon w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-2xl">
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
          <div className="logo-text">
            <h1 className="text-red-600 text-3xl font-bold">{restaurant?.name}</h1>
            <p className="text-gray-600 text-sm">{restaurant?.description || 'Tradição e Sabor'}</p>
          </div>
        </div>
        <div className="info-bar flex gap-6 items-center">
          <BusinessHoursIndicator 
            restaurant={{
              name: restaurant.name,
              openTime: restaurant.openTime || null,
              closeTime: restaurant.closeTime || null,
              workingDays: restaurant.workingDays || null
            }}
          />
          <div className="info-item flex items-center gap-2 text-gray-600">
            <span className="text-red-600">📍</span>
            <span>{restaurant?.address ? `${restaurant.address}, ${restaurant.city}` : 'Localização não informada'}</span>
          </div>
          <div className="info-item flex items-center gap-2 text-gray-600">
            <span className="text-red-600">⏰</span>
            <span>{restaurant?.openTime && restaurant?.closeTime ? `${restaurant.openTime} - ${restaurant.closeTime}` : 'Horário não informado'}</span>
          </div>
          <div className="info-item flex items-center gap-2 text-gray-600">
            <span className="text-red-600">📱</span>
            <span>{restaurant?.whatsapp || 'WhatsApp não informado'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
