// Google Tag Manager / Google Ads Conversion Tracking

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Função para enviar eventos de conversão
export const trackConversion = (eventName: string, value?: number, currency: string = 'BRL') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: 'AW-11137844448/' + eventName,
      value: value,
      currency: currency,
    });
    console.log('🎯 Conversão rastreada:', eventName, value);
  }
};

// Eventos específicos
export const GTMEvents = {
  // Quando usuário se cadastra
  signup: () => {
    trackConversion('signup', 0);
  },

  // Quando usuário faz login
  login: () => {
    trackConversion('login', 0);
  },

  // Quando usuário inicia teste grátis
  startTrial: () => {
    trackConversion('start_trial', 0);
  },

  // Quando usuário assina (conversão principal)
  purchase: (value: number) => {
    trackConversion('purchase', value);
  },

  // Quando usuário adiciona item ao carrinho
  addToCart: (value: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        value: value,
        currency: 'BRL',
      });
    }
  },

  // Quando usuário visualiza página de preços
  viewPricing: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_pricing', {});
    }
  },

  // Quando usuário clica no botão de teste grátis
  clickFreeTrial: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click_free_trial', {});
    }
  },
};
