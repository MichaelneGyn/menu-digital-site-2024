
'use client';

import { useState } from 'react';
import { X, Check, Plus, Minus, ChevronLeft } from 'lucide-react';
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
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>(
    BURGER_INGREDIENTS.filter(i => i.included).map(i => i.id)
  );
  const [observations, setObservations] = useState('');
  
  const maxFlavors = selectedSize?.id === 'gigante' ? 4 : 
                     selectedSize?.id === 'grande' ? 3 : 2;

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
    } else {
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
      return ['size', 'flavors', 'extras', 'observations'];
    }
    if (isBurger) {
      return ['ingredients', 'observations'];
    }
    return ['observations'];
  };

  const steps = getSteps();
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 flex-shrink-0">
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
            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
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
                  const sizePrice = Number(item.price) * size.priceMultiplier;
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedSize?.id === size.id
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="font-bold text-gray-900">{size.name}</div>
                      <div className="text-sm text-gray-600">{size.desc}</div>
                      {/* Removido o preço aqui pois confunde o cliente */}
                      {selectedSize?.id === size.id && (
                        <Check className="text-orange-500 mt-2 mx-auto" size={20} />
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
                        <span className="text-lg font-bold text-orange-600">
                          {formatPrice(flavor.price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP: Extras (Pizza) */}
          {currentStep === 'extras' && isPizza && (
            <div className="space-y-4">
              <div className="sticky top-0 bg-white pt-4 pb-3 px-4 sm:px-6 z-10 border-b-2 border-gray-200 mb-4 -mx-4 sm:-mx-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Adicionais</h3>
                <p className="text-base text-gray-600 font-medium">Opcional</p>
              </div>
              <div className="space-y-3 px-4 sm:px-6">
                {PIZZA_EXTRAS.map(extra => {
                  const isSelected = selectedExtras.some(e => e.name === extra.name);
                  return (
                    <button
                      key={extra.name}
                      onClick={() => handleExtraToggle(extra)}
                      className={`w-full p-4 rounded-xl border-2 transition-all bg-white ${
                        isSelected
                          ? 'border-gray-300 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{extra.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 font-bold">+ {formatPrice(extra.price)}</span>
                          {isSelected && <Check className="text-green-600" size={20} />}
                        </div>
                      </div>
                    </button>
                  );
                })}
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
                            <span className="text-orange-600 font-bold text-sm">
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
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none text-gray-900 flex-1 min-h-[150px]"
                />
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-white flex-shrink-0">
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
              disabled={!canProceed()}
              className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLastStep ? (
                <>Adicionar • {formatPrice(calculateTotalPrice())}</>
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
