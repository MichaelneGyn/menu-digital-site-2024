'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ClientMenuItem } from '@/lib/restaurant';
import { ProductCustomization } from './product-card';

interface ProductCustomizationModalProps {
  item: ClientMenuItem;
  onAdd: (customization: ProductCustomization) => void;
  onClose: () => void;
}

interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

interface CustomizationGroup {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections?: number;
  sortOrder: number;
  isActive: boolean;
  options: CustomizationOption[];
}

export default function ProductCustomizationModalDynamic({ item, onAdd, onClose }: ProductCustomizationModalProps) {
  const [groups, setGroups] = useState<CustomizationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [observations, setObservations] = useState('');

  useEffect(() => {
    fetchCustomizations();
  }, [item.id]);

  const fetchCustomizations = async () => {
    try {
      const response = await fetch(`/api/menu-items/${item.id}/customizations`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
        
        // Inicializar seleções vazias para cada grupo
        const initialSelections: Record<string, string[]> = {};
        data.forEach((group: CustomizationGroup) => {
          initialSelections[group.id] = [];
        });
        setSelections(initialSelections);
      }
    } catch (error) {
      console.error('Error fetching customizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionToggle = (groupId: string, optionId: string, maxSelections?: number) => {
    setSelections((prev) => {
      const currentSelections = prev[groupId] || [];
      
      if (currentSelections.includes(optionId)) {
        // Remover seleção
        return {
          ...prev,
          [groupId]: currentSelections.filter((id) => id !== optionId),
        };
      } else {
        // Adicionar seleção
        if (maxSelections && currentSelections.length >= maxSelections) {
          // Se atingiu o máximo, substituir a última seleção
          if (maxSelections === 1) {
            return { ...prev, [groupId]: [optionId] };
          }
          return prev; // Não adicionar se já atingiu o máximo
        }
        return {
          ...prev,
          [groupId]: [...currentSelections, optionId],
        };
      }
    });
  };

  const calculateTotalPrice = () => {
    let total = Number(item.price);
    
    groups.forEach((group) => {
      const selectedOptions = selections[group.id] || [];
      selectedOptions.forEach((optionId) => {
        const option = group.options.find((opt) => opt.id === optionId);
        if (option) {
          total += option.price;
        }
      });
    });
    
    return total;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const isValid = () => {
    // Verificar se todos os grupos obrigatórios foram preenchidos
    return groups.every((group) => {
      if (!group.isRequired) return true;
      const selectedCount = (selections[group.id] || []).length;
      return selectedCount >= group.minSelections;
    });
  };

  const handleAddToCart = () => {
    // Montar dados de customização
    const customizationData: any = {
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
        options: (selections[group.id] || []).map((optionId) => {
          const option = group.options.find((opt) => opt.id === optionId);
          return option ? { id: option.id, name: option.name, price: option.price } : null;
        }).filter(Boolean),
      })).filter((g) => g.options.length > 0),
      observations,
      totalPrice: calculateTotalPrice(),
    };

    // Criar customização no formato antigo para compatibilidade
    const flavors: string[] = [];
    const extras: Array<{ name: string; price: number }> = [];
    
    groups.forEach((group) => {
      const selectedOptions = selections[group.id] || [];
      selectedOptions.forEach((optionId) => {
        const option = group.options.find((opt) => opt.id === optionId);
        if (option) {
          if (option.price === 0) {
            flavors.push(option.name);
          } else {
            extras.push({ name: option.name, price: option.price });
          }
        }
      });
    });

    const customization: ProductCustomization = {
      flavors,
      extras,
      observations,
      totalPrice: calculateTotalPrice(),
    };

    onAdd(customization);
  };

  if (loading) {
    return (
      <div className="customization-modal-overlay" onClick={onClose}>
        <div className="customization-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Carregando opções...</h3>
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="modal-content" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Se não tem customizações, adicionar diretamente
  if (groups.length === 0) {
    const customization: ProductCustomization = {
      flavors: [],
      extras: [],
      observations: '',
      totalPrice: Number(item.price),
    };
    onAdd(customization);
    return null;
  }

  return (
    <div className="customization-modal-overlay" onClick={onClose}>
      <div className="customization-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Personalize seu {item.name}</h3>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {groups.map((group) => (
            <div key={group.id} className="section">
              <div className="section-header">
                <h4>{group.name}</h4>
                <span className={group.isRequired ? 'required-badge' : 'optional-badge'}>
                  {group.isRequired ? 'Obrigatório' : 'Opcional'}
                </span>
              </div>

              {group.description && (
                <p className="section-note">{group.description}</p>
              )}

              <div className="options-grid">
                {group.options.map((option) => {
                  const isSelected = (selections[group.id] || []).includes(option.id);
                  const isDisabled = Boolean(
                    !isSelected &&
                    group.maxSelections &&
                    (selections[group.id] || []).length >= group.maxSelections
                  );

                  return (
                    <button
                      key={option.id}
                      className={`option-button ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => handleOptionToggle(group.id, option.id, group.maxSelections || undefined)}
                      disabled={isDisabled}
                    >
                      <div className="option-radio">
                        {isSelected && <div className="radio-selected" />}
                      </div>
                      <div className="option-text">
                        <span>{option.name}</span>
                        {option.price > 0 && (
                          <span className="option-price">+ {formatPrice(option.price)}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {group.maxSelections && (
                <p className="section-note">
                  Máximo {group.maxSelections} {group.maxSelections > 1 ? 'opções' : 'opção'}
                </p>
              )}
            </div>
          ))}

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
          <button className="cancel-button" onClick={onClose} type="button">
            Cancelar
          </button>
          <button
            className="add-to-cart-button"
            onClick={handleAddToCart}
            disabled={!isValid()}
          >
            <span>+ Adicionar</span>
            <span className="total-price">{formatPrice(calculateTotalPrice())}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
