'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';

export default function HomePage() {
  const [orders, setOrders] = useState(100);
  const [avgTicket, setAvgTicket] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [restaurantName, setRestaurantName] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const PROMO_LIMIT = 50; // Limite de usuários para promoção
  const spotsLeft = Math.max(0, PROMO_LIMIT - totalUsers);
  const isPromoActive = totalUsers < PROMO_LIMIT;
  
  useEffect(() => {
    // Buscar total de usuários
    fetch('/api/users/count')
      .then(res => res.json())
      .then(data => {
        setTotalUsers(data.count || 0);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restaurantName || !name || !whatsapp || !email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    setSending(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantName, name, whatsapp, email, message }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }
      
      toast.success('Mensagem enviada! Responderemos em breve.');
      
      // Limpar formulário
      setRestaurantName('');
      setName('');
      setWhatsapp('');
      setEmail('');
      setMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };
  
  const monthlyRevenue = orders * avgTicket;
  const ifoodCommission = monthlyRevenue * 0.262; // 23% comissão + 3.2% pagamento online
  const ifoodMonthly = monthlyRevenue >= 1800 ? 150 : 0; // Mensalidade R$ 150 se faturar >R$ 1.800
  const ifoodTotal = ifoodCommission + ifoodMonthly;
  const ourPrice = 119.90;
  const savings = ifoodTotal - ourPrice;
  const yearSavings = savings * 12;

  return (
    <div>
      <LandingHeader />
      <div className="min-h-screen page-transition pt-16">
        <div className="max-w-4xl mx-auto text-center p-8">
          <div className="hero-section-landing">
            {/* Badge Promocional */}
            {isPromoActive && !loading && (
              <div className="inline-block mb-6 animate-bounce">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                  🔥 LANÇAMENTO: 15 DIAS GRÁTIS • Primeiros 50!
                </div>
              </div>
            )}
            
            <h1 className="landing-main-title">
              Plataforma de Pedidos Online para Restaurantes
            </h1>
            <p className="landing-main-subtitle">
              Seu próprio sistema de delivery e gestão, sem comissão. Como o iFood, mas 100% seu.
            </p>
            
            <div className="flex flex-col items-center gap-4 mb-8">
              {/* Contador de Vagas */}
              {isPromoActive && !loading && (
                <div className="bg-white border-2 border-orange-500 rounded-lg p-4 shadow-lg mb-2 w-full max-w-md">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">⏰ Oferta por tempo limitado</p>
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600">
                      <span className="text-4xl">{spotsLeft}</span>
                      <div className="text-left text-sm">
                        <div>vagas</div>
                        <div>restantes</div>
                      </div>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-500"
                        style={{ width: `${((PROMO_LIMIT - spotsLeft) / PROMO_LIMIT) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{PROMO_LIMIT - spotsLeft} de {PROMO_LIMIT} vagas preenchidas</p>
                  </div>
                </div>
              )}
              
              <Link href="/auth/login" className="w-full max-w-md">
                <Button size="lg" className="cta-button-primary w-full text-lg py-6 relative overflow-hidden group">
                  {isPromoActive ? (
                    <>
                      <span className="relative z-10">🚀 Começar Agora - 15 DIAS GRÁTIS</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                    </>
                  ) : (
                    '🚀 Começar Agora - 7 Dias Grátis'
                  )}
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                ✅ Sem cartão de crédito • ✅ Cancele quando quiser • ✅ Suporte incluído
              </p>
              {isPromoActive && !loading && (
                <p className="text-xs text-orange-600 font-semibold animate-pulse">
                  🎁 Bônus: Setup completo + Suporte prioritário
                </p>
              )}
            </div>

            {/* Benefícios Principais */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <div className="feature-card-old">
                <div className="feature-icon-old text-4xl">🚀</div>
                <h3 className="feature-title-old">Sistema de Pedidos Online</h3>
                <p className="feature-description-old">Clientes fazem pedidos pelo celular (delivery, retirada ou mesa). Seu próprio sistema, sem intermediários.</p>
              </div>
              
              <div className="feature-card-old">
                <div className="feature-icon-old text-4xl">📊</div>
                <h3 className="feature-title-old">Painel de Gestão Completo</h3>
                <p className="feature-description-old">Kitchen Display, comandas, relatórios e controle total em tempo real. Como o iFood, mas melhor.</p>
              </div>
              
              <div className="feature-card-old">
                <div className="feature-icon-old text-4xl">💰</div>
                <h3 className="feature-title-old">Zero Comissão por Pedido</h3>
                <p className="feature-description-old">Sem taxa de 27% como iFood. Pague apenas R$ 119,90/mês fixo e fique com 100% das vendas!</p>
              </div>
            </div>

            {/* Features Adicionais */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <div className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🍽️</div>
                <p className="text-sm font-medium">QR Code para Mesas</p>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded mt-1 inline-block">NOVO</span>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-sm font-medium">Painel Kitchen Display</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-sm font-medium">Cálculo de CMV</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🎫</div>
                <p className="text-sm font-medium">Cupons de Desconto</p>
              </div>
            </div>

            {/* Seção de Planos e Preços */}
            <div id="planos" className="mt-20">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">💎 Escolha Seu Plano</h2>
              <p className="text-gray-600 mb-12">Simples, transparente e sem surpresas. Zero comissão por pedido.</p>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Plano Start */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-8 hover:shadow-xl transition-shadow relative">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2 text-blue-600">Start</h3>
                    <p className="text-xs text-gray-500 mb-3">Completo para começar</p>
                    <div className="text-5xl font-bold text-gray-900 mb-1">
                      <span className="text-3xl align-top">R$</span> 69<span className="text-3xl">,90</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">/mês</p>
                    
                    <ul className="text-left space-y-3 mb-8">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm"><strong>Cardápio Digital Editável</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm"><strong>Pedidos ILIMITADOS</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm">Delivery + Retirada + Mesa</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm">QR Code para Mesas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm"><strong>Kitchen Display (Painel Cozinha)</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm"><strong>Chamadas de Garçom</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm"><strong>Sistema de Cupons</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm"><strong>Notificações Sonoras</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm">Painel de Gestão em Tempo Real</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm">1 Restaurante</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm">Suporte Email + WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1 text-lg">✓</span>
                        <span className="text-sm"><strong>ZERO Comissão</strong></span>
                      </li>
                    </ul>
                    
                    <Link href="/auth/login" className="block">
                      <Button variant="outline" className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                        Começar com Start
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Plano Pro - DESTAQUE */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-2xl border-4 border-orange-400 p-8 relative transform hover:scale-105 transition-transform">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    ⭐ RECOMENDADO
                  </div>
                  
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-bold mb-2">Pro</h3>
                    <p className="text-xs text-orange-100 mb-3">Para crescer e expandir</p>
                    <div className="text-6xl font-bold mb-1">
                      <span className="text-4xl align-top">R$</span> 119<span className="text-4xl">,90</span>
                    </div>
                    <p className="text-orange-100 text-sm mb-6">/mês</p>
                    
                    <ul className="text-left space-y-3 mb-8">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm"><strong>Tudo do Start +</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <div className="text-sm">
                          <strong>Múltiplos Restaurantes</strong>
                          <p className="text-xs text-orange-100 mt-1">Ideal para franquias e grupos</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <div className="text-sm">
                          <strong>Relatórios Avançados</strong>
                          <p className="text-xs text-orange-100 mt-1">Analytics + Insights de vendas</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <div className="text-sm">
                          <strong>API Personalizada</strong>
                          <p className="text-xs text-orange-100 mt-1">Integre com seus sistemas</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <div className="text-sm">
                          <strong>Suporte Prioritário 24/7</strong>
                          <p className="text-xs text-orange-100 mt-1">Atendimento preferencial</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <div className="text-sm">
                          <strong>Consultor de Cardápio</strong>
                          <p className="text-xs text-orange-100 mt-1">Ajuda especializada em precificação</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <div className="text-sm">
                          <strong>Domínio Personalizado</strong>
                          <p className="text-xs text-orange-100 mt-1">Ex: pedidos.seurestaurante.com.br</p>
                        </div>
                      </li>
                    </ul>
                    
                    <Link href="/auth/login" className="block">
                      <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold shadow-lg text-base py-6">
                        🚀 Começar com Pro
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Destaque 15 dias grátis */}
              {isPromoActive && !loading && (
                <div className="mt-8 text-center">
                  <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg px-6 py-3">
                    <p className="text-green-700 font-semibold">
                      🎁 <strong>15 DIAS GRÁTIS</strong> em qualquer plano • Sem cartão de crédito
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Comparação com Concorrentes */}
            <div className="mt-16 p-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
              <h2 className="text-2xl font-bold mb-6">💡 Economize milhares por ano vs iFood</h2>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-bold text-red-600 mb-3">❌ iFood (Plano Entrega)</h3>
                  <ul className="space-y-2 text-sm">
                    <li>💸 26,2% de taxa por pedido (23% + 3,2%)*</li>
                    <li>💰 + R$ 150/mês de mensalidade*</li>
                    <li>👥 Cliente é deles, não seu</li>
                    <li>📊 Dados limitados</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-3">*Fonte: Blog Oficial iFood Parceiros (2024)</p>
                </div>
                <div>
                  <h3 className="font-bold text-green-600 mb-3">✅ Nosso Sistema</h3>
                  <ul className="space-y-2 text-sm">
                    <li>🎉 0% de taxa por pedido</li>
                    <li>💵 R$ 119,90/mês fixo (sem surpresas)</li>
                    <li>👑 Cliente é 100% seu</li>
                    <li>📈 Dados e controle total</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Calculadora de Economia */}
            <div className="mt-16 p-8 bg-white rounded-xl shadow-lg border-2 border-green-200">
              <h2 className="text-2xl font-bold mb-4">💰 Calcule Sua Economia</h2>
              <p className="text-gray-600 mb-6">Veja quanto você economizaria trocando o iFood pelo nosso sistema</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="text-left">
                  <label className="block text-sm font-medium mb-2">Pedidos por mês:</label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={orders}
                    onChange={(e) => setOrders(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-2xl font-bold text-center mt-2">{orders} pedidos</p>
                </div>
                
                <div className="text-left">
                  <label className="block text-sm font-medium mb-2">Ticket médio (R$):</label>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="5"
                    value={avgTicket}
                    onChange={(e) => setAvgTicket(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-2xl font-bold text-center mt-2">R$ {avgTicket.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-red-50 to-green-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Faturamento/mês</p>
                  <p className="text-xl font-bold">R$ {monthlyRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Custo iFood Total*</p>
                  <p className="text-xl font-bold text-red-600">- R$ {ifoodTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                  <p className="text-xs text-gray-500 mt-1">*26,2% + R$ 150/mês</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Nosso sistema</p>
                  <p className="text-xl font-bold text-green-600">R$ {ourPrice.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-6 p-6 bg-green-100 border-2 border-green-400 rounded-lg">
                <p className="text-lg mb-2">💚 Você economizaria:</p>
                <p className="text-4xl font-bold text-green-600 mb-2">R$ {savings.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
                <p className="text-2xl font-bold text-green-700">R$ {yearSavings.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/ano</p>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-16 text-left">
              <h2 className="text-2xl font-bold mb-6 text-center">❓ Perguntas Frequentes</h2>
              <div className="space-y-4">
                <details className="p-4 bg-white rounded-lg shadow-sm border">
                  <summary className="font-semibold cursor-pointer">Como funciona o teste grátis?</summary>
                  <p className="mt-3 text-gray-600">🔥 <strong>Primeiros 50 clientes:</strong> 15 dias grátis! Depois: 7 dias grátis. Você cria sua conta e tem acesso completo ao sistema. Não pedimos cartão de crédito. Após o período, você decide se quer continuar.</p>
                </details>
                
                <details className="p-4 bg-white rounded-lg shadow-sm border">
                  <summary className="font-semibold cursor-pointer">Preciso pagar taxa por pedido?</summary>
                  <p className="mt-3 text-gray-600">NÃO! Você paga apenas a mensalidade fixa (a partir de R$ 69,90/mês). Zero taxa por pedido, ao contrário do iFood que cobra 27%.</p>
                </details>
                
                <details className="p-4 bg-white rounded-lg shadow-sm border">
                  <summary className="font-semibold cursor-pointer">Posso cancelar a qualquer momento?</summary>
                  <p className="mt-3 text-gray-600">Sim! Não há fidelidade. Você pode cancelar quando quiser sem multa ou burocracia.</p>
                </details>
                
                <details className="p-4 bg-white rounded-lg shadow-sm border">
                  <summary className="font-semibold cursor-pointer">Tem limite de pedidos?</summary>
                  <p className="mt-3 text-gray-600">NÃO! Ambos os planos têm pedidos ILIMITADOS. Não importa se você tem 10 ou 1000 pedidos por mês, o preço é sempre fixo.</p>
                </details>
                
                <details className="p-4 bg-white rounded-lg shadow-sm border">
                  <summary className="font-semibold cursor-pointer">Meus dados ficam comigo?</summary>
                  <p className="mt-3 text-gray-600">SIM! Ao contrário do iFood, VOCÊ é dono dos dados dos seus clientes. Todos os contatos, histórico e informações são 100% seus.</p>
                </details>
                
                <details className="p-4 bg-white rounded-lg shadow-sm border">
                  <summary className="font-semibold cursor-pointer">Preciso de conhecimento técnico?</summary>
                  <p className="mt-3 text-gray-600">Não! O sistema é super intuitivo. Se você sabe usar WhatsApp, vai saber usar nosso sistema. Além disso, oferecemos suporte completo.</p>
                </details>
              </div>
            </div>

            {/* Formulário de Contato */}
            <div id="contato" className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold mb-4">📞 Ficou com dúvida?</h2>
              <p className="text-gray-600 mb-6">Entre em contato conosco! Responderemos em até 24 horas.</p>
              
              <form onSubmit={handleContactSubmit} className="space-y-4 max-w-md mx-auto">
                <div className="text-left">
                  <label className="block text-sm font-medium mb-1">Nome do Restaurante *</label>
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Pizzaria Bella"
                  />
                </div>
                
                <div className="text-left">
                  <label className="block text-sm font-medium mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="João Silva"
                  />
                </div>
                
                <div className="text-left">
                  <label className="block text-sm font-medium mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(11) 98888-8888"
                  />
                </div>
                
                <div className="text-left">
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contato@seurestaurante.com.br"
                  />
                </div>
                
                <div className="text-left">
                  <label className="block text-sm font-medium mb-1">Mensagem</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Conte-nos mais sobre seu restaurante e suas necessidades..."
                  ></textarea>
                </div>
                
                <Button type="submit" size="lg" className="w-full cta-button-primary" disabled={sending}>
                  {sending ? '📤 Enviando...' : '📧 Enviar Mensagem'}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Email: <a href="mailto:virtualcardapio@gmail.com" className="text-blue-600 underline">virtualcardapio@gmail.com</a>
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  💬 Veja o botão verde no canto da tela para falar conosco no WhatsApp!
                </p>
              </form>
            </div>

            {/* CTA Final */}
            <div className="mt-16">
              <Link href="/auth/login" className="inline-block">
                <Button size="lg" className="cta-button-primary text-lg py-6 px-8">
                  {isPromoActive ? '🔥 Começar Agora - 15 DIAS GRÁTIS' : '🚀 Começar Teste Grátis'}
                </Button>
              </Link>
              <p className="text-xs text-gray-500 mt-3">
                Junte-se aos restaurantes que economizam milhares por mês!
              </p>
            </div>
          </div>
        </div>
      </div>
      <LandingFooter />
    </div>
  );
}
