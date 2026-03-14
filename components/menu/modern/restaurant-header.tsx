'use client';

import { useMemo, useState } from "react";
import { Star, Clock, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ClientRestaurant } from '@/lib/restaurant';
import { isRestaurantOpen } from '@/lib/business-hours';
import { getContrastTextColor, normalizeHexColor, resolvePreferredImageSource, shiftHexColor, withAlpha } from "@/lib/utils";

interface RestaurantHeaderProps {
  restaurant: ClientRestaurant;
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  const primaryColor = normalizeHexColor(restaurant.primaryColor, '#EA1D2C');
  const headerColor = normalizeHexColor(restaurant.headerColor, primaryColor);
  const headerTextColor = normalizeHexColor(restaurant.headerTextColor, getContrastTextColor(headerColor));

  const [bannerFailed, setBannerFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const bannerSource = resolvePreferredImageSource(restaurant.bannerUrl, restaurant.bannerImage);
  const logoSource = resolvePreferredImageSource(restaurant.logoUrl, restaurant.logo);
  const hasBanner = Boolean(bannerSource) && !bannerFailed;
  const hasLogo = Boolean(logoSource) && !logoFailed;

  const status = isRestaurantOpen({
    openTime: restaurant.openTime || null,
    closeTime: restaurant.closeTime || null,
    workingDays: restaurant.workingDays || null
  });

  const deliveryFeeLabel = useMemo(() => {
    if (restaurant.deliveryFee === 0) {
      return 'Grátis';
    }

    return restaurant.deliveryFee.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }, [restaurant.deliveryFee]);

  const minOrderLabel = useMemo(() => {
    if (restaurant.minOrderValue <= 0) {
      return null;
    }

    return restaurant.minOrderValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }, [restaurant.minOrderValue]);

  return (
    <div className="relative pb-6">
      <div className="h-48 md:h-64 w-full overflow-hidden relative">
        {hasBanner ? (
          <img
            src={bannerSource}
            alt={`Capa de ${restaurant.name}`}
            className="w-full h-full object-cover"
            onError={() => setBannerFailed(true)}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${headerColor} 0%, ${shiftHexColor(headerColor, -32)} 100%)`
            }}
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background: hasBanner
              ? 'linear-gradient(to top, rgba(15,23,42,0.18) 0%, rgba(15,23,42,0.02) 45%, rgba(15,23,42,0.08) 100%)'
              : `linear-gradient(to top, ${withAlpha(headerColor, 0.12)} 0%, ${withAlpha(headerColor, 0.03)} 100%)`
          }}
        />

        {!hasBanner && (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <div>
              <p
                className="text-sm uppercase tracking-[0.28em] font-semibold"
                style={{ color: withAlpha(headerTextColor, 0.78) }}
              >
                Cardápio digital
              </p>
              <p
                className="mt-2 text-2xl md:text-4xl font-bold"
                style={{ color: headerTextColor }}
              >
                {restaurant.name}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 -mt-10 relative z-10">
        <div className="rounded-[28px] border border-slate-100 bg-white/98 shadow-[0_20px_45px_rgba(15,23,42,0.12)] p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="h-24 w-24 rounded-2xl bg-card border-4 border-white shadow-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
              {hasLogo ? (
                <img
                  src={logoSource}
                  alt={`Logo de ${restaurant.name}`}
                  className="w-full h-full object-cover"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <span className="text-3xl font-bold" style={{ color: primaryColor }}>
                  {restaurant.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 break-words leading-tight">
                    {restaurant.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-1">
                    <span className="flex items-center font-medium" style={{ color: '#f59e0b' }}>
                      <Star className="w-4 h-4 fill-current mr-1" />
                      4.8
                    </span>
                    <span>•</span>
                    <span>Lanches</span>
                    {restaurant.address && (
                      <>
                        <span>•</span>
                        <span>{restaurant.address}</span>
                      </>
                    )}
                  </div>
                </div>

                <Badge
                  variant="secondary"
                  className={`${status.isOpen
                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
                    : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100'} shrink-0`}
                >
                  {status.isOpen ? 'Aberto' : 'Fechado'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3 text-xs md:text-sm pt-2">
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium"
                  style={{
                    backgroundColor: withAlpha(primaryColor, 0.12),
                    color: shiftHexColor(primaryColor, -26)
                  }}
                >
                  <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                  40-50 min
                </div>

                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium"
                  style={{
                    backgroundColor: withAlpha(primaryColor, 0.12),
                    color: shiftHexColor(primaryColor, -26)
                  }}
                >
                  <Truck className="w-4 h-4" style={{ color: primaryColor }} />
                  {deliveryFeeLabel}
                </div>

                {minOrderLabel && (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium"
                    style={{
                      backgroundColor: withAlpha(primaryColor, 0.08),
                      color: shiftHexColor(primaryColor, -34)
                    }}
                  >
                    <span className="font-bold">Min:</span>
                    {minOrderLabel}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
