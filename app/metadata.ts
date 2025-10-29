import { Metadata } from 'next';

export const baseMetadata: Metadata = {
  metadataBase: new URL('https://virtualcardapio.com.br'),
  title: {
    default: 'Cardápio Digital para Restaurantes | Menu Online com QR Code - Teste Grátis',
    template: '%s | Virtual Cardápio',
  },
  description: 'Crie seu cardápio digital em minutos! Sistema completo com QR Code, pedidos online, relatórios de lucro e muito mais. Teste grátis por 30 dias. Aumente suas vendas hoje!',
  keywords: [
    'cardápio digital',
    'menu digital',
    'cardápio online',
    'qr code restaurante',
    'pedidos online',
    'sistema para restaurante',
    'menu qr code',
    'cardápio digital grátis',
    'cardápio virtual',
    'menu online grátis',
    'sistema de pedidos',
    'delivery online',
    'gestão de restaurante',
    'cmv restaurante',
    'lucro restaurante',
  ],
  authors: [{ name: 'Virtual Cardápio', url: 'https://virtualcardapio.com.br' }],
  creator: 'Virtual Cardápio',
  publisher: 'Virtual Cardápio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://virtualcardapio.com.br',
    siteName: 'Virtual Cardápio',
    title: 'Cardápio Digital para Restaurantes | Menu Online com QR Code',
    description: 'Crie seu cardápio digital em minutos! Sistema completo com QR Code, pedidos online e relatórios. Teste grátis por 30 dias.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Virtual Cardápio - Sistema de Cardápio Digital para Restaurantes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cardápio Digital para Restaurantes | Menu Online com QR Code',
    description: 'Crie seu cardápio digital em minutos! Sistema completo com QR Code, pedidos online e relatórios. Teste grátis.',
    images: ['/og-image.jpg'],
    creator: '@virtualcardapio',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://virtualcardapio.com.br',
  },
  verification: {
    google: 'google4b8f3a2228e927e8',
  },
  category: 'technology',
};

// Schema.org JSON-LD para SEO
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Virtual Cardápio',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'BRL',
    priceValidUntil: '2025-12-31',
    availability: 'https://schema.org/InStock',
    description: 'Teste grátis por 30 dias',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '127',
    bestRating: '5',
    worstRating: '1',
  },
  description: 'Sistema completo de cardápio digital para restaurantes com QR Code, pedidos online e relatórios de lucro.',
  url: 'https://virtualcardapio.com.br',
  image: 'https://virtualcardapio.com.br/og-image.jpg',
  author: {
    '@type': 'Organization',
    name: 'Virtual Cardápio',
    url: 'https://virtualcardapio.com.br',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Virtual Cardápio',
    logo: {
      '@type': 'ImageObject',
      url: 'https://virtualcardapio.com.br/logo.png',
    },
  },
  featureList: [
    'Cardápio Digital com QR Code',
    'Pedidos Online',
    'Relatórios de Lucro (CMV)',
    'Gestão de Mesas',
    'Sistema de Upsell',
    'Cupons de Desconto',
    'Painel de Comandas',
    'Tutoriais em Vídeo',
  ],
};

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Início',
      item: 'https://virtualcardapio.com.br',
    },
  ],
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Como funciona o cardápio digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'O cardápio digital funciona através de um QR Code que seus clientes escaneiam com o celular. Ao escanear, eles acessam seu menu completo com fotos, descrições e preços, podendo fazer pedidos diretamente pelo celular.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quanto custa o sistema de cardápio digital?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oferecemos teste grátis por 30 dias. Após o período de teste, os planos começam a partir de R$ 49,90/mês com todos os recursos incluídos.',
      },
    },
    {
      '@type': 'Question',
      name: 'Preciso de conhecimento técnico para usar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Não! Nosso sistema é super intuitivo e fácil de usar. Você consegue criar seu cardápio completo em menos de 10 minutos, sem precisar de conhecimentos técnicos.',
      },
    },
    {
      '@type': 'Question',
      name: 'Posso calcular o lucro dos meus produtos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim! Temos um sistema completo de cálculo de CMV (Custo da Mercadoria Vendida) onde você cadastra o custo de cada produto e o sistema calcula automaticamente sua margem de lucro e ROI.',
      },
    },
    {
      '@type': 'Question',
      name: 'O sistema aceita pedidos online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim! Os clientes podem fazer pedidos diretamente pelo cardápio digital, que chegam em tempo real no seu painel de comandas.',
      },
    },
  ],
};
