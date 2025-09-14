
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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
  const { setTheme } = useTheme();
  const { data: session } = useSession();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isScrolling = useRef(false);

  // Apply restaurant theme
  useEffect(() => {
    if (restaurant?.theme) {
      setTheme(restaurant.theme);
    }
  }, [restaurant?.theme, setTheme]);

  // Check if user is admin (restaurant owner)
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/restaurant');
          if (response.ok) {
            const userRestaurant = await response.json();
            // User is admin if they own a restaurant and it matches current restaurant
            setIsAdmin(userRestaurant && userRestaurant.id === restaurant.id);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [session, restaurant.id]);

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
    const viewportTop = scrollPosition + navHeight;
    const viewportCenter = viewportTop + (viewportHeight - navHeight) / 2;
    
    let bestSection = '';
    let maxVisibleArea = 0;
    
    console.log('Scroll Debug:', {
      scrollPosition,
      viewportTop,
      viewportCenter,
      navHeight,
      activeCategory,
      sectionsCount: Object.keys(sectionRefs.current).length
    });
    
    // Find the section with the largest visible area
    restaurant?.categories?.forEach((category) => {
      const element = sectionRefs.current[category.id];
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = scrollPosition + rect.top;
        const elementBottom = elementTop + rect.height;
        
        // Calculate visible area
        const visibleTop = Math.max(elementTop, viewportTop);
        const visibleBottom = Math.min(elementBottom, scrollPosition + viewportHeight);
        const visibleArea = Math.max(0, visibleBottom - visibleTop);
        
        // Check if section center is in viewport
        const sectionCenter = elementTop + rect.height / 2;
        const isInViewport = visibleArea > 0;
        
        console.log(`Section ${category.name}:`, {
          elementTop: elementTop.toFixed(0),
          elementBottom: elementBottom.toFixed(0),
          sectionCenter: sectionCenter.toFixed(0),
          visibleArea: visibleArea.toFixed(0),
          isInViewport,
          rect: { top: rect.top.toFixed(0), height: rect.height.toFixed(0) }
        });
        
        // Select the section with the largest visible area
        // If tied, prefer the one whose center is closer to viewport center
        if (isInViewport && visibleArea > maxVisibleArea) {
          maxVisibleArea = visibleArea;
          bestSection = category.id;
        } else if (isInViewport && visibleArea === maxVisibleArea && bestSection) {
          // Tie-breaker: choose section whose center is closer to viewport center
          const currentSectionElement = sectionRefs.current[bestSection];
          if (currentSectionElement) {
            const currentRect = currentSectionElement.getBoundingClientRect();
            const currentCenter = scrollPosition + currentRect.top + currentRect.height / 2;
            const currentDistance = Math.abs(currentCenter - viewportCenter);
            const newDistance = Math.abs(sectionCenter - viewportCenter);
            
            if (newDistance < currentDistance) {
              bestSection = category.id;
            }
          }
        }
      }
    });

    console.log('Best section found:', bestSection, 'with visible area:', maxVisibleArea.toFixed(0));

    // Update active category if it changed
    if (bestSection && bestSection !== activeCategory) {
      console.log('Updating active category from', activeCategory, 'to', bestSection);
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
      
      {/* Admin Dashboard Button */}
      {isAdmin && (
        <Link href="/admin/dashboard">
          <div className="fixed bottom-20 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
              />
            </svg>
          </div>
        </Link>
      )}
    </div>
  );
}
