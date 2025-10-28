'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface LogoGalleryProps {
  onSelectLogo: (logoSvg: string, logoName: string) => void;
  currentLogo?: string;
  primaryColor?: string;
}

interface Logo {
  id: string;
  name: string;
  category: string;
  svg: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
}

const categories: Category[] = [
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
  { id: 'chicken', name: 'Frango', emoji: '🍗' },
];

const logos: Logo[] = [
  // PIZZA - Círculo limpo e moderno
  {
    id: 'pizza-premium',
    name: 'Pizza',
    category: 'pizza',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="70" fill="currentColor" stroke="currentColor" stroke-width="3"/>
      <circle cx="100" cy="100" r="60" fill="white"/>
      <line x1="100" y1="100" x2="150" y2="70" stroke="currentColor" stroke-width="3"/>
      <line x1="100" y1="100" x2="150" y2="130" stroke="currentColor" stroke-width="3"/>
      <line x1="100" y1="100" x2="50" y2="130" stroke="currentColor" stroke-width="3"/>
      <line x1="100" y1="100" x2="50" y2="70" stroke="currentColor" stroke-width="3"/>
      <line x1="100" y1="100" x2="100" y2="40" stroke="currentColor" stroke-width="3"/>
      <line x1="100" y1="100" x2="100" y2="160" stroke="currentColor" stroke-width="3"/>
    </svg>`
  },

  // BURGER - Design Gourmet em camadas
  {
    id: 'burger-gourmet',
    name: 'Burger Gourmet',
    category: 'burger',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="burgerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:currentColor;stop-opacity:1" />
          <stop offset="100%" style="stop-color:currentColor;stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="75" rx="60" ry="20" fill="url(#burgerGrad)"/>
      <rect x="50" y="85" width="100" height="6" rx="3" fill="#FFC107" opacity="0.8"/>
      <rect x="45" y="92" width="110" height="15" rx="3" fill="#4CAF50" opacity="0.6"/>
      <rect x="48" y="108" width="104" height="20" rx="3" fill="currentColor" opacity="0.9"/>
      <rect x="50" y="129" width="100" height="6" rx="3" fill="#FF9800" opacity="0.7"/>
      <ellipse cx="100" cy="140" rx="60" ry="18" fill="url(#burgerGrad)"/>
      <circle cx="70" cy="115" r="3" fill="#FFF" opacity="0.5"/>
      <circle cx="130" cy="115" r="3" fill="#FFF" opacity="0.5"/>
    </svg>`
  },

  // CAFÉ - Xícara elegante com vapor
  {
    id: 'cafe-artisan',
    name: 'Café Artesanal',
    category: 'cafe',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cupGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:currentColor;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:currentColor;stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="155" rx="45" ry="8" fill="currentColor" opacity="0.1"/>
      <path d="M 60 90 L 55 140 Q 55 148 100 148 Q 145 148 145 140 L 140 90 Z" fill="url(#cupGrad)"/>
      <ellipse cx="100" cy="90" rx="40" ry="8" fill="currentColor" opacity="0.3"/>
      <path d="M 140 105 Q 160 105 165 120 Q 160 135 140 135" stroke="currentColor" stroke-width="6" fill="none" opacity="0.7"/>
      <path d="M 75 55 Q 80 45 85 55" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4"/>
      <path d="M 95 50 Q 100 40 105 50" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4"/>
      <path d="M 115 55 Q 120 45 125 55" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4"/>
    </svg>`
  },

  // SUSHI - Design minimalista japonês
  {
    id: 'sushi-zen',
    name: 'Sushi Zen',
    category: 'sushi',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" stroke-width="3" opacity="0.3"/>
      <circle cx="100" cy="100" r="60" fill="currentColor" opacity="0.1"/>
      <ellipse cx="100" cy="105" rx="50" ry="30" fill="white" opacity="0.9"/>
      <ellipse cx="100" cy="100" rx="48" ry="25" fill="#FF6B6B" opacity="0.8"/>
      <rect x="60" y="95" width="80" height="10" rx="2" fill="#2E7D32"/>
      <circle cx="100" cy="100" r="45" fill="none" stroke="currentColor" stroke-width="2" opacity="0.6"/>
      <path d="M 100 60 L 100 70" stroke="currentColor" stroke-width="2" opacity="0.4"/>
      <path d="M 100 130 L 100 140" stroke="currentColor" stroke-width="2" opacity="0.4"/>
    </svg>`
  },

  // TACO - Design mexicano vibrante
  {
    id: 'taco-fiesta',
    name: 'Taco Fiesta',
    category: 'mexican',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tacoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:currentColor;stop-opacity:1" />
          <stop offset="100%" style="stop-color:currentColor;stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="150" rx="55" ry="10" fill="currentColor" opacity="0.1"/>
      <path d="M 55 135 Q 100 65 145 135 L 140 140 Q 100 75 60 140 Z" fill="url(#tacoGrad)"/>
      <path d="M 65 130 Q 100 75 135 130 L 132 133 Q 100 80 68 133 Z" fill="#4CAF50" opacity="0.7"/>
      <ellipse cx="85" cy="105" rx="6" ry="4" fill="#FF6B6B"/>
      <ellipse cx="100" cy="100" rx="7" ry="5" fill="#FF6B6B"/>
      <ellipse cx="115" cy="105" rx="6" ry="4" fill="#FF6B6B"/>
      <rect x="75" y="120" width="50" height="4" rx="2" fill="#8D6E63" opacity="0.6"/>
    </svg>`
  },

  // SORVETE - Design moderno e clean
  {
    id: 'ice-modern',
    name: 'Sorvete Moderno',
    category: 'dessert',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="iceGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:#4ECDC4;stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <path d="M 90 145 L 100 85 L 110 145 Z" fill="currentColor" opacity="0.8"/>
      <circle cx="100" cy="85" r="25" fill="url(#iceGrad1)"/>
      <circle cx="85" cy="70" r="20" fill="currentColor" opacity="0.3"/>
      <circle cx="115" cy="70" r="20" fill="currentColor" opacity="0.2"/>
      <circle cx="100" cy="55" r="15" fill="#FFD93D" opacity="0.6"/>
      <circle cx="95" cy="65" r="2" fill="white"/>
      <circle cx="105" cy="65" r="2" fill="white"/>
      <path d="M 97 72 Q 100 75 103 72" stroke="white" stroke-width="1.5" fill="none"/>
    </svg>`
  },

  // VINHO - Design sofisticado
  {
    id: 'wine-elegant',
    name: 'Vinho Elegante',
    category: 'wine',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:currentColor;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:currentColor;stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="155" rx="35" ry="8" fill="currentColor" opacity="0.2"/>
      <rect x="92" y="115" width="16" height="40" fill="url(#wineGrad)"/>
      <path d="M 75 65 L 70 105 Q 70 115 100 115 Q 130 115 130 105 L 125 65 Z" fill="url(#wineGrad)"/>
      <ellipse cx="100" cy="65" rx="27" ry="8" fill="currentColor" opacity="0.3"/>
      <ellipse cx="100" cy="90" rx="22" ry="12" fill="#FF6B6B" opacity="0.4"/>
      <path d="M 80 70 Q 100 75 120 70" stroke="white" stroke-width="1" opacity="0.2"/>
    </svg>`
  },

  // CHURRASCO - Design robusto
  {
    id: 'bbq-pro',
    name: 'Churrasco Premium',
    category: 'bbq',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bbqGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:currentColor;stop-opacity:1" />
          <stop offset="100%" style="stop-color:currentColor;stop-opacity:0.7" />
        </linearGradient>
      </defs>
      <rect x="50" y="125" width="100" height="25" rx="12" fill="url(#bbqGrad)"/>
      <ellipse cx="100" cy="105" rx="45" ry="18" fill="currentColor" opacity="0.8"/>
      <rect x="96" y="70" width="8" height="45" fill="currentColor" opacity="0.6"/>
      <circle cx="100" cy="65" r="8" fill="currentColor" opacity="0.9"/>
      <path d="M 70 100 L 75 90" stroke="#FF6B6B" stroke-width="3" opacity="0.6"/>
      <path d="M 100 95 L 105 85" stroke="#FF6B6B" stroke-width="3" opacity="0.6"/>
      <path d="M 130 100 L 135 90" stroke="#FF6B6B" stroke-width="3" opacity="0.6"/>
    </svg>`
  },

  // SALADA - Design fresco e clean
  {
    id: 'salad-fresh',
    name: 'Salada Fresca',
    category: 'healthy',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="130" rx="50" ry="12" fill="currentColor" opacity="0.1"/>
      <path d="M 70 110 Q 85 85 100 95 Q 115 85 130 110" fill="#4CAF50" opacity="0.6"/>
      <path d="M 75 105 Q 90 80 100 90 Q 110 80 125 105" fill="currentColor" opacity="0.3"/>
      <circle cx="80" cy="100" r="5" fill="#FF6B6B" opacity="0.7"/>
      <circle cx="120" cy="100" r="5" fill="#FFD93D" opacity="0.7"/>
      <circle cx="100" cy="108" r="4" fill="#FF9800" opacity="0.6"/>
      <path d="M 100 95 L 100 125" stroke="currentColor" stroke-width="3" opacity="0.4"/>
      <ellipse cx="100" cy="125" rx="25" ry="8" fill="currentColor" opacity="0.2"/>
    </svg>`
  },

  // DONUT - Design doce e moderno
  {
    id: 'donut-sweet',
    name: 'Donut Doce',
    category: 'dessert',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:currentColor;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:currentColor;stop-opacity:0.7" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="50" fill="url(#donutGrad)"/>
      <circle cx="100" cy="100" r="20" fill="white"/>
      <circle cx="100" cy="95" r="45" fill="#FFB6D9" opacity="0.6"/>
      <circle cx="100" cy="95" r="18" fill="white"/>
      <rect x="85" y="75" width="6" height="15" rx="3" fill="#FF6B6B" transform="rotate(20 88 82)"/>
      <rect x="108" y="78" width="6" height="15" rx="3" fill="#4ECDC4" transform="rotate(-15 111 85)"/>
      <rect x="95" y="88" width="5" height="12" rx="2" fill="#FFD93D" transform="rotate(45 97 94)"/>
    </svg>`
  },

  // MASSA - Design italiano elegante
  {
    id: 'pasta-italian',
    name: 'Massa Italiana',
    category: 'italian',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pastaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:currentColor;stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:currentColor;stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="135" rx="55" ry="15" fill="url(#pastaGrad)" opacity="0.2"/>
      <ellipse cx="100" cy="115" rx="50" ry="12" fill="url(#pastaGrad)"/>
      <path d="M 65 105 Q 75 80 85 105" stroke="currentColor" stroke-width="5" fill="none" opacity="0.7"/>
      <path d="M 85 105 Q 95 80 105 105" stroke="currentColor" stroke-width="5" fill="none" opacity="0.7"/>
      <path d="M 105 105 Q 115 80 125 105" stroke="currentColor" stroke-width="5" fill="none" opacity="0.7"/>
      <ellipse cx="75" cy="95" rx="8" ry="12" fill="#FF6B6B" opacity="0.6"/>
      <ellipse cx="95" cy="90" rx="9" ry="13" fill="#FF6B6B" opacity="0.6"/>
      <ellipse cx="115" cy="95" rx="8" ry="12" fill="#FF6B6B" opacity="0.6"/>
      <circle cx="85" cy="100" r="3" fill="#4CAF50"/>
      <circle cx="115" cy="100" r="3" fill="#4CAF50"/>
    </svg>`
  },

  // FRANGO - Design apetitoso
  {
    id: 'chicken-crispy',
    name: 'Frango Crocante',
    category: 'chicken',
    svg: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chickenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:currentColor;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:currentColor;stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="145" rx="40" ry="10" fill="currentColor" opacity="0.15"/>
      <ellipse cx="100" cy="115" rx="45" ry="30" fill="url(#chickenGrad)"/>
      <ellipse cx="100" cy="85" rx="35" ry="25" fill="currentColor" opacity="0.8"/>
      <circle cx="90" cy="80" r="3" fill="white"/>
      <circle cx="110" cy="80" r="3" fill="white"/>
      <path d="M 95 92 Q 100 97 105 92" stroke="currentColor" stroke-width="2" fill="none" opacity="0.5"/>
      <path d="M 70 105 L 60 120" stroke="currentColor" stroke-width="8" opacity="0.7"/>
      <path d="M 130 105 L 140 120" stroke="currentColor" stroke-width="8" opacity="0.7"/>
      <ellipse cx="65" cy="120" rx="8" ry="12" fill="currentColor" opacity="0.6"/>
      <ellipse cx="135" cy="120" rx="8" ry="12" fill="currentColor" opacity="0.6"/>
    </svg>`
  }
];

