'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  formatPrice: (value: number) => string;
  currency: string;
  currencySymbol: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    // Hero
    'hero.title': 'Sistema de delivery completo para seu restaurante',
    'hero.subtitle': 'Receba pedidos online, gerencie seu cardápio e aumente suas vendas. Sem comissão por pedido.',
    'hero.cta': 'Testar 30 dias grátis',
    'hero.demo': 'Ver demonstração',
    'hero.noCard': 'Sem cartão de crédito',
    'hero.cancelAnytime': 'Cancele quando quiser',
    
    // Features
    'features.title': 'Tudo que você precisa em um só lugar',
    'features.subtitle': 'Ferramentas profissionais para gerenciar seu restaurante',
    'features.menu.title': 'Cardápio Digital',
    'features.menu.desc': 'Cardápio online personalizável com fotos, descrições e preços. Atualize em tempo real.',
    'features.orders.title': 'Gestão de Pedidos',
    'features.orders.desc': 'Receba e gerencie pedidos em tempo real. Kitchen display e notificações automáticas.',
    'features.qr.title': 'QR Code para Mesas',
    'features.qr.desc': 'Clientes fazem pedidos direto da mesa escaneando o QR Code. Sem aplicativo.',
    'features.reports.title': 'Relatórios e CMV',
    'features.reports.desc': 'Análise completa de vendas, custos e lucratividade. Tome decisões baseadas em dados.',
    'features.coupons.title': 'Cupons de Desconto',
    'features.coupons.desc': 'Crie promoções e cupons personalizados para aumentar suas vendas.',
    'features.noCommission.title': 'Sem Comissão',
    'features.noCommission.desc': 'Pague apenas R$ 69,90/mês. Zero taxa por pedido. Todo lucro é seu.',
    
    // Pricing
    'pricing.title': 'Compare os custos',
    'pricing.subtitle': 'Veja quanto você economiza vs iFood',
    'pricing.plan': 'Plano Completo',
    'pricing.trial': '30 dias grátis para testar',
    'pricing.cta': 'Começar agora',
    
    // CTA
    'cta.title': 'Pronto para começar?',
    'cta.subtitle': 'Teste grátis por 30 dias. Sem cartão de crédito. Cancele quando quiser.',
    'cta.button': 'Começar teste grátis',
  },
  en: {
    // Hero
    'hero.title': 'Complete delivery system for your restaurant',
    'hero.subtitle': 'Receive online orders, manage your menu and increase your sales. No commission per order.',
    'hero.cta': 'Try 30 days free',
    'hero.demo': 'Watch demo',
    'hero.noCard': 'No credit card required',
    'hero.cancelAnytime': 'Cancel anytime',
    
    // Features
    'features.title': 'Everything you need in one place',
    'features.subtitle': 'Professional tools to manage your restaurant',
    'features.menu.title': 'Digital Menu',
    'features.menu.desc': 'Customizable online menu with photos, descriptions and prices. Update in real time.',
    'features.orders.title': 'Order Management',
    'features.orders.desc': 'Receive and manage orders in real time. Kitchen display and automatic notifications.',
    'features.qr.title': 'QR Code for Tables',
    'features.qr.desc': 'Customers order directly from the table by scanning the QR Code. No app needed.',
    'features.reports.title': 'Reports & CMV',
    'features.reports.desc': 'Complete analysis of sales, costs and profitability. Make data-driven decisions.',
    'features.coupons.title': 'Discount Coupons',
    'features.coupons.desc': 'Create custom promotions and coupons to increase your sales.',
    'features.noCommission.title': 'No Commission',
    'features.noCommission.desc': 'Pay only $69.90/month. Zero fee per order. All profit is yours.',
    
    // Pricing
    'pricing.title': 'Compare costs',
    'pricing.subtitle': 'See how much you save vs iFood',
    'pricing.plan': 'Complete Plan',
    'pricing.trial': '30 days free trial',
    'pricing.cta': 'Start now',
    
    // CTA
    'cta.title': 'Ready to start?',
    'cta.subtitle': 'Free trial for 30 days. No credit card. Cancel anytime.',
    'cta.button': 'Start free trial',
  },
  es: {
    // Hero
    'hero.title': 'Sistema de delivery completo para tu restaurante',
    'hero.subtitle': 'Recibe pedidos online, gestiona tu menú y aumenta tus ventas. Sin comisión por pedido.',
    'hero.cta': 'Probar 30 días gratis',
    'hero.demo': 'Ver demostración',
    'hero.noCard': 'Sin tarjeta de crédito',
    'hero.cancelAnytime': 'Cancela cuando quieras',
    
    // Features
    'features.title': 'Todo lo que necesitas en un solo lugar',
    'features.subtitle': 'Herramientas profesionales para gestionar tu restaurante',
    'features.menu.title': 'Menú Digital',
    'features.menu.desc': 'Menú online personalizable con fotos, descripciones y precios. Actualiza en tiempo real.',
    'features.orders.title': 'Gestión de Pedidos',
    'features.orders.desc': 'Recibe y gestiona pedidos en tiempo real. Kitchen display y notificaciones automáticas.',
    'features.qr.title': 'Código QR para Mesas',
    'features.qr.desc': 'Los clientes hacen pedidos directamente desde la mesa escaneando el código QR. Sin aplicación.',
    'features.reports.title': 'Informes y CMV',
    'features.reports.desc': 'Análisis completo de ventas, costos y rentabilidad. Toma decisiones basadas en datos.',
    'features.coupons.title': 'Cupones de Descuento',
    'features.coupons.desc': 'Crea promociones y cupones personalizados para aumentar tus ventas.',
    'features.noCommission.title': 'Sin Comisión',
    'features.noCommission.desc': 'Paga solo R$ 69,90/mes. Cero tarifa por pedido. Toda la ganancia es tuya.',
    
    // Pricing
    'pricing.title': 'Compara los costos',
    'pricing.subtitle': 'Mira cuánto ahorras vs iFood',
    'pricing.plan': 'Plan Completo',
    'pricing.trial': '30 días gratis para probar',
    'pricing.cta': 'Comenzar ahora',
    
    // CTA
    'cta.title': '¿Listo para comenzar?',
    'cta.subtitle': 'Prueba gratis por 30 días. Sin tarjeta de crédito. Cancela cuando quieras.',
    'cta.button': 'Comenzar prueba gratis',
  },
};

// Taxas de conversão aproximadas (você pode atualizar com API real depois)
const exchangeRates = {
  pt: { rate: 1, symbol: 'R$', currency: 'BRL' },
  en: { rate: 0.20, symbol: '$', currency: 'USD' }, // 1 BRL = ~0.20 USD
  es: { rate: 0.18, symbol: '€', currency: 'EUR' }  // 1 BRL = ~0.18 EUR
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    // Carregar idioma do localStorage
    const saved = localStorage.getItem('language') as Language;
    if (saved && ['pt', 'en', 'es'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.pt] || key;
  };

  const formatPrice = (valueInBRL: number): string => {
    const { rate, symbol } = exchangeRates[language];
    const convertedValue = valueInBRL * rate;
    
    if (language === 'pt') {
      return `${symbol} ${convertedValue.toFixed(2).replace('.', ',')}`;
    } else {
      return `${symbol}${convertedValue.toFixed(2)}`;
    }
  };

  const currency = exchangeRates[language].currency;
  const currencySymbol = exchangeRates[language].symbol;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatPrice, currency, currencySymbol }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
