
'use client';

import { ClientRestaurant } from '@/lib/restaurant';

interface HeroSectionProps {
  restaurant: ClientRestaurant;
}

export default function HeroSection({ restaurant }: HeroSectionProps) {
  return (
    <div className="w-full bg-red-600 text-white py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
          Bem-vindo à {restaurant?.name}
        </h2>
        <p className="text-lg md:text-xl lg:text-2xl mb-6 opacity-90">
          {restaurant?.description || 'A melhor experiência gastronômica da cidade'}
        </p>
        <div className="bg-yellow-400 text-red-800 px-6 py-3 rounded-full inline-block font-semibold text-lg">
          🔥 Confira nossas promoções especiais! 🔥
        </div>
      </div>
    </div>
  );
}
