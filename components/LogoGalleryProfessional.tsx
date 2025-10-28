'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Check, Pizza, Sandwich, Coffee, Fish, Salad, IceCream, Wine, 
  Flame, Leaf, Utensils, ChefHat, Store, Heart, Star, CircleDot,
  Soup, Cake, Cookie, Croissant, Apple, Cherry, Beef, Drumstick
} from 'lucide-react';

interface LogoGalleryProps {
  onSelectLogo: (logoSvg: string, logoName: string) => void;
  currentLogo?: string;
  primaryColor?: string;
}

const categories = [
  { id: 'all', name: 'Todos', emoji: '🍽️' },
  { id: 'pizza', name: 'Pizza', emoji: '🍕' },
  { id: 'burger', name: 'Burger', emoji: '🍔' },
  { id: 'cafe', name: 'Café', emoji: '☕' },
  { id: 'sushi', name: 'Sushi', emoji: '🍣' },
  { id: 'mexican', name: 'Mexicano', emoji: '🌮' },
  { id: 'dessert', name: 'Sobremesa', emoji: '🍰' },
  { id: 'wine', name: 'Bebidas', emoji: '🍷' },
  { id: 'bbq', name: 'Churrasco', emoji: '🥩' },
  { id: 'healthy', name: 'Saudável', emoji: '🥗' },
  { id: 'italian', name: 'Italiano', emoji: '🍝' },
];

// LOGOS COM ÍCONES RECONHECÍVEIS (Lucide Icons)
const logos = [
  { id: 'pizza', name: 'Pizza', category: 'pizza', icon: Pizza },
  { id: 'burger', name: 'Hambúrguer', category: 'burger', icon: Sandwich },
  { id: 'coffee', name: 'Café', category: 'cafe', icon: Coffee },
  { id: 'sushi', name: 'Sushi', category: 'sushi', icon: Fish },
  { id: 'salad', name: 'Salada', category: 'healthy', icon: Salad },
  { id: 'ice-cream', name: 'Sorvete', category: 'dessert', icon: IceCream },
  { id: 'wine', name: 'Vinho', category: 'wine', icon: Wine },
  { id: 'bbq', name: 'Churrasco', category: 'bbq', icon: Flame },
  { id: 'leaf', name: 'Orgânico', category: 'healthy', icon: Leaf },
  { id: 'utensils', name: 'Restaurante', category: 'all', icon: Utensils },
  { id: 'chef-hat', name: 'Chef', category: 'all', icon: ChefHat },
  { id: 'store', name: 'Loja', category: 'all', icon: Store },
  { id: 'heart', name: 'Favorito', category: 'all', icon: Heart },
  { id: 'star', name: 'Premium', category: 'all', icon: Star },
  { id: 'soup', name: 'Sopa', category: 'all', icon: Soup },
  { id: 'cake', name: 'Bolo', category: 'dessert', icon: Cake },
  { id: 'cookie', name: 'Cookie', category: 'dessert', icon: Cookie },
  { id: 'croissant', name: 'Padaria', category: 'cafe', icon: Croissant },
  { id: 'apple', name: 'Frutas', category: 'healthy', icon: Apple },
  { id: 'cherry', name: 'Sobremesa', category: 'dessert', icon: Cherry },
  { id: 'beef', name: 'Carne', category: 'bbq', icon: Beef },
  { id: 'chicken', name: 'Frango', category: 'chicken', icon: Drumstick },
  { id: 'circle', name: 'Círculo', category: 'all', icon: CircleDot },
];

export default function LogoGalleryProfessional({ onSelectLogo, currentLogo, primaryColor = '#d32f2f' }: LogoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredLogos = selectedCategory === 'all' 
    ? logos 
    : logos.filter(logo => logo.category === selectedCategory || logo.category === 'all');

  const handleLogoSelect = (logo: any) => {
    // Criar um container temporário para renderizar o ícone
    const tempDiv = document.createElement('div');
    const root = document.createElement('div');
    tempDiv.appendChild(root);
    
    // Renderizar o ícone Lucide
    const IconComponent = logo.icon;
    
    // Criar SVG manualmente baseado no ícone selecionado
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="${primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#${logo.id}"/></svg>`;
    
    onSelectLogo(svgString, logo.name);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="mr-1">{cat.emoji}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Grid de Logos */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredLogos.map((logo) => {
          const IconComponent = logo.icon;
          const isSelected = currentLogo && currentLogo.includes(logo.id);
          
          return (
            <button
              key={logo.id}
              onClick={() => handleLogoSelect(logo)}
              className={`
                relative p-6 rounded-xl border-2 transition-all
                hover:scale-105 hover:shadow-lg
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="w-full h-20 flex items-center justify-center">
                <IconComponent 
                  size={48} 
                  strokeWidth={2}
                  style={{ color: primaryColor }}
                />
              </div>
              
              <p className="text-xs font-medium text-center mt-3 text-gray-700">
                {logo.name}
              </p>

              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-lg">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {filteredLogos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Nenhum logo encontrado nesta categoria.
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡</span> Logos minimalistas que se adaptam à sua cor primária
        </p>
      </div>
    </div>
  );
}