export default function LogoGalleryPro({ onSelectLogo, currentLogo, primaryColor = '#d32f2f' }: LogoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredLogos = selectedCategory === 'all' 
    ? logos 
    : logos.filter(logo => logo.category === selectedCategory);

  const handleLogoSelect = (logo: Logo) => {
    // Substituir currentColor pela cor primária
    const customizedSvg = logo.svg.replace(/currentColor/g, primaryColor);
    onSelectLogo(customizedSvg, logo.name);
  };

  return (
    <div className="space-y-6">
      {/* Filtros por Categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="text-sm transition-all hover:scale-105"
          >
            <span className="mr-1.5">{category.emoji}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* Grid de Logos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredLogos.map((logo) => {
          const customizedSvg = logo.svg.replace(/currentColor/g, primaryColor);
          const isSelected = currentLogo && currentLogo.includes(logo.id);
          
          return (
            <button
              key={logo.id}
              onClick={() => handleLogoSelect(logo)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300
                hover:scale-105 hover:shadow-lg
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              {/* Logo Preview */}
              <div 
                className="w-full h-24 flex items-center justify-center mb-3"
                style={{ color: primaryColor }}
                dangerouslySetInnerHTML={{ __html: customizedSvg }}
              />
              
              {/* Nome do Logo */}
              <p className={`
                text-sm font-medium text-center transition-colors
                ${isSelected ? 'text-blue-700' : 'text-gray-700'}
              `}>
                {logo.name}
              </p>

              {/* Badge de Selecionado */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-lg">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Mensagem caso não haja resultados */}
      {filteredLogos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum logo encontrado nesta categoria</p>
        </div>
      )}

      {/* Dica */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800 text-center">
          <span className="font-semibold">💡 Dica:</span> Os logos se adaptam automaticamente à cor primária do seu restaurante!
        </p>
      </div>
    </div>
  );
}
