'use client';

import { useState } from 'react';
import PhoneMockup from './PhoneMockup';

const adminScreenshots = [
  {
    id: 'dashboard',
    screenshot: '/screenshots/admin-dashboard.png',
    alt: 'Dashboard Administrativo',
    title: 'Dashboard Completo',
    description: 'Gerencie tudo em um só lugar: produtos, cupons, relatórios e muito mais'
  },
  {
    id: 'relatorios',
    screenshot: '/screenshots/admin-relatorios.png',
    alt: 'Relatórios de Lucro',
    title: 'Relatórios de Lucro',
    description: 'Acompanhe faturamento, custos e lucro líquido em tempo real'
  },
  {
    id: 'produtos',
    screenshot: '/screenshots/admin-produtos.png',
    alt: 'Gestão de Produtos',
    title: 'Gestão de Produtos',
    description: 'Adicione, edite e organize seu cardápio facilmente'
  },
  {
    id: 'mesas',
    screenshot: '/screenshots/admin-mesas.png',
    alt: 'Gestão de Mesas',
    title: 'QR Code para Mesas',
    description: 'Gere QR Codes para cada mesa e receba pedidos automaticamente'
  },
  {
    id: 'upsell',
    screenshot: '/screenshots/admin-upsell.png',
    alt: 'Sistema de Upsell',
    title: 'Upsell Inteligente',
    description: 'Sugira produtos complementares e aumente o ticket médio'
  },
  {
    id: 'comandas',
    screenshot: '/screenshots/admin-comandas.png',
    alt: 'Painel de Comandas',
    title: 'Painel em Tempo Real',
    description: 'Acompanhe pedidos ao vivo com atualizações instantâneas'
  }
];

const clientScreenshots = [
  {
    id: 'pagamento',
    screenshot: '/screenshots/cliente-pagamento.png',
    alt: 'Formas de Pagamento',
    title: 'Múltiplas Formas de Pagamento',
    description: 'PIX, cartão ou dinheiro - cliente escolhe como pagar'
  },
  {
    id: 'pedido',
    screenshot: '/screenshots/cliente-pedido.png',
    alt: 'Acompanhamento de Pedido',
    title: 'Rastreamento ao Vivo',
    description: 'Cliente acompanha o pedido em tempo real com barra de progresso'
  }
];

export default function ScreenshotsSection() {
  const [activeTab, setActiveTab] = useState<'admin' | 'cliente'>('admin');

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            📱 Veja Como Funciona
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sistema completo para você gerenciar seu restaurante e seus clientes fazerem pedidos
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-orange-300'
            }`}
          >
            👨‍💼 Para Você (Dono)
          </button>
          <button
            onClick={() => setActiveTab('cliente')}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              activeTab === 'cliente'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            👥 Para Seus Clientes
          </button>
        </div>

        {/* Screenshots Grid */}
        <div className="relative">
          {/* Admin Screenshots */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 transition-all duration-500 ${
              activeTab === 'admin' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          >
            {adminScreenshots.map((item) => (
              <div
                key={item.id}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <PhoneMockup
                  screenshot={item.screenshot}
                  alt={item.alt}
                  title={item.title}
                  description={item.description}
                />
              </div>
            ))}
          </div>

          {/* Client Screenshots */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center transition-all duration-500 ${
              activeTab === 'cliente' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          >
            {clientScreenshots.map((item) => (
              <div
                key={item.id}
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <PhoneMockup
                  screenshot={item.screenshot}
                  alt={item.alt}
                  title={item.title}
                  description={item.description}
                />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            ✨ Sistema profissional usado por restaurantes em todo Brasil
          </p>
          <a
            href="/auth/login"
            className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            🚀 Começar Agora - 15 Dias Grátis
          </a>
        </div>
      </div>
    </section>
  );
}
