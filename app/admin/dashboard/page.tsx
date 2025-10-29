

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { onlyDigits, isValidWhatsapp, formatBRMask } from '@/lib/phone';
import { toast } from 'sonner';
import { withSubscriptionCheck } from '@/components/withSubscriptionCheck';
import { EmojiIcon } from '@/components/EmojiIcon';
import { PriceInput } from '@/components/PriceInput';
import { CouponsModal } from '@/components/CouponsModal';
import AddItemWithCustomizationsModal from '@/components/admin/AddItemWithCustomizationsModal';

interface Restaurant {
  id: string;
  name: string;
  whatsapp?: string | null;
  address?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  workingDays?: string | null;
  slug?: string;
  pixKey?: string | null;
  categories?: Category[];
  menuItems?: MenuItem[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  menuItems?: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  isPromo?: boolean;
  originalPrice?: number;
  promoTag?: string | null;
  category: Category;
}

function AdminDashboard() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    promoItems: 0
  });
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [showCreateRestaurantModal, setShowCreateRestaurantModal] = useState(false);
  const [showEditRestaurantModal, setShowEditRestaurantModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Regra de visibilidade para cards adicionais
  const ADMIN_EMAIL = 'michaeldouglasqueiroz@gmail.com';
  const isAdminEmail = (email?: string) => email === ADMIN_EMAIL;
  const isAdmin = isAdminEmail(session?.user?.email ?? undefined);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      setIsLoading(false);
      router.replace('/auth/login');
      return;
    }

    fetchRestaurantData();
  }, [session, status, router]);

  const fetchRestaurantData = async () => {
    try {
      const response = await fetch('/api/restaurant');
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados do restaurante');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Restaurant) => {
    const totalItems = data.menuItems?.length || 0;
    const totalCategories = data.categories?.length || 0;
    const promoItems = data.menuItems?.filter(item => item.isPromo).length || 0;

    console.log('📊 Calculando estatísticas:');
    console.log('  Total de itens:', totalItems);
    console.log('  Itens completos:', data.menuItems);
    console.log('  Itens com isPromo=true:', data.menuItems?.filter(item => item.isPromo));
    console.log('  Total de promoções:', promoItems);

    setStats({
      totalItems,
      totalCategories,
      promoItems
    });
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja remover este item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items?id=${itemId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('🗑️ Item removido com sucesso!');
        fetchRestaurantData(); // Recarregar dados
      } else {
        toast.error('Erro ao remover item');
      }
    } catch (error) {
      toast.error('Erro ao remover item');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Você não está logado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-center">
              <p className="text-gray-600">Faça login para acessar o painel.</p>
              <Link href="/auth/login">
                <Button className="animated-button">Ir para Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Painel Administrativo
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Bem-vindo, {session.user?.name || session.user?.email}!
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              {restaurant && (
                <Link href={`/${restaurant.slug}`}>
                  <Button variant="outline" className="animated-button text-sm sm:text-base">
                    <span className="mr-2">👁️</span>
                    Ver Cardápio
                  </Button>
                </Link>
              )}
              <Link href="/auth/logout">
                <Button variant="destructive" className="animated-button text-sm sm:text-base">
                  Sair
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
              <span className="text-xl sm:text-2xl">🍕</span>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">
                Itens no cardápio
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <span className="text-xl sm:text-2xl">📁</span>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                Categorias ativas
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm font-medium">Promoções</CardTitle>
              <span className="text-xl sm:text-2xl">🎉</span>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.promoItems}</div>
              <p className="text-xs text-muted-foreground">
                Itens em promoção
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ações Rápidas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Grade original de Ações Rápidas: manter exatamente os cards e funcionalidades */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Adicionar Item */}
                  <button
                    onClick={() => setShowAddItemModal(true)}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-white"
                  >
                    <span className="text-xl sm:text-2xl">➕</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Adicionar Item</span>
                  </button>

                  {/* Nova Categoria */}
                  <button
                    onClick={() => setShowAddCategoryModal(true)}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-white"
                  >
                    <span className="text-xl sm:text-2xl">📁</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Nova Categoria</span>
                  </button>

                  {/* Cupons de Desconto */}
                  <button
                    onClick={() => setShowCouponsModal(true)}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                  >
                    <span className="text-xl sm:text-2xl">🎫</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Cupons</span>
                    <span className="text-xs text-orange-600 font-semibold">NOVO</span>
                  </button>

                  {/* Adicionar Itens em Massa */}
                  <button
                    onClick={() => router.push('/admin/import-menu')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
                  >
                    <span className="text-xl sm:text-2xl">📤</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Adicionar Itens em Massa</span>
                    <span className="text-xs text-purple-600 font-semibold">NOVO</span>
                  </button>

                  {/* Configurações */}
                  <button
                    onClick={() => router.push('/admin/settings')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
                  >
                    <span className="text-xl sm:text-2xl">⚙️</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Configurações</span>
                    <span className="text-xs text-blue-600 font-semibold">NOVO</span>
                  </button>


                  {/* Calculadora CMV */}
                  <button
                    onClick={() => router.push('/admin/cmv')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-gradient-to-br from-green-50 to-blue-50 border-green-200"
                  >
                    <span className="text-xl sm:text-2xl">🧮</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Calculadora CMV</span>
                    <span className="text-xs text-green-600 font-semibold">NOVO</span>
                  </button>

                  {/* Upsell */}
                  <button
                    onClick={() => router.push('/admin/upsell')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                  >
                    <span className="text-xl sm:text-2xl">🎯</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Upsell</span>
                    <span className="text-xs text-yellow-600 font-semibold">NOVO</span>
                  </button>

                  {/* Tutoriais */}
                  <button
                    onClick={() => router.push('/admin/tutoriais')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-gradient-to-br from-red-50 to-pink-50 border-red-200"
                  >
                    <span className="text-xl sm:text-2xl">🎬</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Tutoriais</span>
                    <span className="text-xs text-red-600 font-semibold">NOVO</span>
                  </button>

                  {/* Relatórios */}
                  <button
                    onClick={() => setShowReportsModal(true)}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-white"
                  >
                    <span className="text-xl sm:text-2xl">📊</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Relatórios</span>
                  </button>

                  {/* Novos cards adicionais */}
                  {/* Comandas: sempre visível */}
                  <button
                    onClick={() => router.push('/admin/orders')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-white"
                  >
                    <span className="text-xl sm:text-2xl">🧾</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Comandas</span>
                  </button>

                  {/* Painel de Comandos (Kitchen Display) */}
                  <button
                    onClick={() => router.push('/admin/kitchen')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
                  >
                    <span className="text-xl sm:text-2xl">👨‍🍳</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Painel de Comandos</span>
                    <span className="text-xs text-orange-600 font-semibold">NOVO</span>
                  </button>

                  {/* Gestão de Mesas */}
                  <button
                    onClick={() => router.push('/admin/tables')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
                  >
                    <span className="text-xl sm:text-2xl">🍽️</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Gestão de Mesas</span>
                    <span className="text-xs text-blue-600 font-semibold">NOVO</span>
                  </button>

                  {/* Chamadas de Garçom */}
                  <button
                    onClick={() => router.push('/admin/waiter-calls')}
                    className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-gradient-to-br from-red-50 to-pink-50 border-red-200"
                  >
                    <span className="text-xl sm:text-2xl">🔔</span>
                    <span className="text-xs sm:text-sm font-medium text-center">Chamadas</span>
                    <span className="text-xs text-red-600 font-semibold">NOVO</span>
                  </button>

                  {/* Usuários & Assinaturas: somente para admin */}
                  {isAdmin && (
                    <button
                      onClick={() => router.push('/admin/customers')}
                      className="h-20 sm:h-24 flex flex-col items-center justify-center space-y-1 sm:space-y-2 border rounded-lg p-2 sm:p-4 hover-scale animated-button hover-float bg-white"
                    >
                      <span className="text-xl sm:text-2xl">👥💳</span>
                      <span className="text-xs sm:text-sm font-medium text-center">Usuários</span>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações do Restaurante */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent>
                {restaurant ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome</label>
                      <p className="text-lg font-semibold">{restaurant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">URL</label>
                      <p className="text-sm text-blue-600">/{restaurant.slug}</p>
                    </div>
                    {restaurant.whatsapp && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">WhatsApp</label>
                        <p>
                          <a
                            href={`https://wa.me/${onlyDigits(restaurant.whatsapp)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            {formatBRMask(restaurant.whatsapp)}
                          </a>
                        </p>
                      </div>
                    )}
                    <div className="pt-3">
                      <Button 
                        className="w-full animated-button" 
                        variant="outline"
                        onClick={() => setShowEditRestaurantModal(true)}
                      >
                        Editar Informações
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-3">Nenhum restaurante cadastrado</p>
                    <Button 
                      className="animated-button"
                      onClick={() => setShowCreateRestaurantModal(true)}
                    >
                      Criar Restaurante
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Itens Recentes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Itens do Cardápio</CardTitle>
          </CardHeader>
          <CardContent>
            {restaurant?.menuItems && restaurant.menuItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurant.menuItems.slice(0, 6).map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover-scale relative">
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowEditItemModal(true);
                        }}
                        className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-blue-600"
                        title="Editar item"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                        title="Remover item"
                      >
                        ✕
                      </button>
                    </div>
                    {item.image ? (
                      <img 
                        src={
                          item.image?.startsWith('/') 
                            ? item.image 
                            : item.image?.startsWith('http') 
                              ? item.image 
                              : `/api/image?key=${encodeURIComponent(item.image)}`
                        } 
                        alt={item.name}
                        className="w-full h-32 object-contain bg-white rounded-md mb-3"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-md mb-3">
                        <div className="text-center text-gray-400">
                          <span className="text-4xl">📷</span>
                          <p className="text-xs mt-1">Sem imagem</p>
                        </div>
                      </div>
                    )}
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-red-600">
                        R$ {Number(item.price).toFixed(2)}
                      </span>
                      {item.isPromo && (
                        <Badge variant="secondary">Promoção</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhum item cadastrado ainda</p>
                <Button 
                  className="animated-button"
                  onClick={() => setShowAddItemModal(true)}
                  disabled={!restaurant}
                >
                  <span className="mr-2">➕</span>
                  Adicionar Primeiro Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showCreateRestaurantModal && (
        <CreateRestaurantModal 
          isOpen={showCreateRestaurantModal}
          onClose={() => setShowCreateRestaurantModal(false)}
          onSuccess={(restaurant) => {
            setRestaurant(restaurant);
            setShowCreateRestaurantModal(false);
            toast.success('🏪 Restaurante criado com sucesso!');
            fetchRestaurantData();
          }}
        />
      )}

      {showAddItemModal && (
        <AddItemWithCustomizationsModal 
          isOpen={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          restaurantId={restaurant?.id || ''}
          categories={restaurant?.categories || []}
          onSuccess={() => {
            setShowAddItemModal(false);
            toast.success('🍕 Item adicionado com sucesso!');
            fetchRestaurantData();
          }}
        />
      )}

      {showEditItemModal && editingItem && (
        <EditItemModal 
          isOpen={showEditItemModal}
          onClose={() => {
            setShowEditItemModal(false);
            setEditingItem(null);
          }}
          item={editingItem}
          categories={restaurant?.categories || []}
          onSuccess={() => {
            setShowEditItemModal(false);
            setEditingItem(null);
            toast.success('✏️ Item atualizado com sucesso!');
            fetchRestaurantData();
          }}
        />
      )}

      {showAddCategoryModal && (
        <AddCategoryModal 
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          restaurantId={restaurant?.id || ''}
          onSuccess={() => {
            setShowAddCategoryModal(false);
            toast.success('📁 Categoria criada com sucesso!');
            fetchRestaurantData();
          }}
        />
      )}

      {showEditRestaurantModal && restaurant && (
        <EditRestaurantModal 
          isOpen={showEditRestaurantModal}
          onClose={() => setShowEditRestaurantModal(false)}
          restaurant={restaurant}
          onSuccess={() => {
            setShowEditRestaurantModal(false);
            toast.success('✏️ Informações atualizadas com sucesso!');
            fetchRestaurantData();
          }}
        />
      )}


      {showCouponsModal && restaurant && (
        <CouponsModal 
          isOpen={showCouponsModal}
          onClose={() => setShowCouponsModal(false)}
          restaurant={restaurant}
        />
      )}

      {showReportsModal && restaurant && (
        <ReportsModal 
          isOpen={showReportsModal}
          onClose={() => setShowReportsModal(false)}
          restaurant={restaurant}
        />
      )}
    </div>
  );
}

// Exporta o componente com proteção de assinatura
export default withSubscriptionCheck(AdminDashboard);

// Modal components
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateRestaurantModalProps extends ModalProps {
  onSuccess: (restaurant: Restaurant) => void;
}

function CreateRestaurantModal({ isOpen, onClose, onSuccess }: CreateRestaurantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const digits = onlyDigits(formData.whatsapp);
      if (formData.whatsapp && !isValidWhatsapp(digits)) {
        toast.error('WhatsApp inválido. Use DDD + número. Ex: 62999999999');
        setIsLoading(false);
        return;
      }
      const response = await fetch('/api/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formData.whatsapp ? digits : null,
          address: formData.address,
        }),
      });

      if (response.ok) {
        const restaurant = await response.json();
        onSuccess(restaurant);
      } else {
        toast.error('Erro ao criar restaurante');
      }
    } catch (error) {
      toast.error('Erro ao criar restaurante');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar Restaurante</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Restaurante</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Nome do seu restaurante"
              />
            </div>
            
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: formatBRMask(e.target.value) })}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Endereço do restaurante"
              />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface AddItemModalProps extends ModalProps {
  restaurantId: string;
  categories: Category[];
  onSuccess: () => void;
}

function AddItemModal({ isOpen, onClose, restaurantId, categories, onSuccess }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    isPromo: false,
    oldPrice: '',
    promoTag: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Customizações
  const [hasCustomizations, setHasCustomizations] = useState(false);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [newFlavor, setNewFlavor] = useState('');
  const [borders, setBorders] = useState<Array<{name: string; price: string}>>([]);
  const [newBorder, setNewBorder] = useState({name: '', price: ''});
  const [extras, setExtras] = useState<Array<{name: string; price: string}>>([]);
  const [newExtra, setNewExtra] = useState({name: '', price: ''});
  const [maxFlavors, setMaxFlavors] = useState('2');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'; // Imagem padrão

      // Upload da imagem se selecionada
      if (selectedImage) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', selectedImage);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.image_url;
        } else {
          let errMsg = 'Erro no upload da imagem';
          try {
            const errBody = await uploadResponse.json();
            if (errBody?.error) errMsg = errBody.error;
          } catch {}
          toast.error(errMsg);
          return;
        }
        setIsUploading(false);
      }

      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        restaurantId,
        image: imageUrl
      };

      console.log('📤 Enviando item para API:', itemData);

      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        const createdItem = await response.json();
        console.log('✅ Item criado:', createdItem);
        toast.success(`✅ Item "${createdItem.name}" criado com sucesso!`);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          categoryId: '',
          isPromo: false,
          oldPrice: '',
          promoTag: ''
        });
        setSelectedImage(null);
        setImagePreview(null);
        onSuccess();
      } else {
        toast.error('Erro ao adicionar item');
      }
    } catch (error) {
      toast.error('Erro ao adicionar item');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Adicionar Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Item</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Ex: Pizza Margherita"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                placeholder="Descreva o item"
              />
            </div>
            
            <div>
              <Label htmlFor="categoryId">Categoria</Label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="price">Preço</Label>
              <PriceInput
                value={formData.price}
                onChange={(val) => setFormData({...formData, price: val})}
                placeholder="Digite: 2990 = R$ 29,90"
              />
            </div>
            
            <div>
              <Label>Imagem do Item</Label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-32 object-contain bg-gray-50 rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    <p className="text-gray-500 mb-2">Adicionar imagem do item</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm"
                    >
                      Escolher Arquivo
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPromo"
                checked={formData.isPromo}
                onChange={(e) => setFormData({...formData, isPromo: e.target.checked})}
              />
              <Label htmlFor="isPromo">Item em promoção</Label>
            </div>
            
            {formData.isPromo && (
              <>
                <div>
                  <Label htmlFor="oldPrice">Preço Anterior</Label>
                  <PriceInput
                    value={formData.oldPrice}
                    onChange={(val) => setFormData({...formData, oldPrice: val})}
                    placeholder="Digite: 3990 = R$ 39,90"
                  />
                </div>

                <div>
                  <Label htmlFor="promoTag">Etiqueta da Promoção</Label>
                  <Input
                    id="promoTag"
                    type="text"
                    value={formData.promoTag}
                    onChange={(e) => setFormData({...formData, promoTag: e.target.value})}
                    placeholder="Ex: COMBO, 2 POR 1, OFERTA, etc."
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Texto que aparecerá na tag acima do card (máx. 20 caracteres)
                  </p>
                  {/* Sugestões rápidas */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, promoTag: 'COMBO'})}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200"
                    >
                      COMBO
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, promoTag: '2 POR 1'})}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200"
                    >
                      2 POR 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, promoTag: 'OFERTA'})}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200"
                    >
                      OFERTA
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, promoTag: 'PROMOÇÃO'})}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200"
                    >
                      PROMOÇÃO
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isUploading} className="flex-1">
                {isUploading ? 'Enviando imagem...' : isLoading ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Edit Item Modal
interface EditItemModalProps extends ModalProps {
  item: MenuItem;
  categories: Category[];
  onSuccess: () => void;
}

function EditItemModal({ isOpen, onClose, item, categories, onSuccess }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || '',
    price: item.price.toString(),
    categoryId: item.category.id,
    isPromo: item.isPromo || false,
    oldPrice: item.originalPrice?.toString() || '',
    promoTag: item.promoTag || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(item.image || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = item.image; // Mantém a imagem atual por padrão

      // Upload da nova imagem se selecionada
      if (selectedImage) {
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', selectedImage);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.image_url;
        } else {
          let errMsg = 'Erro no upload da imagem';
          try {
            const errBody = await uploadResponse.json();
            if (errBody?.error) errMsg = errBody.error;
          } catch {}
          toast.error(errMsg);
          setIsLoading(false);
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const itemData = {
        ...formData,
        price: formData.price,
        oldPrice: formData.oldPrice || null,
        image: imageUrl
      };

      console.log('📤 Atualizando item:', itemData);

      const response = await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        console.log('✅ Item atualizado:', updatedItem);
        onSuccess();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erro ao atualizar item');
      }
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader>
          <CardTitle>✏️ Editar Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nome do Item</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Ex: Pizza Margherita"
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <select
                  id="edit-category"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione...</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição do item"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-price">Preço</Label>
              <PriceInput
                value={formData.price}
                onChange={(val) => setFormData({...formData, price: val})}
                placeholder="Digite: 2990 = R$ 29,90"
              />
            </div>
            
            <div>
              <Label>Imagem do Item</Label>
              <div className="space-y-3">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-32 object-contain bg-gray-50 rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                    <p className="text-gray-500 mb-2">Adicionar/Trocar imagem</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-sm"
                    >
                      Escolher Arquivo
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPromo"
                checked={formData.isPromo}
                onChange={(e) => setFormData({...formData, isPromo: e.target.checked})}
              />
              <Label htmlFor="edit-isPromo">Item em promoção</Label>
            </div>
            
            {formData.isPromo && (
              <>
                <div>
                  <Label htmlFor="edit-oldPrice">Preço Anterior</Label>
                  <PriceInput
                    value={formData.oldPrice}
                    onChange={(val) => setFormData({...formData, oldPrice: val})}
                    placeholder="Digite: 3990 = R$ 39,90"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-promoTag">Etiqueta da Promoção</Label>
                  <Input
                    id="edit-promoTag"
                    type="text"
                    value={formData.promoTag}
                    onChange={(e) => setFormData({...formData, promoTag: e.target.value})}
                    placeholder="Ex: COMBO, 2 POR 1, OFERTA, etc."
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Texto que aparecerá na tag acima do card (máx. 20 caracteres)
                  </p>
                  {/* Sugestões rápidas */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, promoTag: 'COMBO'})}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200"
                    >
                      COMBO
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, promoTag: '2 POR 1'})}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200"
                    >
                      2 POR 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, promoTag: 'OFERTA'})}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200"
                    >
                      OFERTA
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, promoTag: 'PROMOÇÃO'})}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200"
                    >
                      PROMOÇÃO
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isUploading} className="flex-1">
                {isUploading ? 'Enviando imagem...' : isLoading ? 'Salvando...' : '✏️ Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface AddCategoryModalProps extends ModalProps {
  restaurantId: string;
  onSuccess: () => void;
}

function AddCategoryModal({ isOpen, onClose, restaurantId, onSuccess }: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: '🍕'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Ícones organizados por categoria
  const icons = [
    // 🍕 COMIDAS PRINCIPAIS
    '🍕', // Pizza
    '🍔', // Hambúrguer
    '🌭', // Hot Dog
    '🥪', // Sanduíche
    '🌮', // Taco
    '🌯', // Burrito
    '🥙', // Kebab
    
    // 🍖 CARNES E PROTEÍNAS
    '🍖', // Carne no osso
    '🥩', // Bife
    '🍗', // Frango
    '🍤', // Camarão
    '🐟', // Peixe
    '🦐', // Lagosta
    '🦞', // Caranguejo
    
    // 🍝 MASSAS E ITALIANA
    '🍝', // Espaguete
    '🍜', // Lámen/Macarrão
    '🥘', // Paella
    '🍲', // Ensopado
    
    // 🥗 SAUDÁVEIS E VEGETARIANO
    '🥗', // Salada
    '🥑', // Abacate
    '🌱', // Vegetariano
    '🥦', // Brócolis
    
    // 🍰 SOBREMESAS
    '🍰', // Bolo
    '🧁', // Cupcake
    '🍮', // Pudim
    '🍩', // Donut
    '🍪', // Cookie
    '🎂', // Torta
    '🍨', // Sorvete
    '🍦', // Casquinha
    '🧇', // Waffle
    '🥞', // Panqueca
    
    // 🍺 BEBIDAS ALCOÓLICAS
    '🍺', // Cerveja
    '🍻', // Chopp
    '🍷', // Vinho
    '🍾', // Champagne
    '🍸', // Coquetel
    '🍹', // Drink Tropical
    '🥃', // Whisky
    
    // 🥤 BEBIDAS NÃO ALCOÓLICAS
    '🥤', // Refrigerante
    '🧃', // Suco de caixinha
    '🧋', // Bubble Tea
    '☕', // Café
    '🍵', // Chá
    '🥛', // Leite
    '💧', // Água
    '🧉', // Mate/Chimarrão
    
    // 🍟 LANCHES E PORÇÕES
    '🍟', // Batata Frita
    '🥓', // Bacon
    '🧀', // Queijo
    '🥨', // Pretzel
    '🍿', // Pipoca
    '🌰', // Castanha
    
    // 🍚 ASIÁTICA E ORIENTAL
    '🍚', // Arroz
    '🍱', // Bento Box
    '🍛', // Curry
    '🍙', // Onigiri
    '🥟', // Gyoza
    '🍣', // Sushi
    '🍤', // Tempurá
    
    // 🥐 PADARIA E CAFÉ DA MANHÃ
    '🥐', // Croissant
    '🥖', // Baguete
    '🍞', // Pão
    '🥯', // Bagel
    '🧈', // Manteiga
    
    // 🍎 FRUTAS E NATURAL
    '🍎', // Maçã
    '🍓', // Morango
    '🍌', // Banana
    '🍉', // Melancia
    '🥝', // Kiwi
    '🍇', // Uva
    
    // 🎉 ESPECIAIS E CATEGORIAS
    '⭐', // Destaque
    '🔥', // Promoção/Popular
    '🎉', // Festa/Combo
    '🎁', // Brinde/Gift
    '⏰', // Express/Rápido
    '🌟', // Novidade
    '💝', // Favoritos
    '🏆', // Top Vendas
    '💯', // Melhor Avaliado
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          restaurantId
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        toast.error('Erro ao criar categoria');
      }
    } catch (error) {
      toast.error('Erro ao criar categoria');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nova Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Ex: Pizzas, Bebidas, Sobremesas"
              />
            </div>
            
            <div>
              <Label>Ícone</Label>
              <p className="text-xs text-gray-500 mb-2">Escolha o ícone que melhor representa sua categoria (estilo 3D)</p>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mt-2 max-h-[320px] overflow-y-auto p-2 border rounded-lg bg-gray-50">
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({...formData, icon})}
                    className={`p-3 border rounded-lg hover:bg-gray-100 hover:scale-110 transition-all duration-200 flex items-center justify-center ${
                      formData.icon === icon ? 'bg-red-50 border-red-500 ring-2 ring-red-300 shadow-lg' : 'bg-white shadow-sm'
                    }`}
                    title={icon}
                  >
                    <EmojiIcon emoji={icon} size={32} className="emoji-icon-large" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


// Edit Restaurant Modal
interface EditRestaurantModalProps extends ModalProps {
  restaurant: Restaurant;
  onSuccess: () => void;
}

function EditRestaurantModal({ isOpen, onClose, restaurant, onSuccess }: EditRestaurantModalProps) {
  const [formData, setFormData] = useState({
    name: restaurant.name,
    whatsapp: restaurant.whatsapp || '',
    address: restaurant.address || '',
    openTime: restaurant.openTime || '08:00',
    closeTime: restaurant.closeTime || '22:00',
    workingDays: restaurant.workingDays || '0,1,2,3,4,5,6', // Todos os dias
    pixKey: restaurant.pixKey || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const daysOfWeek = [
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Segunda' },
    { value: '2', label: 'Terça' },
    { value: '3', label: 'Quarta' },
    { value: '4', label: 'Quinta' },
    { value: '5', label: 'Sexta' },
    { value: '6', label: 'Sábado' }
  ];

  const toggleDay = (day: string) => {
    const days = formData.workingDays.split(',').filter((d: string) => d);
    if (days.includes(day)) {
      setFormData({ ...formData, workingDays: days.filter((d: string) => d !== day).join(',') });
    } else {
      setFormData({ ...formData, workingDays: [...days, day].sort().join(',') });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const digits = onlyDigits(formData.whatsapp);
      if (formData.whatsapp && !isValidWhatsapp(digits)) {
        toast.error('WhatsApp inválido. Use DDD + número. Ex: 62999999999');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restaurant.id,
          name: formData.name,
          whatsapp: formData.whatsapp ? digits : null,
          address: formData.address,
          openTime: formData.openTime,
          closeTime: formData.closeTime,
          workingDays: formData.workingDays,
          pixKey: formData.pixKey,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        toast.error('Erro ao atualizar informações');
      }
    } catch (error) {
      toast.error('Erro ao atualizar informações');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-md my-8 max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Editar Informações do Restaurante</CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="name">Nome do Restaurante</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Nome do seu restaurante"
              />
            </div>
            
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: formatBRMask(e.target.value) })}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Endereço do restaurante"
              />
            </div>

            <div className="border-t pt-3">
              <h3 className="font-semibold mb-2 text-base">💳 Configurações PIX</h3>
              
              <div>
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input
                  id="pixKey"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({...formData, pixKey: e.target.value})}
                  placeholder="CPF, CNPJ, e-mail ou chave aleatória"
                />
                <p className="text-xs text-gray-500 mt-1">Digite apenas a chave PIX (não o código copia e cola)</p>
              </div>
              
              <p className="text-xs text-green-600 mt-2">
                ✅ O QR Code será gerado automaticamente no checkout com o valor do pedido!
              </p>
            </div>

            <div className="border-t pt-3">
              <h3 className="font-semibold mb-2 text-base">⏰ Horário de Funcionamento</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <Label htmlFor="openTime">Abertura</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => setFormData({...formData, openTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="closeTime">Fechamento</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => setFormData({...formData, closeTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Dias de Funcionamento</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = formData.workingDays.split(',').includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        <div className="border-t p-4 flex gap-3 flex-shrink-0 bg-white">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            type="button" 
            disabled={isLoading}
            onClick={() => {
              const form = document.querySelector('form');
              if (form) {
                form.requestSubmit();
              }
            }}
            className="flex-1"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Personalize Modal
interface PersonalizeModalProps extends ModalProps {
  restaurant: Restaurant;
  onSuccess: () => void;
}

function PersonalizeModal({ isOpen, onClose, restaurant, onSuccess }: PersonalizeModalProps) {
  const [formData, setFormData] = useState({
    primaryColor: '#d32f2f',
    secondaryColor: '#ffc107'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/restaurant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restaurant.id,
          ...formData
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        toast.error('Erro ao salvar personalização');
      }
    } catch (error) {
      toast.error('Erro ao salvar personalização');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Personalizar Aparência</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="primaryColor">Cor Principal</Label>
              <div className="flex items-center gap-2">
                <input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})}
                  placeholder="#d32f2f"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex items-center gap-2">
                <input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                  className="w-12 h-10 border rounded cursor-pointer"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})}
                  placeholder="#ffc107"
                />
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-medium mb-2">Preview:</h4>
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: formData.primaryColor }}
                ></div>
                <div 
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: formData.secondaryColor }}
                ></div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Reports Modal
interface ReportsModalProps extends ModalProps {
  restaurant: Restaurant;
}

function ReportsModal({ isOpen, onClose, restaurant }: ReportsModalProps) {
  if (!isOpen) return null;

  const totalItems = restaurant.menuItems?.length || 0;
  const totalCategories = restaurant.categories?.length || 0;
  const promoItems = restaurant.menuItems?.filter(item => item.isPromo).length || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>📊 Relatórios e Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-sm text-gray-600">Total de Itens</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalCategories}</div>
              <div className="text-sm text-gray-600">Categorias</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{promoItems}</div>
              <div className="text-sm text-gray-600">Promoções Ativas</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Itens por Categoria:</h4>
              {restaurant.categories?.map(category => (
                <div key={category.id} className="flex justify-between items-center p-2 border-b">
                  <span>{category.icon} {category.name}</span>
                  <span className="font-medium">{category.menuItems?.length || 0} itens</span>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium mb-2">Informações do Cardápio:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Slug do restaurante: /{restaurant.slug}</p>
                <p>• Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
