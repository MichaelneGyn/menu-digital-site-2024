
'use client';

import { ClientRestaurant } from '@/lib/restaurant';

interface HeroSectionProps {
  restaurant: ClientRestaurant;
}

export default function HeroSection({ restaurant }: HeroSectionProps) {
  return (
    <div className="hero-section">
      <h2 className="text-4xl font-bold mb-4 relative z-10">
        Bem-vindo à {restaurant?.name}
      </h2>
      <p className="text-xl relative z-10 mb-6">
        {restaurant?.description || 'A melhor experiência gastronômica da cidade'}
      </p>
      <div className="promo-banner">
        🔥 Confira nossas promoções especiais! 🔥
      </div>
    </div>
  );
}