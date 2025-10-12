
'use client';

import { useState, useEffect, useRef } from 'react';
import { ClientRestaurant, ClientMenuItem } from '@/lib/restaurant';
import { ProductCustomization } from './product-card';
import RestaurantHeader from './restaurant-header';
import RestaurantNav from './restaurant-nav';
import CategorySection from './category-section';
import CartFloat from './cart-float';
import CartModal from './cart-modal';
import Notification from './notification';
import RestaurantFooter from './restaurant-footer';
import DeliveryInfo from '@/components/delivery/delivery-info';
import BusinessHoursAlert from '@/components/business-hours-alert';
import AdminBypassToggle from '@/components/admin-bypass-toggle';
import { isRestaurantOpen } from '@/lib/business-hours';

interface MenuPageProps {
  restaurant: ClientRestaurant;
}

export interface CartItem extends ClientMenuItem {
  quantity: number;
  customization?: ProductCustomization;
  cartId: string; // Para permitir o mesmo item com customizações diferentes
}

export default function MenuPage({ restaurant }: MenuPageProps) {
  // Debug: verificar dados PIX do restaurante
  console.log('🔍 MenuPage - Restaurant PIX Data:', {
    restaurantName: restaurant.name,
    pixKey: restaurant.pixKey,
    pixQrCode: restaurant.pixQrCode,
    hasPixKey: !!restaurant.pixKey,
    hasPixQrCode: !!restaurant.pixQrCode,
  });

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | undefined>(undefined);
  const categoryRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Set first category as active on load
  useEffect(() => {
    if (restaurant?.categories?.[0]?.id) {
      setActiveCategory(restaurant.categories[0].id);
    }
    // Hide loading after a delay to show animation
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [restaurant?.categories]);

  // Scroll Spy - Detecta qual categoria está visível
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    // Delay para garantir que os refs foram setados
    const timer = setTimeout(() => {
      const observerOptions = {
        root: null,
        rootMargin: '-100px 0px -66% 0px', // Detecta quando seção entra no topo
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5]
      };

      // Armazena as seções visíveis
      const visibleSections = new Map<string, number>();

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          const categoryId = entry.target.getAttribute('data-category-id');
          if (!categoryId) return;

          if (entry.isIntersecting) {
            // Armazena a seção e sua visibilidade
            visibleSections.set(categoryId, entry.intersectionRatio);
          } else {
            // Remove se não está mais visível
            visibleSections.delete(categoryId);
          }
        });

        // Encontra a seção mais visível
        if (visibleSections.size > 0) {
          let maxRatio = 0;
          let mostVisible = '';

          visibleSections.forEach((ratio, id) => {
            if (ratio > maxRatio) {
              maxRatio = ratio;
              mostVisible = id;
            }
          });

          if (mostVisible) {
            console.log('🎯 Categoria ativa:', mostVisible, '(ratio:', maxRatio.toFixed(2), ')');
            setActiveCategory(mostVisible);
          }
        }
      };

      observer = new IntersectionObserver(observerCallback, observerOptions);

      // Observar todas as seções de categoria
      const refs = Object.values(categoryRefs.current).filter(ref => ref !== null);
      console.log('👀 Iniciando observação de', refs.length, 'categorias');
      
      refs.forEach((ref) => {
        if (ref) {
          const catId = ref.getAttribute('data-category-id');
          console.log('  ✓ Observando:', catId);
          observer?.observe(ref);
        }
      });
    }, 300); // Delay para garantir que os refs foram setados

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [restaurant?.categories]);

  // Função para fazer scroll suave ao clicar na categoria
  const handleCategoryChange = (categoryId: string) => {
    console.log('🖱️ Clique na categoria:', categoryId);
    const element = categoryRefs.current[categoryId];
    if (element) {
      const offset = 100; // Offset para compensar o menu sticky
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      console.log('📍 Fazendo scroll para:', offsetPosition);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setActiveCategory(categoryId);
  };

  const handleAddToCart = (item: ClientMenuItem, customization?: ProductCustomization) => {
    // Verificar se está aberto antes de adicionar
    const status = isRestaurantOpen({
      openTime: restaurant.openTime || null,
      closeTime: restaurant.closeTime || null,
      workingDays: restaurant.workingDays || null
    }, adminEmail);

    if (!status.isOpen) {
      setNotificationMessage('⚠️ Não é possível fazer pedidos fora do horário de funcionamento');
      setShowNotification(true);
      return;
    }

    // Se é bypass de admin, mostrar notificação especial
    if (status.isBypass) {
      console.log('🔓 Modo Admin: Bypass de horário ativado');
    }

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
        {/* Status de horário de funcionamento */}
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <BusinessHoursAlert 
            restaurant={{ 
              name: restaurant.name,
              openTime: restaurant.openTime || null,
              closeTime: restaurant.closeTime || null,
              workingDays: restaurant.workingDays || null
            }}
            adminEmail={adminEmail}
          />
          
          {/* Mostrar toggle de admin apenas quando fechado e não há bypass ativo */}
          {!isRestaurantOpen({
            openTime: restaurant.openTime || null,
            closeTime: restaurant.closeTime || null,
            workingDays: restaurant.workingDays || null
          }, adminEmail).isOpen && !adminEmail && (
            <AdminBypassToggle 
              onBypassActivated={(email) => {
                setAdminEmail(email);
                setNotificationMessage('🔓 Modo Admin ativado! Você pode fazer pedidos agora.');
                setShowNotification(true);
              }} 
            />
          )}
        </div>
        
        <DeliveryInfo 
          deliveryTime="40 - 50min"
          deliveryFee={4.00}
          minOrderValue={25.00}
          address="Rua das Flores, 123 - Centro"
        />

        {restaurant?.categories?.map((category) => (
          <section 
            key={category.id}
            ref={(el) => { categoryRefs.current[category.id] = el; }}
            data-category-id={category.id}
            id={`category-${category.id}`}
            style={{ scrollMarginTop: '100px' }}
          >
            <CategorySection
              category={category}
              onAddToCart={handleAddToCart}
            />
          </section>
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
