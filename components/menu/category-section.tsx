
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
    <div className="category-section">
      <div className="category-header">
        <div className="category-icon">
          {category?.icon || '🍽️'}
        </div>
        <h2 className="category-title">{category?.name}</h2>
      </div>
      
      <div className="products-grid">
        {category?.menuItems?.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </div>
  );
}
