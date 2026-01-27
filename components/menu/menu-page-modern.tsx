'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import { ClientRestaurant, ClientMenuItem } from '@/lib/restaurant';
import { ProductCustomization } from './product-card';
import { RestaurantHeader } from './modern/restaurant-header';
import { CategoryRail } from './modern/category-rail';
import { ProductCard } from './modern/product-card';
import { BottomNav } from './modern/bottom-nav';
import { FloatingCart } from './modern/floating-cart';
import CartModal from './cart-modal';
import Notification from './notification';
import CallWaiterButton from './call-waiter-button';
import BusinessHoursAlert from '@/components/business-hours-alert';
import AdminBypassToggle from '@/components/admin-bypass-toggle';
import { isRestaurantOpen } from '@/lib/business-hours';

interface MenuPageProps {
  restaurant: ClientRestaurant;
  viewOnly?: boolean;
}

export interface CartItem extends ClientMenuItem {
  quantity: number;
  customization?: ProductCustomization;
  cartId: string;
  price: number;
}

export default function MenuPageModern({ restaurant, viewOnly = false }: MenuPageProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | undefined>(undefined);
  const [tableInfo, setTableInfo] = useState<{ id: string; number: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [emblaRef] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });

  // Check admin
  useEffect(() => {
    const checkIfOwner = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/restaurant');
          if (response.ok) {
            const data = await response.json();
            if (data.id === restaurant.id) {
              setAdminEmail(session.user.email);
            }
          }
        } catch (error) {
          console.error('Erro ao verificar dono:', error);
        }
      } else {
        setAdminEmail(undefined);
      }
    };
    checkIfOwner();
  }, [session, restaurant.id]);

  // Check table
  useEffect(() => {
    if (!searchParams) return;
    const tableId = searchParams.get('table');
    if (viewOnly && tableId) {
      fetch(`/api/tables/${tableId}`)
        .then(res => res.json())
        .then(data => {
          if (data.table) {
            setTableInfo({
              id: data.table.id,
              number: data.table.number
            });
          }
        })
        .catch(err => console.error('Erro ao buscar mesa:', err));
    }
  }, [viewOnly, searchParams]);

  // Init
  useEffect(() => {
    if (restaurant?.categories?.[0]?.id) {
      setActiveCategory(restaurant.categories[0].id);
    }
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [restaurant?.categories]);

  // ScrollSpy Logic (Exact match from home.tsx)
  useEffect(() => {
    const handleScroll = () => {
      if (!restaurant?.categories) return;

      const categorySections = restaurant.categories.map(cat => ({
        id: cat.id,
        element: document.getElementById(`category-${cat.id}`)
      }));

      // Find the first section that is near the top of the viewport
      const currentSection = categorySections.find(section => {
        if (!section.element) return false;
        const rect = section.element.getBoundingClientRect();
        // Check if the section top is near the top of viewport (considering header offset)
        return rect.top >= 0 && rect.top <= 300; 
      });

      if (currentSection) {
        setActiveCategory(currentSection.id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [restaurant?.categories]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const headerOffset = 130; // Adjust for sticky header + rail height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handleAddToCart = (item: ClientMenuItem, customization?: ProductCustomization) => {
    const status = isRestaurantOpen({
      openTime: restaurant.openTime || null,
      closeTime: restaurant.closeTime || null,
      workingDays: restaurant.workingDays || null
    }, adminEmail);

    if (!status.isOpen) {
      setNotificationMessage('⚠️ Fechado no momento');
      setShowNotification(true);
      return;
    }

    const cartId = `${item.id}-${Date.now()}`;
    const price = customization?.totalPrice || Number(item.price);
    
    const newCartItem: CartItem = {
      ...item,
      quantity: 1,
      customization,
      cartId,
      price
    };

    setCartItems(prev => [...prev, newCartItem]);
    setNotificationMessage('Adicionado ao carrinho');
    setShowNotification(true);
  };

  const handleUpdateCartItem = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.cartId !== cartId));
    } else {
      setCartItems(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity } : item));
    }
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleAddItemToCart = (item: ClientMenuItem) => {
    handleAddToCart(item);
  };

  const getTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const filteredCategories = restaurant?.categories?.filter(cat => 
    cat.menuItems?.some(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  if (isLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>;
  }

  // Identificar categorias especiais para o carrossel horizontal
  // Assumindo que a primeira categoria ou categorias com nomes específicos sejam destaques
  const highlightCategory = restaurant?.categories?.find(c => 
    c.name.toLowerCase().includes('destaque') || 
    c.name.toLowerCase().includes('mais pedido') ||
    c.name.toLowerCase().includes('promo')
  ) || restaurant?.categories?.[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Search Bar & Category Rail - Sticky Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
        {/* Search Bar - Full Width */}
        <div className="px-4 py-3">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder={`Buscar em ${restaurant.name}...`}
              className="w-full bg-gray-100 border-0 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category Rail - Integrated */}
        <div className="pb-3">
          <CategoryRail 
            categories={restaurant?.categories?.map(c => ({ id: c.id, name: c.name })) || []}
            activeCategory={activeCategory}
            onSelectCategory={handleCategoryChange}
            primaryColor={restaurant.primaryColor}
            isSticky={false} // Since we are wrapping it in a sticky container
          />
        </div>
      </div>

      <div className="pt-[110px]"> {/* Adjusted padding for header + rail */}
        <RestaurantHeader restaurant={restaurant} />
      </div>

      <main className="space-y-8 py-6">
        <BusinessHoursAlert 
          restaurant={{ 
            name: restaurant.name,
            openTime: restaurant.openTime || null,
            closeTime: restaurant.closeTime || null,
            workingDays: restaurant.workingDays || null
          }}
          adminEmail={adminEmail}
        />
        
        {adminEmail && <AdminBypassToggle onBypassActivated={() => {}} />}

        {/* Highlight Section - Horizontal Scroll */}
        {highlightCategory && (
            <section className="space-y-4" id={`highlight-section`}>
              <div className="px-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">{highlightCategory.name}</h2>
                <button 
                  onClick={() => handleCategoryChange(highlightCategory.id)}
                  className="text-sm font-medium hover:underline" 
                  style={{ color: restaurant.primaryColor }}
                >
                  Ver todos
                </button>
              </div>
              
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex px-4 gap-4 touch-pan-x">
                  {highlightCategory.menuItems?.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex-[0_0_80%] sm:flex-[0_0_45%] md:flex-[0_0_30%] min-w-0">
                      <div className="h-full">
                        <ProductCard 
                            item={item} 
                            onAddToCart={handleAddToCart}
                            primaryColor={restaurant.primaryColor}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
        )}

        {/* Vertical Sections */}
        <div className="space-y-8">
            {filteredCategories
                .map((category) => {
                    const items = category.menuItems?.filter(item => 
                        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (!items?.length) return null;

                    return (
                        <section key={category.id} id={`category-${category.id}`} className="px-4 space-y-4 scroll-mt-32">
                            <h2 className="text-xl font-bold text-foreground capitalize">{category.name}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {items.map((item) => (
                                    <ProductCard 
                                        key={`${category.id}-${item.id}`} 
                                        item={item}
                                        onAddToCart={handleAddToCart}
                                        primaryColor={restaurant.primaryColor}
                                    />
                                ))}
                            </div>
                        </section>
                    );
            })}
        </div>
      </main>

      {!viewOnly && !showCartModal && (
        <FloatingCart 
          totalItems={getTotalItems()}
          totalPrice={getTotalPrice()}
          onOpenCart={() => setShowCartModal(true)}
          primaryColor={restaurant.primaryColor}
        />
      )}

      {!viewOnly && showCartModal && (
        <CartModal
          items={cartItems}
          restaurant={restaurant}
          onClose={() => setShowCartModal(false)}
          onUpdateItem={handleUpdateCartItem}
          onRemoveItem={handleRemoveCartItem}
          onAddItem={handleAddItemToCart}
        />
      )}

      <Notification
        show={showNotification}
        message={notificationMessage}
        onHide={() => setShowNotification(false)}
      />

      {viewOnly && restaurant.enableWaiterCall && tableInfo && (
        <CallWaiterButton
          restaurantId={restaurant.id}
          tableId={tableInfo.id}
          tableNumber={tableInfo.number}
        />
      )}

      {!viewOnly && (
        <BottomNav 
          slug={restaurant.slug || ''} 
          cartItemCount={getTotalItems()}
        />
      )}
    </div>
  );
}
