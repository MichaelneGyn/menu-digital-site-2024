
'use client';

import { ClientCategory, ClientMenuItem } from '@/lib/restaurant';
import { ProductCustomization } from './product-card';
import ProductCard from './product-card';

interface CategorySectionProps {
  category: ClientCategory;
  onAddToCart: (item: ClientMenuItem, customization?: ProductCustomization) => void;
}

export default function CategorySection({ category, onAddToCart }: CategorySectionProps) {
  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-red-600 text-white p-3 rounded-full mr-4">
            <span className="text-2xl">{category?.icon || '🍽️'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-red-800">{category?.name}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {category?.menuItems?.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
