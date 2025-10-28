'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

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
  { id: 'dessert', name: 'Sobremesa', emoji: '🍰' },
  { id: 'wine', name: 'Bebidas', emoji: '🍷' },
  { id: 'bbq', name: 'Churrasco', emoji: '🥩' },
  { id: 'healthy', name: 'Saudável', emoji: '🥗' },
];

// LOGOS FLAT DESIGN COLORIDOS E MODERNOS
const logos = [
  {
    id: 'pizza-flat',
    name: 'Pizza',
    category: 'pizza',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pizzaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F7931E;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#pizzaGrad1)"/>
      <circle cx="50" cy="50" r="38" fill="#FFC857"/>
      <circle cx="35" cy="40" r="6" fill="#E63946"/>
      <circle cx="55" cy="38" r="5" fill="#E63946"/>
      <circle cx="45" cy="52" r="6" fill="#E63946"/>
      <circle cx="60" cy="52" r="5" fill="#E63946"/>
      <circle cx="50" cy="65" r="5" fill="#E63946"/>
      <circle cx="40" cy="60" r="4" fill="#06D6A0"/>
      <circle cx="58" cy="62" r="4" fill="#06D6A0"/>
    </svg>`
  },
  {
    id: 'burger-flat',
    name: 'Hambúrguer',
    category: 'burger',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="burgerTop" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FFC857;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F4A261;stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="35" rx="35" ry="15" fill="url(#burgerTop)"/>
      <rect x="20" y="42" width="60" height="8" fill="#06D6A0" rx="2"/>
      <rect x="18" y="52" width="64" height="12" fill="#8D5524" rx="2"/>
      <rect x="20" y="66" width="60" height="8" fill="#FFC857" rx="2"/>
      <ellipse cx="50" cy="78" rx="35" ry="14" fill="url(#burgerTop)"/>
      <circle cx="30" cy="38" r="2" fill="#E8C07D"/>
      <circle cx="45" cy="36" r="2" fill="#E8C07D"/>
      <circle cx="60" cy="38" r="2" fill="#E8C07D"/>
    </svg>`
  },
  {
    id: 'coffee-flat',
    name: 'Café',
    category: 'cafe',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="coffeeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#8D5524;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#5D3A1A;stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="75" rx="30" ry="5" fill="#D4A574" opacity="0.3"/>
      <path d="M 30 40 L 28 65 Q 28 72 50 72 Q 72 72 72 65 L 70 40 Z" fill="url(#coffeeGrad)"/>
      <ellipse cx="50" cy="40" rx="20" ry="5" fill="#3E2723"/>
      <path d="M 72 48 Q 80 48 82 55 Q 80 62 72 62" fill="none" stroke="#8D5524" stroke-width="4"/>
      <path d="M 40 25 Q 43 20 46 25" stroke="#A67C52" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 50 23 Q 53 18 56 23" stroke="#A67C52" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'sushi-flat',
    name: 'Sushi',
    category: 'sushi',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="70" rx="32" ry="8" fill="#2C2C2C"/>
      <ellipse cx="50" cy="55" rx="28" ry="22" fill="#F8F8F8"/>
      <ellipse cx="50" cy="52" rx="26" ry="18" fill="#FF6B6B"/>
      <rect x="25" y="50" width="50" height="8" fill="#1B4332" rx="1"/>
      <ellipse cx="50" cy="48" rx="20" ry="5" fill="#FFB3BA"/>
      <circle cx="45" cy="48" r="2" fill="#FF8A8A"/>
      <circle cx="55" cy="48" r="2" fill="#FF8A8A"/>
    </svg>`
  },
  {
    id: 'taco-flat',
    name: 'Taco',
    category: 'mexican',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tacoShell" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FFC857;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#F4A261;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M 25 70 Q 50 30 75 70 L 72 75 Q 50 38 28 75 Z" fill="url(#tacoShell)"/>
      <path d="M 33 65 Q 50 42 67 65 L 65 68 Q 50 48 35 68 Z" fill="#06D6A0"/>
      <ellipse cx="42" cy="55" rx="5" ry="3" fill="#E63946"/>
      <ellipse cx="50" cy="50" rx="6" ry="4" fill="#E63946"/>
      <ellipse cx="58" cy="55" rx="5" ry="3" fill="#E63946"/>
      <rect x="38" y="62" width="24" height="4" fill="#8D5524" rx="2"/>
      <circle cx="44" cy="58" r="2" fill="#FFC857"/>
      <circle cx="56" cy="58" r="2" fill="#FFC857"/>
    </svg>`
  },
  {
    id: 'ice-cream-flat',
    name: 'Sorvete',
    category: 'dessert',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cone" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#F4A261;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#D08A50;stop-opacity:1" />
        </linearGradient>
      </defs>
      <path d="M 38 45 L 50 75 L 62 45 Z" fill="url(#cone)"/>
      <line x1="42" y1="52" x2="38" y2="45" stroke="#C77A3F" stroke-width="1.5"/>
      <line x1="46" y1="58" x2="42" y2="52" stroke="#C77A3F" stroke-width="1.5"/>
      <line x1="50" y1="64" x2="46" y2="58" stroke="#C77A3F" stroke-width="1.5"/>
      <circle cx="50" cy="38" r="16" fill="#FFB3D9"/>
      <circle cx="42" cy="30" r="13" fill="#FF69B4"/>
      <circle cx="58" cy="30" r="13" fill="#87CEEB"/>
      <ellipse cx="48" cy="25" rx="4" ry="2" fill="#FFF" opacity="0.6"/>
    </svg>`
  },
  {
    id: 'wine-flat',
    name: 'Vinho',
    category: 'wine',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#8B2635;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#5D1725;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="43" y="58" width="14" height="18" fill="#8B4513" rx="2"/>
      <ellipse cx="50" cy="76" rx="18" ry="4" fill="#6B3410"/>
      <path d="M 35 30 L 32 50 Q 32 58 50 58 Q 68 58 68 50 L 65 30 Z" fill="url(#wineGrad)"/>
      <ellipse cx="50" cy="30" rx="15" ry="4" fill="#A63446"/>
      <ellipse cx="50" cy="42" rx="12" ry="8" fill="#621827" opacity="0.5"/>
    </svg>`
  },
  {
    id: 'bbq-flat',
    name: 'Churrasco',
    category: 'bbq',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="meatGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#8B4513;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#A0522D;stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="72" rx="30" ry="6" fill="#5D3A1A" opacity="0.3"/>
      <ellipse cx="50" cy="52" rx="28" ry="16" fill="url(#meatGrad)"/>
      <rect x="47" y="35" width="6" height="22" fill="#8B4513"/>
      <circle cx="50" cy="32" r="5" fill="#A0522D"/>
      <path d="M 32 48 L 35 42" stroke="#FF6B35" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 50 45 L 53 39" stroke="#FF6B35" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 68 48 L 71 42" stroke="#FF6B35" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="42" cy="52" rx="4" ry="3" fill="#6B3410"/>
      <ellipse cx="58" cy="52" rx="4" ry="3" fill="#6B3410"/>
    </svg>`
  },
  {
    id: 'salad-flat',
    name: 'Salada',
    category: 'healthy',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bowlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#E8E8E8;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#C0C0C0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="72" rx="32" ry="6" fill="#B0B0B0" opacity="0.3"/>
      <path d="M 25 52 Q 25 68 50 68 Q 75 68 75 52" fill="url(#bowlGrad)"/>
      <ellipse cx="50" cy="52" rx="25" ry="6" fill="#D8D8D8"/>
      <circle cx="40" cy="45" r="8" fill="#06D6A0"/>
      <circle cx="55" cy="42" r="9" fill="#06D6A0"/>
      <circle cx="48" cy="48" r="7" fill="#52B788"/>
      <circle cx="60" cy="50" r="6" fill="#52B788"/>
      <circle cx="45" cy="38" r="5" fill="#E63946"/>
      <circle cx="58" cy="48" r="4" fill="#FFC857"/>
      <circle cx="38" cy="50" r="4" fill="#FFC857"/>
    </svg>`
  },
  {
    id: 'cake-flat',
    name: 'Bolo',
    category: 'dessert',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FFB3D9;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF69B4;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="28" y="55" width="44" height="18" fill="url(#cakeGrad)" rx="2"/>
      <rect x="30" y="48" width="40" height="10" fill="#FF69B4" rx="2"/>
      <path d="M 32 48 Q 35 45 38 48" fill="none" stroke="#FFE5F0" stroke-width="2"/>
      <path d="M 46 48 Q 49 45 52 48" fill="none" stroke="#FFE5F0" stroke-width="2"/>
      <path d="M 60 48 Q 63 45 66 48" fill="none" stroke="#FFE5F0" stroke-width="2"/>
      <rect x="48" y="35" width="4" height="15" fill="#FF6B6B" rx="2"/>
      <ellipse cx="50" cy="33" rx="3" ry="4" fill="#FFD700"/>
      <circle cx="36" cy="62" r="3" fill="#E63946"/>
      <circle cx="50" cy="64" r="3" fill="#E63946"/>
      <circle cx="64" cy="62" r="3" fill="#E63946"/>
    </svg>`
  },
  {
    id: 'donut-flat',
    name: 'Donut',
    category: 'dessert',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F4A261;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E76F51;stop-opacity:1" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="72" rx="35" ry="6" fill="#C77A3F" opacity="0.3"/>
      <circle cx="50" cy="50" r="32" fill="url(#donutGrad)"/>
      <circle cx="50" cy="50" r="15" fill="#FFF"/>
      <circle cx="50" cy="48" r="28" fill="#FFB3D9" opacity="0.9"/>
      <circle cx="50" cy="48" r="14" fill="#FFF"/>
      <rect x="38" y="35" width="4" height="8" fill="#FF6B6B" rx="2" transform="rotate(20 40 39)"/>
      <rect x="58" y="38" width="4" height="8" fill="#06D6A0" rx="2" transform="rotate(-20 60 42)"/>
      <rect x="45" y="32" width="4" height="8" fill="#FFC857" rx="2" transform="rotate(0 47 36)"/>
      <rect x="52" y="32" width="4" height="8" fill="#87CEEB" rx="2" transform="rotate(0 54 36)"/>
    </svg>`
  },
  {
    id: 'utensils-flat',
    name: 'Restaurante',
    category: 'all',
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#C0C0C0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#E8E8E8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="32" y="28" width="4" height="48" fill="url(#silverGrad)" rx="2"/>
      <rect x="28" y="28" width="4" height="20" fill="url(#silverGrad)" rx="2"/>
      <rect x="36" y="28" width="4" height="20" fill="url(#silverGrad)" rx="2"/>
      <path d="M 60 28 Q 60 35 60 42 Q 60 48 64 48 L 64 76" fill="url(#silverGrad)" stroke="url(#silverGrad)" stroke-width="4"/>
      <path d="M 58 28 L 70 40" stroke="url(#silverGrad)" stroke-width="4" stroke-linecap="round"/>
    </svg>`
  },
];

export default function LogoGalleryFlat({ onSelectLogo, currentLogo, primaryColor = '#d32f2f' }: LogoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredLogos = selectedCategory === 'all' 
    ? logos 
    : logos.filter(logo => logo.category === selectedCategory || logo.category === 'all');

  const handleLogoSelect = (logo: any) => {
    // Limpar o SVG e garantir que está bem formatado
    const cleanSvg = logo.svg.trim();
    
    // Debug
    console.log('🎨 Logo selecionado:', logo.name);
    console.log('📦 SVG original:', cleanSvg.substring(0, 100) + '...');
    
    onSelectLogo(cleanSvg, logo.name);
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
            <span className="mr-1.5 text-base">{cat.emoji}</span>
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Grid de Logos */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredLogos.map((logo) => {
          const isSelected = currentLogo && currentLogo.includes(logo.id);
          
          return (
            <button
              key={logo.id}
              onClick={() => handleLogoSelect(logo)}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                hover:scale-105 hover:shadow-lg bg-white
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div 
                className="w-full h-20 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: logo.svg }}
              />
              
              <p className={`text-xs font-medium text-center mt-2 ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
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

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">🎨</span> Logos coloridos em estilo flat design moderno
        </p>
      </div>
    </div>
  );
}
