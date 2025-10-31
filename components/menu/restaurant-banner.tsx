'use client';

import { ClientRestaurant } from '@/lib/restaurant';
import { MapPin, Clock, Star } from 'lucide-react';

interface RestaurantBannerProps {
  restaurant: ClientRestaurant;
}

export default function RestaurantBanner({ restaurant }: RestaurantBannerProps) {
  // Cores personalizáveis
  const headerColor = (restaurant as any).headerColor || restaurant.primaryColor || '#EA1D2C';
  const headerTextColor = (restaurant as any).headerTextColor || '#FFFFFF';
  
  // Verificar se tem banner/capa
  const hasBanner = restaurant.bannerImage || restaurant.bannerUrl;
  
  return (
    <div 
      className="restaurant-banner"
      style={{
        background: hasBanner 
          ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${restaurant.bannerImage || restaurant.bannerUrl}) center/cover`
          : `linear-gradient(135deg, ${headerColor} 0%, ${adjustColor(headerColor, -20)} 100%)`,
        color: headerTextColor,
      }}
    >
      <div className="banner-content">
        {/* Logo */}
        {(restaurant.logo || restaurant.logoUrl) && (
          <div className="restaurant-logo">
            <img 
              src={restaurant.logo || restaurant.logoUrl || ''} 
              alt={restaurant.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Informações */}
        <div className="restaurant-info">
          <h1 className="restaurant-name">{restaurant.name}</h1>
          
          {restaurant.description && (
            <p className="restaurant-description">{restaurant.description}</p>
          )}

          {/* Badges de Informação */}
          <div className="restaurant-badges">
            {restaurant.address && (
              <div className="badge">
                <MapPin size={14} />
                <span>{restaurant.city || 'Delivery'}</span>
              </div>
            )}
            
            {restaurant.openTime && restaurant.closeTime && (
              <div className="badge">
                <Clock size={14} />
                <span>{restaurant.openTime} - {restaurant.closeTime}</span>
              </div>
            )}
            
            {/* Rating (se tiver) */}
            <div className="badge">
              <Star size={14} fill="currentColor" />
              <span>4.8</span>
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
