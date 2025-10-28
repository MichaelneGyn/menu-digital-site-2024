'use client';

import { useState, useEffect } from 'react';
import { ClientMenuItem } from '@/lib/restaurant';
import { Plus, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface UpsellSuggestionsProps {
  restaurantId: string;
  onAddToCart: (item: ClientMenuItem) => void;
  showAsModal?: boolean;
}

interface UpsellData {
  rule: {
    id: string;
    title: string;
    subtitle: string;
    productDiscounts?: string;
  };
  products: ClientMenuItem[];
}

interface ProductWithDiscount extends ClientMenuItem {
  discountPercent?: number;
  discountedPrice?: number;
  savings?: number;
}

export default function UpsellSuggestions({ restaurantId, onAddToCart, showAsModal = false }: UpsellSuggestionsProps) {
  const [upsellData, setUpsellData] = useState<UpsellData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackedView, setTrackedView] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(showAsModal);

  useEffect(() => {
    fetchUpsellSuggestions();
  }, [restaurantId]);

  const fetchUpsellSuggestions = async () => {
    try {
      const response = await fetch(`/api/upsell/suggestions?restaurantId=${restaurantId}&location=checkout`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
          setUpsellData(data);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões de upsell:', error);
    } finally {
      setLoading(false);
    }
  };

  // Registrar visualização (apenas uma vez)
  useEffect(() => {
    if (upsellData && !trackedView) {
      trackEvent('view');
      setTrackedView(true);
    }
  }, [upsellData, trackedView]);

  const trackEvent = async (event: 'view' | 'click' | 'conversion', revenue?: number) => {
    if (!upsellData) return;

    try {
      await fetch('/api/upsell/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId: upsellData.rule.id,
          event,
          revenue,
        }),
      });
    } catch (error) {
      console.error('Erro ao registrar tracking:', error);
    }
  };

  const handleAddProduct = (product: ProductWithDiscount) => {
    // Registrar clique
    trackEvent('click');
    
    // Registrar conversão com valor
    trackEvent('conversion', product.discountedPrice || product.price);
    
    // Adicionar ao carrinho
    onAddToCart(product);
    
    // Feedback visual no botão
    setAddedProductId(product.id);
    
    // Remover feedback após 2 segundos
    setTimeout(() => {
      setAddedProductId(null);
    }, 2000);
    
    // Toast como backup
    const savings = product.savings || 0;
    const message = savings > 0 
      ? `🎉 ${product.name} adicionado! Você economizou R$ ${savings.toFixed(2)}!`
      : `✅ ${product.name} adicionado ao pedido!`;
    
    toast.success(message, {
      duration: 3000,
      icon: '🔥',
      position: 'top-center',
      style: {
        background: '#22c55e',
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '15px',
        padding: '12px 20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    });
  };

  if (loading || !upsellData || upsellData.products.length === 0) {
    return null;
  }

  // Processar produtos com descontos
  const discounts = upsellData.rule.productDiscounts 
    ? JSON.parse(upsellData.rule.productDiscounts) 
    : {};

  const productsWithDiscounts: ProductWithDiscount[] = upsellData.products.map(product => {
    const discountPercent = discounts[product.id] || 0;
    const discountedPrice = discountPercent > 0 
      ? product.price * (1 - discountPercent / 100) 
      : product.price;
    const savings = product.price - discountedPrice;

    return {
      ...product,
      discountPercent,
      discountedPrice,
      savings
    };
  });

  const UpsellContent = () => (
    <>
      {/* Título com Badge - Mais compacto */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-t-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl animate-pulse">🔥</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold">
              {upsellData.rule.title}
            </h3>
            <p className="text-sm opacity-90">{upsellData.rule.subtitle}</p>
          </div>
        </div>
      </div>
      
      {/* Grid de Produtos */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {productsWithDiscounts.map((product) => (
          <div
            key={product.id}
            className={`bg-white border-2 rounded-lg overflow-hidden transition-all group relative ${
              addedProductId === product.id 
                ? 'border-green-500 shadow-lg scale-105' 
                : 'border-gray-200 hover:border-green-500 hover:shadow-md'
            }`}
          >
            {/* Badge de Sucesso Flutuante */}
            {addedProductId === product.id && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-90 z-10 flex items-center justify-center animate-pulse">
                <div className="text-white text-center">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold text-lg">Adicionado!</p>
                  {product.savings && product.savings > 0 && (
                    <p className="text-sm">Economize R$ {product.savings.toFixed(2)}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Imagem */}
            {product.image && (
              <div className="relative h-24 overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                
                {/* Badge de Desconto */}
                {product.discountPercent && product.discountPercent > 0 && (
                  <div className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                    -{product.discountPercent}%
                  </div>
                )}
              </div>
            )}

            {/* Conteúdo */}
            <div className="p-3">
              <h4 className="font-medium text-sm line-clamp-2 min-h-[2.5rem] mb-2">
                {product.name}
              </h4>

              {/* Preço com Desconto */}
              <div className="mb-3">
                {product.discountPercent && product.discountPercent > 0 ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-400 line-through">
                        R$ {product.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-green-600">
                        R$ {product.discountedPrice?.toFixed(2)}
                      </span>
                    </div>
                    {/* Badge Economize */}
                    <div className="mt-1 inline-block bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded">
                      💰 Economize R$ {product.savings?.toFixed(2)}
                    </div>
                  </>
                ) : (
                  <div className="text-lg font-bold text-gray-900">
                    R$ {product.price.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Botão Adicionar Destacado com Feedback */}
              <Button
                onClick={() => handleAddProduct(product)}
                size="sm"
                disabled={addedProductId === product.id}
                className={`w-full font-bold transition-all text-xs sm:text-sm px-2 py-2 h-auto ${
                  addedProductId === product.id
                    ? 'bg-green-600 scale-95'
                    : product.discountPercent && product.discountPercent > 0
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 active:scale-95'
                    : 'bg-green-600 hover:bg-green-700 active:scale-95'
                } text-white shadow-md`}
              >
                {addedProductId === product.id ? (
                  <span className="flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 animate-bounce" />
                    <span className="whitespace-nowrap">Adicionado!</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="whitespace-nowrap">
                      {product.discountPercent && product.discountPercent > 0 
                        ? 'Aproveitar!' 
                        : 'Adicionar'}
                    </span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        ))}
        </div>

        {/* Informação com urgência */}
        <div className="mt-4 text-center">
          <p className="text-sm text-orange-600 font-semibold">
            ⚡ Ofertas válidas apenas durante o pedido!
          </p>
        </div>
      </div>
    </>
  );

  // Se não for para mostrar como modal, sempre mostrar inline
  if (!showAsModal) {
    return (
      <div className="bg-white rounded-lg shadow-md border-2 border-orange-400">
        <UpsellContent />
      </div>
    );
  }

  // Mostrar como modal (versão antiga)
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes upsellFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes upsellSlideUp {
          from { 
            opacity: 0;
            transform: translateY(20px); 
          }
          to { 
            opacity: 1;
            transform: translateY(0); 
          }
        }
      `}} />

      {/* Modal Popup - Aparece automaticamente */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          style={{ animation: 'upsellFadeIn 0.3s ease-out' }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ animation: 'upsellSlideUp 0.4s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <div className="sticky top-0 bg-white z-10 flex justify-end p-2 border-b">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Conteúdo do Upsell */}
            <UpsellContent />
          </div>
        </div>
      )}

      {/* Versão inline (aparece se fechar o modal) */}
      {!showModal && (
        <div className="bg-white rounded-lg shadow-md border-2 border-orange-400">
          <UpsellContent />
        </div>
      )}
    </>
  );
}
