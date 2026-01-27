'use client';

import { Star, MapPin, Clock, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClientRestaurant } from '@/lib/restaurant';
import { isRestaurantOpen } from '@/lib/business-hours';

interface RestaurantHeaderProps {
  restaurant: ClientRestaurant;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const hasBanner = !!(restaurant.bannerImage || restaurant.bannerUrl);
  const bannerUrl = restaurant.bannerImage || restaurant.bannerUrl || "/placeholder-banner.png";
  const logoUrl = restaurant.logo || restaurant.logoUrl || "/placeholder-logo.png";
  
  const status = isRestaurantOpen({
    openTime: restaurant.openTime || null,
    closeTime: restaurant.closeTime || null,
    workingDays: restaurant.workingDays || null
  });

  return (
    <div className="relative pb-6">
      {/* Hero Banner */}
      <div className="h-48 md:h-64 w-full overflow-hidden relative">
        <img 
          src={bannerUrl} 
          alt="Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
      </div>

      {/* Restaurant Info */}
      <div className="px-4 -mt-12 relative z-10 flex flex-col md:flex-row md:items-end gap-4">
        <div className="h-24 w-24 rounded-2xl bg-card border-4 border-background shadow-xl overflow-hidden flex-shrink-0">
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{restaurant.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="flex items-center text-amber-500 font-medium">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  4.8
                </span>
                <span>•</span>
                <span>Lanches</span>
                {restaurant.address && (
                   <>
                    <span>•</span>
                    <span className="flex items-center">
                        {restaurant.address || 'Local'}
                    </span>
                   </>
                )}
              </div>
            </div>
            <Badge variant="secondary" className={`
              ${status.isOpen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}
              hover:bg-opacity-80
            `}>
              {status.isOpen ? 'Aberto' : 'Fechado'}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3 text-xs md:text-sm pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-secondary-foreground font-medium">
              <Clock className="w-4 h-4 text-primary" />
              40-50 min
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 text-secondary-foreground font-medium">
              <Truck className="w-4 h-4 text-primary" />
              {restaurant.deliveryFee === 0 ? 'Grátis' : `R$ ${restaurant.deliveryFee.toFixed(2)}`}
            </div>
            {restaurant.minOrderValue > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-medium">
                <span className="font-bold">Min:</span>
                R$ {restaurant.minOrderValue.toFixed(2)}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
