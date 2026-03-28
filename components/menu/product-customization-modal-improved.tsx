
'use client';

import { useEffect, useState } from 'react';
import { X, Check, ChevronLeft, Search, Plus, Minus } from 'lucide-react';
import { ClientMenuItem } from '@/lib/restaurant';

export interface ProductCustomization {
  size?: string;
  flavors: string[];
  extras: Array<{name: string; price: number}>;
  ingredients: string[];
  observations: string;
  totalPrice: number;
}

interface ProductCustomizationModalImprovedProps {
  item: ClientMenuItem;
  onAdd: (customization: ProductCustomization) => void;
  onClose: () => void;
}

const PIZZA_SIZES = [
  { id: 'pequena', name: 'Pequena', desc: '4 fatias', priceMultiplier: 0.7 },
  { id: 'media', name: 'Média', desc: '6 fatias', priceMultiplier: 1.0 },
  { id: 'grande', name: 'Grande', desc: '8 fatias', priceMultiplier: 1.3 },
  { id: 'gigante', name: 'Gigante', desc: '12 fatias', priceMultiplier: 1.6 }
];

const PIZZA_FLAVORS = [
  { name: 'Calabresa', price: 35.00 },
  { name: 'Marguerita', price: 32.00 },
  { name: 'Portuguesa', price: 38.00 },
  { name: '4 Queijos', price: 36.00 },
  { name: 'Frango c/ Catupiry', price: 37.00 },
  { name: 'Bacon', price: 39.00 },
  { name: 'Napolitana', price: 34.00 },
  { name: 'Toscana', price: 40.00 },
  { name: 'Pepperoni', price: 42.00 },
  { name: 'Vegetariana', price: 33.00 }
];

const PIZZA_EXTRAS = [
  { name: 'Borda Catupiry', price: 5.00 },
  { name: 'Borda Cheddar', price: 5.00 },
  { name: 'Borda Mussarela', price: 6.00 },
  { name: 'Borda Cream Cheese', price: 6.00 },
  { name: 'Extra Queijo', price: 3.00 },
  { name: 'Extra Catupiry', price: 4.00 },
  { name: 'Extra Bacon', price: 5.00 },
  { name: 'Extra Calabresa', price: 4.00 }
];

const BURGER_INGREDIENTS = [
  { id: 1, name: 'Alface', included: true },
  { id: 2, name: 'Tomate', included: true },
  { id: 3, name: 'Queijo', included: true },
  { id: 4, name: 'Bacon', included: false, price: 4.00 },
  { id: 5, name: 'Ovo', included: false, price: 3.00 },
  { id: 6, name: 'Cebola Caramelizada', included: false, price: 3.00 },
  { id: 7, name: 'Picles', included: true },
  { id: 8, name: 'Molho Especial', included: true }
];

type Step = 'size' | 'flavors' | 'extras' | 'ingredients' | 'observations';

