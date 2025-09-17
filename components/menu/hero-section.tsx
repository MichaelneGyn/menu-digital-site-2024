
'use client';

import { ClientRestaurant } from '@/lib/restaurant';

interface HeroSectionProps {
  restaurant: ClientRestaurant;
}

export default function HeroSection({ restaurant }: HeroSectionProps) {
  return (
    <div className="container mx-auto px-4 w-full">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 lg:mb-6 relative z-10 text-center leading-tight">
        Bem-vindo à {restaurant?.name}
      </h2>
      <p className="text-base sm:text-lg lg:text-xl xl:text-2xl relative z-10 mb-4 sm:mb-6 lg:mb-8 text-center leading-relaxed max-w-4xl mx-auto">
        {restaurant?.description || 'A melhor experiência gastronômica da cidade'}
      </p>
      <div className="promo-banner text-sm sm:text-base lg:text-lg mx-auto">
        🔥 Confira nossas promoções especiais! 🔥
      </div>
    </div>
  );
}
