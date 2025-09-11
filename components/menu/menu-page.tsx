
'use client';

import { useState, useEffect } from 'react';
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

  // Set first category as active on load
  useEffect(() => {
    if (restaurant?.categories?.[0]?.id) {
      setActiveCategory(restaurant.categories[0].id);
    }
    // Hide loading after a delay to show animation
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [restaurant?.categories]);

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

  const activeCategories = restaurant?.categories?.filter(cat => 
    activeCategory ? cat.id === activeCategory : true
  ) || [];

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
        onCategoryChange={setActiveCategory}
      />

      <main className="main-content">
        <HeroSection restaurant={restaurant} />
        
        <DeliveryInfo 
          deliveryTime="40 - 50min"
          deliveryFee={4.00}
          minOrderValue={25.00}
          address="Rua das Flores, 123 - Centro"
        />

        {activeCategories?.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onAddToCart={handleAddToCart}
          />
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