export default function ProductCustomizationModalImproved({ 
  item, 
  onAdd, 
  onClose 
}: ProductCustomizationModalImprovedProps) {
  // 1. Definimos o tipo do item ANTES de inicializar o estado
  const isPizza = item.name?.toLowerCase().includes('pizza');
  const isBurger = item.name?.toLowerCase().includes('burger') || 
                   item.name?.toLowerCase().includes('sanduíche') ||
                   item.name?.toLowerCase().includes('lanche');

  // 2. Função para determinar qual o primeiro passo válido
  const getInitialStep = (): Step => {
    if (isPizza) return 'size';
    if (isBurger) return 'ingredients';
    return 'observations';
  };

  // 3. Inicializamos o currentStep com o passo correto
  const [currentStep, setCurrentStep] = useState<Step>(getInitialStep());
  
  const [selectedSize, setSelectedSize] = useState<typeof PIZZA_SIZES[0] | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<Array<{name: string; price: number}>>([]);
  const [selectedExtras, setSelectedExtras] = useState<Array<{name: string; price: number}>>([]);
  const [categoryExtras, setCategoryExtras] = useState<Array<{name: string; price: number}>>([]);
  const [itemExtras, setItemExtras] = useState<Array<{name: string; price: number}>>([]);
  const [maxExtras, setMaxExtras] = useState(5);
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>(
    BURGER_INGREDIENTS.filter(i => i.included).map(i => i.id)
  );
  const [extraSearchTerm, setExtraSearchTerm] = useState('');
  const [observations, setObservations] = useState('');
  
  const maxFlavors = selectedSize?.id === 'gigante' ? 4 : 
                     selectedSize?.id === 'grande' ? 3 : 2;
  const extrasOptions = itemExtras.length > 0
    ? itemExtras
    : categoryExtras.length > 0
      ? categoryExtras
      : (isPizza ? PIZZA_EXTRAS : []);
  const filteredExtras = extrasOptions.filter((extra) =>
    extra.name.toLowerCase().includes(extraSearchTerm.toLowerCase().trim())
  );

  useEffect(() => {
    const fetchCategoryExtras = async () => {
      try {
        const [itemGroupsResponse, categoryResponse] = await Promise.all([
          fetch(`/api/menu-items/${item.id}/customizations`),
          fetch(`/api/menu-items/${item.id}/category-customization`)
        ]);

        let selectedExtrasSource: Array<{ name: string; price: number }> = [];
        let selectedMaxExtras = 5;

        if (itemGroupsResponse.ok) {
          const groups = await itemGroupsResponse.json();
          const firstGroupWithOptions = Array.isArray(groups)
            ? groups.find((group: { options?: Array<{ name: string; price: number }>; maxSelections?: number | null }) =>
                Array.isArray(group.options) && group.options.length > 0
              )
            : null;

          if (firstGroupWithOptions) {
            selectedExtrasSource = firstGroupWithOptions.options.map((option: { name: string; price: number }) => ({
              name: option.name,
              price: Number(option.price || 0)
            }));
            selectedMaxExtras = Math.max(1, Number(firstGroupWithOptions.maxSelections) || 5);
            setItemExtras(selectedExtrasSource);
          } else {
            setItemExtras([]);
          }
        } else {
          setItemExtras([]);
        }

        if (selectedExtrasSource.length === 0) {
          if (!categoryResponse.ok) {
            setCategoryExtras([]);
            setMaxExtras(5);
            if (!isPizza && !isBurger) {
              setCurrentStep('observations');
            }
            return;
          }

          const data = await categoryResponse.json();
          const extras = (data?.extras || []).map((extra: { name: string; price: number }) => ({
            name: extra.name,
            price: Number(extra.price || 0)
          }));
          setCategoryExtras(extras);
          selectedExtrasSource = extras;
          selectedMaxExtras = Math.max(1, Number(data?.maxExtras) || 5);
        } else {
          setCategoryExtras([]);
        }

        setMaxExtras(selectedMaxExtras);
        if (!isPizza && !isBurger) {
          setCurrentStep(selectedExtrasSource.length > 0 ? 'extras' : 'observations');
        }
      } catch (error) {
        console.error('Erro ao buscar adicionais da categoria:', error);
        setCategoryExtras([]);
        setItemExtras([]);
        setMaxExtras(5);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchCategoryExtras();
  }, [item.id, isBurger, isPizza]);

  const calculateTotalPrice = () => {
    let total = 0;
    
    // Para pizza: usa o preço dos sabores selecionados (média se múltiplos)
    if (isPizza && selectedFlavors.length > 0) {
      const flavorsTotal = selectedFlavors.reduce((sum, f) => sum + f.price, 0);
      total = flavorsTotal / selectedFlavors.length; // Média dos sabores
      
      // Ajusta pelo tamanho
      if (selectedSize) {
        total = total * selectedSize.priceMultiplier;
      }
    } else {
      total = Number(item.price);
    }
    
    // Adiciona extras
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    
    // Adiciona ingredientes extras (burger)
    const ingredientsPrice = BURGER_INGREDIENTS
      .filter(ing => !ing.included && selectedIngredients.includes(ing.id))
      .reduce((sum, ing) => sum + (ing.price || 0), 0);
    
    return total + extrasPrice + ingredientsPrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleFlavorToggle = (flavor: {name: string; price: number}) => {
    if (selectedFlavors.some(f => f.name === flavor.name)) {
      setSelectedFlavors(selectedFlavors.filter(f => f.name !== flavor.name));
    } else if (selectedFlavors.length < maxFlavors) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const handleExtraToggle = (extra: {name: string; price: number}) => {
    if (selectedExtras.some(e => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
    } else if (selectedExtras.length < maxExtras) {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleIngredientToggle = (ingredientId: number) => {
    if (selectedIngredients.includes(ingredientId)) {
      setSelectedIngredients(selectedIngredients.filter(id => id !== ingredientId));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredientId]);
    }
  };

  const handleAddToCart = () => {
    const customization: ProductCustomization = {
      size: selectedSize?.name,
      flavors: selectedFlavors.map(f => f.name),
      extras: selectedExtras,
      ingredients: BURGER_INGREDIENTS
        .filter(ing => selectedIngredients.includes(ing.id))
        .map(ing => ing.name),
      observations,
      totalPrice: calculateTotalPrice()
    };
    
    onAdd(customization);
    onClose();
  };

  const canProceed = () => {
    if (isPizza) {
      if (currentStep === 'size') return selectedSize !== null;
      if (currentStep === 'flavors') return selectedFlavors.length > 0;
    }
    return true;
  };

  const getSteps = (): Step[] => {
    if (isPizza) {
      return extrasOptions.length > 0 ? ['size', 'flavors', 'extras'] : ['size', 'flavors', 'observations'];
    }
    if (isBurger) {
      return extrasOptions.length > 0 ? ['ingredients', 'extras'] : ['ingredients', 'observations'];
    }
    return extrasOptions.length > 0 ? ['extras'] : ['observations'];
  };

  const steps = getSteps();

  useEffect(() => {
    if (steps.length === 0) return;
    if (!steps.includes(currentStep)) {
      setCurrentStep(steps[0]);
    }
  }, [steps, currentStep]);

  const currentStepIndex = steps.indexOf(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleAddToCart();
    } else {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {currentStepIndex > 0 && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-white/50 rounded-full transition-colors flex-shrink-0"
              >
                <ChevronLeft size={20} className="text-gray-700" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{item.name}</h2>
              <p className="text-xs sm:text-sm text-gray-600">
                Passo {currentStepIndex + 1} de {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-colors flex-shrink-0 ml-2"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-red-600 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {isInitializing && (
            <div className="h-full min-h-[220px] flex items-center justify-center">
              <p className="text-sm text-gray-500">Carregando opções...</p>
            </div>
          )}
          {!isInitializing && (
          <div className="pb-4">
          {/* STEP: Tamanho (Pizza) */}
          {currentStep === 'size' && isPizza && (
            <div className="space-y-4">
              <div className="sticky top-0 bg-white pt-4 pb-3 px-4 sm:px-6 z-10 border-b-2 border-gray-200 mb-4 -mx-4 sm:-mx-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tamanhos</h3>
                <p className="text-base text-gray-600 font-medium">Selecione o tamanho</p>
              </div>
              <div className="grid grid-cols-2 gap-3 px-4 sm:px-6">
                {PIZZA_SIZES.map(size => {
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSize?.id === size.id
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="font-bold text-gray-900">{size.name}</div>
                      <div className="text-sm text-gray-600">{size.desc}</div>
                      {/* Removido o preço aqui pois confunde o cliente */}
                      {selectedSize?.id === size.id && (
                        <Check className="text-red-500 mt-2 mx-auto" size={20} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP: Sabores (Pizza) */}
          {currentStep === 'flavors' && isPizza && (
            <div className="space-y-4">
              <div className="sticky top-0 bg-white pt-4 pb-3 px-4 sm:px-6 z-10 border-b-2 border-gray-200 mb-4 -mx-4 sm:-mx-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Sabores/Opções
                </h3>
                <p className="text-base text-gray-600 font-medium">
                  {selectedFlavors.length}/{maxFlavors} selecionados
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 px-4 sm:px-6">
                {PIZZA_FLAVORS.map(flavor => {
                  const isSelected = selectedFlavors.some(f => f.name === flavor.name);
                  const isDisabled = !isSelected && selectedFlavors.length >= maxFlavors;
                  return (
                    <button
                      key={flavor.name}
                      onClick={() => handleFlavorToggle(flavor)}
                      disabled={isDisabled}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-gray-300 bg-white shadow-md'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{flavor.name}</span>
                          {isSelected && <Check className="text-green-600 flex-shrink-0" size={20} />}
                        </div>
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(flavor.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP: Extras */}
          {currentStep === 'extras' && (
            <div className="space-y-4">
              <div className="px-4 sm:px-6 pt-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-3xl font-black text-red-600 mb-2">{formatPrice(Number(item.price))}</p>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                )}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={extraSearchTerm}
                    onChange={(e) => setExtraSearchTerm(e.target.value)}
                    placeholder="Pesquise pelo nome"
                    className="w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="mx-4 sm:mx-6 rounded-lg overflow-hidden border border-gray-200">
                <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg leading-none">ADICIONAIS</h4>
                    <p className="text-sm text-gray-700">Escolha até {maxExtras} itens</p>
                  </div>
                  <span className="px-3 py-1 rounded-md bg-gray-700 text-white text-sm font-bold">
                    {selectedExtras.length}/{maxExtras}
                  </span>
                </div>

                <div className="divide-y divide-gray-100 bg-white">
                  {filteredExtras.map(extra => {
                  const isSelected = selectedExtras.some(e => e.name === extra.name);
                  const isDisabled = !isSelected && selectedExtras.length >= maxExtras;
                  return (
                    <button
                      key={extra.name}
                      onClick={() => handleExtraToggle(extra)}
                      disabled={isDisabled}
                      className={`w-full px-4 py-3 transition-colors ${
                        isSelected ? 'bg-red-50' : 'bg-white'
                      } ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-50/40'}`}
                    >
                      <div className="flex items-center justify-between gap-4 text-left">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 uppercase truncate">{extra.name}</p>
                          <p className="text-base font-bold text-red-600">
                            {extra.price > 0 ? `+ ${formatPrice(extra.price)}` : 'Grátis'}
                          </p>
                        </div>
                        <div className="text-xl font-bold text-red-600 flex-shrink-0">
                          {isSelected ? (
                            <Minus size={22} />
                          ) : (
                            <Plus size={22} />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                  {filteredExtras.length === 0 && (
                    <p className="px-4 py-6 text-sm text-gray-500 text-center">Nenhum adicional encontrado</p>
                  )}
                </div>
              </div>

              <div className="mx-4 sm:mx-6">
                <div className="bg-gray-100 px-4 py-3 rounded-t-lg border border-gray-200 border-b-0">
                  <h4 className="font-bold text-gray-900">Observações</h4>
                </div>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  maxLength={100}
                  placeholder="Ex: Tirar cebola, ovo, etc."
                  className="w-full p-4 border border-gray-200 rounded-b-lg focus:border-red-500 focus:outline-none resize-none text-gray-900 min-h-[110px]"
                />
                <p className="text-right text-xs text-gray-500 mt-1">{observations.length}/100</p>
              </div>
            </div>
          )}

          {/* STEP: Ingredientes (Burger) */}
          {currentStep === 'ingredients' && isBurger && (
            <div className="space-y-4">
              <div className="sticky top-0 bg-white pt-4 pb-3 px-4 sm:px-6 z-10 border-b-2 border-gray-200 mb-4 -mx-4 sm:-mx-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Personalize seu lanche</h3>
                <p className="text-base text-gray-600 font-medium">
                  Adicione ou remova ingredientes
                </p>
              </div>
              <div className="space-y-2 px-4 sm:px-6">
                {BURGER_INGREDIENTS.map(ing => {
                  const isSelected = selectedIngredients.includes(ing.id);
                  const hasExtraPrice = !ing.included && ing.price;
                  return (
                    <button
                      key={ing.id}
                      onClick={() => handleIngredientToggle(ing.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-red-200 bg-red-50/50 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{ing.name}</span>
                          {ing.included && (
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                              Incluído
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {hasExtraPrice && (
                            <span className="text-red-600 font-bold text-sm">
                              {formatPrice(ing.price!)}
                            </span>
                          )}
                          {isSelected ? (
                            <Check className="text-green-500" size={24} />
                          ) : (
                            <X className="text-red-400" size={24} />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP: Observações */}
          {currentStep === 'observations' && (
            <div className="space-y-4 flex flex-col h-full">
              <div className="sticky top-0 bg-white pt-4 pb-3 px-4 sm:px-6 z-10 border-b-2 border-gray-200 mb-4 -mx-4 sm:-mx-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Observações</h3>
                <p className="text-base text-gray-600 font-medium">
                  Opcional - Alguma preferência especial?
                </p>
              </div>
              <div className="px-4 sm:px-6 flex-1 flex flex-col">
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ex: Sem cebola, bem passado, maionese à parte..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none text-gray-900 flex-1 min-h-[150px]"
                />
              </div>
            </div>
          )}
          </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 pb-8 sm:pb-6 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex gap-3">
            {/* Botão Voltar */}
            {currentStepIndex > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-4 rounded-xl font-bold text-lg transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300 flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Voltar
              </button>
            )}
            
            {/* Botão Continuar/Adicionar */}
            <button
              onClick={handleNext}
              disabled={!canProceed() || isInitializing}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                canProceed() && !isInitializing
                  ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isInitializing ? 'Carregando...' : isLastStep ? (
                currentStep === 'extras'
                  ? <>Avançar</>
                  : <>Adicionar • {formatPrice(calculateTotalPrice())}</>
              ) : (
                'Continuar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
