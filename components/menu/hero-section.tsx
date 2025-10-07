
'use client';

import { ClientRestaurant } from '@/lib/restaurant';

interface HeroSectionProps {
  restaurant: ClientRestaurant;
}

export default function HeroSection({ restaurant }: HeroSectionProps) {
  const handleScrollToPromos = () => {
    const promosSection = document.querySelector('[data-category="Promoções"]');
    if (promosSection) {
      promosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="hero-section">
      <h2>
        {restaurant?.name}
      </h2>
      <p>
        {restaurant?.description || 'Faça seu pedido online'}
      </p>
      <button className="promo-banner" onClick={handleScrollToPromos}>
        🔥 Ver Promoções
      </button>
    </div>
  );
}
