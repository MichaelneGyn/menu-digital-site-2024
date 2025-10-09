
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ClientMenuItem } from '@/lib/restaurant';
import { ProductCustomization } from './product-card';

interface ProductCustomizationModalProps {
  item: ClientMenuItem;
  onAdd: (customization: ProductCustomization) => void;
  onClose: () => void;
}

const PIZZA_FLAVORS = [
  'Calabresa com Catupiry',
  'Portuguesa', 
  'Frango com Catupiry',
  'Bacon',
  '4 Queijos',
  'Margherita',
  'Napolitana',
  'Toscana',
  'Pepperoni',
  'Vegetariana'
];

const PIZZA_EXTRAS = [
  { name: 'Borda de Catupiry', price: 15.90 },
  { name: 'Borda de Cheddar', price: 15.90 },
  { name: 'Borda de Mussarela', price: 17.90 },
  { name: 'Borda de Cream Cheese', price: 17.90 },
  { name: 'Extra Queijo', price: 8.00 },
  { name: 'Extra Catupiry', price: 6.00 },
  { name: 'Extra Bacon', price: 10.00 },
  { name: 'Extra Calabresa', price: 8.00 }
];

const PASTA_FLAVORS = [
  'Carbonara',
  'Bolonhesa', 
  'Frango com Catupiry',
  'Camarão',
  'Quatro Queijos',
  'Pesto',
  'Alho e Óleo',
  'Marinara'
];

const DRINK_SIZES = [
  { name: '350ml', price: 0 },
  { name: '600ml', price: 3.00 },
  { name: '1L', price: 5.00 },
  { name: '2L', price: 8.00 }
];

export default function ProductCustomizationModal({ item, onAdd, onClose }: ProductCustomizationModalProps) {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<Array<{name: string; price: number}>>([]);
  const [observations, setObservations] = useState('');
  
  const isPizza = item.name?.toLowerCase().includes('pizza');
  const isPasta = item.name?.toLowerCase().includes('massa');
  const isDrink = item.name?.toLowerCase().includes('bebida');
  
  const maxFlavors = isPizza ? (item.name?.toLowerCase().includes('grande') ? 4 : 2) : 1;
  
  const availableFlavors = isPizza ? PIZZA_FLAVORS : isPasta ? PASTA_FLAVORS : [];
  const availableExtras = isPizza ? PIZZA_EXTRAS : isDrink ? DRINK_SIZES : [];

  const calculateTotalPrice = () => {
    const basePrice = Number(item.price);
    const extrasPrice = selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return basePrice + extrasPrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleFlavorToggle = (flavor: string) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== flavor));
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

  const handleAddToCart = () => {
    const customization: ProductCustomization = {
      flavors: selectedFlavors,
      extras: selectedExtras,
      observations,
      totalPrice: calculateTotalPrice()
    };
    
    onAdd(customization);
  };

  const isValid = selectedFlavors.length > 0 || !isPizza;

  return (
    <div className="customization-modal-overlay" onClick={onClose}>
      <div className="customization-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Escolha o sabor de {item.name}</h3>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {/* Sabores */}
          {availableFlavors.length > 0 && (
            <div className="section">
              <div className="section-header">
                <span className="required-badge">Obrigatório</span>
              </div>
              
              <div className="options-grid">
                {availableFlavors.map((flavor) => (
                  <button
                    key={flavor}
                    className={`option-button ${selectedFlavors.includes(flavor) ? 'selected' : ''}`}
                    onClick={() => handleFlavorToggle(flavor)}
                    disabled={!selectedFlavors.includes(flavor) && selectedFlavors.length >= maxFlavors}
                  >
                    <div className="option-radio">
                      {selectedFlavors.includes(flavor) && <div className="radio-selected" />}
                    </div>
                    <span>{flavor}</span>
                  </button>
                ))}
              </div>
              
              {isPizza && (
                <p className="section-note">
                  Máximo {maxFlavors} sabor{maxFlavors > 1 ? 'es' : ''}
                </p>
              )}
            </div>
          )}

          {/* Extras/Bordas */}
          {availableExtras.length > 0 && (
            <div className="section">
              <div className="section-header">
                <h4>{isPizza ? 'Bordas Irresistíveis:' : isDrink ? 'Tamanho:' : 'Extras:'}</h4>
                {!isDrink && <span className="optional-badge">Opcional</span>}
              </div>
              
              <div className="options-grid">
                {availableExtras.map((extra) => (
                  <button
                    key={extra.name}
                    className={`option-button ${selectedExtras.some(e => e.name === extra.name) ? 'selected' : ''}`}
                    onClick={() => handleExtraToggle(extra)}
                  >
                    <div className="option-radio">
                      {selectedExtras.some(e => e.name === extra.name) && <div className="radio-selected" />}
                    </div>
                    <div className="option-text">
                      <span>{extra.name}</span>
                      {extra.price > 0 && (
                        <span className="option-price">+ {formatPrice(extra.price)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="section">
            <div className="section-header">
              <h4>Observações?</h4>
              <span className="optional-badge">Opcional</span>
            </div>
            
            <textarea
              className="observations-input"
              placeholder="Observações sobre o produto"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="cancel-button"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="add-to-cart-button"
            onClick={handleAddToCart}
            disabled={!isValid}
          >
            <span>+ Adicionar</span>
            <span className="total-price">{formatPrice(calculateTotalPrice())}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
