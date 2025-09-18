
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ClientRestaurant, ClientMenuItem } from '@/lib/restaurant';
import { ProductCustomization } from './product-card';
import RestaurantHeader from './restaurant-header';
import RestaurantNav from './restaurant-nav';
import HeroSection from './hero-section';
import CategorySection from './category-section';
import CartFloat from './cart-float';
import CartModal from './cart-modal';
import Notification from './notification';
import RestaurantFooter from './restaurant-footer';
import DeliveryInfo from '@/components/delivery/delivery-info';

interface MenuPageProps {
  restaurant: ClientRestaurant;
}

export interface CartItem extends ClientMenuItem {
  quantity: number;
  customization?: ProductCustomization;
  cartId: string; // Para permitir o mesmo item com customizações diferentes
}

export default function MenuPage({ restaurant }: MenuPageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isScrolling = useRef(false);

  // Set first category as active on load
  useEffect(() => {
    if (restaurant?.categories?.[0]?.id) {
      setActiveCategory(restaurant.categories[0].id);
    }
    // Hide loading after a delay to show animation
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [restaurant?.categories]);

  // Enhanced scroll spy functionality
  const handleScroll = useCallback(() => {
    if (isScrolling.current) return;

    const isMobile = window.innerWidth <= 768;
    const navHeight = isMobile ? 130 : 85;
    const scrollPosition = window.scrollY;
    const viewportHeight = window.innerHeight;
    const viewportCenter = scrollPosition + viewportHeight / 2;
    
    let bestSection = '';
    let bestScore = -1;
    
    // Find the section that is most visible in the viewport
    restaurant?.categories?.forEach((category) => {
      const element = sectionRefs.current[category.id];
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = scrollPosition + rect.top;
        const elementBottom = elementTop + rect.height;
        const elementCenter = elementTop + rect.height / 2;
        
        // Calculate how much of the section is visible
        const viewportTop = scrollPosition + navHeight;
        const viewportBottom = scrollPosition + viewportHeight;
        
        const visibleTop = Math.max(elementTop, viewportTop);
        const visibleBottom = Math.min(elementBottom, viewportBottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const visibilityRatio = visibleHeight / rect.height;
        
        // Calculate distance from viewport center
        const distanceFromCenter = Math.abs(elementCenter - viewportCenter);
        const maxDistance = viewportHeight;
        const centerScore = Math.max(0, 1 - distanceFromCenter / maxDistance);
        
        // Combined score: visibility (70%) + center proximity (30%)
        const score = visibilityRatio * 0.7 + centerScore * 0.3;
        
        // Bonus for sections that start near the top of viewport
        let topBonus = 0;
        if (elementTop <= viewportTop + 100 && elementBottom > viewportTop + 50) {
          topBonus = 0.2;
        }
        
        const finalScore = score + topBonus;
        
        if (finalScore > bestScore && visibilityRatio > 0.1) {
          bestScore = finalScore;
          bestSection = category.id;
        }
      }
    });
    
    // Fallback: if no section is significantly visible, use the closest one
    if (!bestSection) {
      let closestSection = '';
      let minDistance = Infinity;
      
      restaurant?.categories?.forEach((category) => {
        const element = sectionRefs.current[category.id];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = scrollPosition + rect.top;
          const distance = Math.abs(elementTop - (scrollPosition + navHeight));
          
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = category.id;
          }
        }
      });
      
      bestSection = closestSection;
    }

    // Update active category if it changed
    if (bestSection && bestSection !== activeCategory) {
      setActiveCategory(bestSection);
    }
  }, [activeCategory, restaurant?.categories]);

  // Add scroll listener with throttle for better mobile performance
  useEffect(() => {
    let ticking = false;
    
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('touchmove', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('touchmove', throttledScroll);
    };
  }, [handleScroll]);

  // Handle category change with smooth scroll
  const handleCategoryChange = (categoryId: string) => {
    isScrolling.current = true;
    setActiveCategory(categoryId);
    
    const element = sectionRefs.current[categoryId];
    if (element) {
      // Calculate dynamic offset based on screen size
      const isMobile = window.innerWidth <= 768;
      const navHeight = isMobile ? 130 : 85; // Match CSS media query
      const additionalOffset = isMobile ? 20 : 35; // Smaller offset for smooth scroll
      const offsetTop = element.offsetTop - (navHeight + additionalOffset);
      
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      
      // Reset scrolling flag after animation
      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    }
  };

  const handleAddToCart = (item: ClientMenuItem, customization?: ProductCustomization) => {
    const cartId = `${item.id}-${Date.now()}`;
    const price = customization?.totalPrice || Number(item.price);
    
    const newCartItem: CartItem = {
      ...item,
      quantity: 1,
      customization,
      cartId,
      price // Atualiza o preço com customizações
    };

    setCartItems(prevItems => [...prevItems, newCartItem]);

    const itemName = customization?.flavors?.length 
      ? `${item.name} (${customization.flavors.join(', ')})`
      : item.name;

    setNotificationMessage(`${itemName} adicionado ao carrinho`);
    setShowNotification(true);
  };

  const handleUpdateCartItem = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
    } else {
      setCartItems(prevItems => 
        prevItems.map(item =>
          item.cartId === cartId 
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  };

  if (isLoading) {
    return (
      <div className="loader">
        <div className="pizza-loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <RestaurantHeader restaurant={restaurant} />
      <RestaurantNav
        categories={restaurant?.categories || []}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <main className="main-content">
        <HeroSection restaurant={restaurant} />
        
        <DeliveryInfo 
          deliveryTime="40 - 50min"
          deliveryFee={4.00}
          minOrderValue={25.00}
          address="Rua das Flores, 123 - Centro"
        />

        {restaurant?.categories?.map((category) => (
          <div
            key={category.id}
            ref={(el) => {
              sectionRefs.current[category.id] = el;
            }}
            id={`category-${category.id}`}
          >
            <CategorySection
              category={category}
              onAddToCart={handleAddToCart}
            />
          </div>
        ))}
      </main>

      <CartFloat 
        items={cartItems} 
        totalItems={getTotalItems()}
        totalPrice={getTotalPrice()}
        onOpenCart={() => setShowCartModal(true)}
      />

      {showCartModal && (
        <CartModal
          items={cartItems}
          restaurant={restaurant}
          onClose={() => setShowCartModal(false)}
          onUpdateItem={handleUpdateCartItem}
          onRemoveItem={handleRemoveCartItem}
        />
      )}
      
      <Notification
        show={showNotification}
        message={notificationMessage}
        onHide={() => setShowNotification(false)}
      />

      <RestaurantFooter restaurant={restaurant} />
    </div>
  );
}