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
  
  const FOUNDER_LIMIT = 10; // Primeiros 10 clientes - R$ 69,90
  const EARLY_LIMIT = 50; // Clientes 11-50 - R$ 79,90
  // Cliente 51+ = R$ 89,90
  
  const isFounder = totalUsers < FOUNDER_LIMIT;
  const isEarlyAdopter = totalUsers >= FOUNDER_LIMIT && totalUsers < EARLY_LIMIT;
  const founderSpotsLeft = Math.max(0, FOUNDER_LIMIT - totalUsers);
  const earlySpotsLeft = Math.max(0, EARLY_LIMIT - totalUsers);
  
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
            {!loading && (
              <div className="inline-block mb-6 animate-bounce">
                {isFounder && (
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                    🔥 PRIMEIROS 10 CLIENTES: R$ 69,90/mês • Só {founderSpotsLeft} vagas!
                  </div>
                )}
                {isEarlyAdopter && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                    ⭐ PRIMEIROS 50: R$ 79,90/mês • Restam {earlySpotsLeft} vagas!
                  </div>
                )}
                {!isFounder && !isEarlyAdopter && (
                  <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                    ✅ LANÇAMENTO: 15 DIAS GRÁTIS • R$ 89,90/mês
                  </div>
                )}
              </div>
            )}
            
            <h1 className="landing-main-title">
              Plataforma de Pedidos Online para Restaurantes
            </h1>
            <p className="landing-main-subtitle">
              Seu próprio sistema de delivery e gestão, sem comissão. Como o iFood, mas 100% seu.
            </p>
            
            <div className="flex flex-col items-center gap-4 mb-8">
              {/* Contador de Vagas - DESTAQUE ESPECIAL */}
              {(isFounder || isEarlyAdopter) && !loading && (
                <div className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-4 border-red-500 rounded-2xl p-6 shadow-2xl mb-4 w-full max-w-md relative animate-pulse" style={{ animationDuration: '2s' }}>
                  {/* Efeito de brilho ao redor */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 opacity-20 animate-pulse"></div>
                  
                  {/* Badge "LIMITADO" com animação forte */}
                  <div className="absolute -top-4 -right-4 z-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 animate-ping"></div>
                      <div className="relative bg-gradient-to-r from-red-600 to-orange-600 text-white px-5 py-2 rounded-full text-xs font-black shadow-2xl animate-bounce" style={{ animationDuration: '1s' }}>
                        ⚡ LIMITADO!
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center relative z-10">
                    {isFounder && (
                      <>
                        {/* Título com animação */}
                        <div className="mb-3">
                          <div className="inline-block animate-bounce" style={{ animationDuration: '1.5s' }}>
                            <p className="text-2xl font-black mb-1 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                              🔥 PRIMEIROS 10 CLIENTES 🔥
                            </p>
                          </div>
                          <p className="text-sm font-bold text-red-700 animate-pulse">Garanta o menor preço de lançamento!</p>
                        </div>
                        
                        {/* Contador de vagas com destaque MÁXIMO */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <div className="relative">
                            {/* Brilho atrás do número */}
                            <div className="absolute inset-0 bg-yellow-400 rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 rounded-2xl p-5 shadow-2xl transform hover:scale-110 transition-transform border-4 border-white">
                              <span className="text-6xl font-black text-white drop-shadow-2xl animate-pulse" style={{ animationDuration: '1s' }}>
                                {founderSpotsLeft}
                              </span>
                              <p className="text-xs text-white font-bold mt-1 uppercase tracking-wider">Vagas!</p>
                            </div>
                          </div>
                          
                          <div className="text-left">
                            <div className="bg-white rounded-lg px-4 py-2 shadow-lg border-2 border-green-500">
                              <p className="text-4xl font-black text-green-600 animate-pulse">R$ 69,90</p>
                              <p className="text-xs text-gray-600 font-semibold">por mês</p>
                              <p className="text-sm text-red-600 line-through font-bold">R$ 89,90</p>
                              <p className="text-xs font-bold text-green-700 mt-1">💰 Economize R$ 20!</p>
                            </div>
                          </div>
                        </div>
                        {/* Barra de progresso animada */}
                        <div className="bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner mb-3 border-2 border-gray-300">
                          <div 
                            className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 h-full transition-all duration-500 shadow-lg relative overflow-hidden"
                            style={{ width: `${((FOUNDER_LIMIT - founderSpotsLeft) / FOUNDER_LIMIT) * 100}%` }}
                          >
                            {/* Efeito de brilho animado */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-700 mb-4">
                          <span className="text-red-600 text-lg">{FOUNDER_LIMIT - founderSpotsLeft}</span> de <span className="text-lg">{FOUNDER_LIMIT}</span> vagas já garantidas!
                        </p>
                        {/* Caixa de benefícios com destaque */}
                        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 border-3 border-yellow-500 rounded-xl p-4 mb-3 shadow-lg transform hover:scale-105 transition-transform">
                          <p className="text-sm font-black text-yellow-900 mb-2 flex items-center justify-center gap-2">
                            <span className="text-xl animate-bounce">💎</span>
                            <span>BENEFÍCIOS EXCLUSIVOS</span>
                            <span className="text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>💎</span>
                          </p>
                          <ul className="text-sm text-left text-yellow-900 space-y-2 font-semibold">
                            <li className="flex items-center gap-2">
                              <span className="text-green-600 text-lg">✅</span>
                              <span>R$ 69,90/mês (normal R$ 89,90)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-600 text-lg">✅</span>
                              <span>Economize R$ 240/ano</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-600 text-lg">✅</span>
                              <span>Badge exclusivo 👑</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="text-green-600 text-lg">✅</span>
                              <span>15 dias grátis sem cartão</span>
                            </li>
                          </ul>
                        </div>
                        
                        {/* Aviso de cancelamento com destaque */}
                        <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3 animate-pulse" style={{ animationDuration: '3s' }}>
                          <p className="text-sm text-red-700 font-bold flex items-center justify-center gap-2">
                            <span className="text-xl">⚠️</span>
                            <span>Se cancelar e retornar, paga R$ 89,90/mês</span>
                          </p>
                        </div>
                      </>
                    )}
                    {isEarlyAdopter && (
                      <>
                        <p className="text-lg text-blue-700 font-bold mb-2">⭐ PRIMEIROS 50 CLIENTES</p>
                        <p className="text-sm text-gray-700 mb-3">Garanta preço promocional</p>
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-blue-400">
                            <span className="text-5xl font-black text-blue-600">{earlySpotsLeft}</span>
                            <p className="text-xs text-gray-600 mt-1 font-semibold">vagas restantes</p>
                          </div>
                          <div className="text-left">
                            <p className="text-3xl font-bold text-green-600">R$ 79,90</p>
                            <p className="text-xs text-gray-600">por mês</p>
                            <p className="text-xs text-gray-500 line-through">R$ 89,90</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-full h-3 overflow-hidden shadow-inner mb-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                            style={{ width: `${((EARLY_LIMIT - earlySpotsLeft) / EARLY_LIMIT) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{EARLY_LIMIT - earlySpotsLeft} de {EARLY_LIMIT} vagas já garantidas</p>
                        <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-3 mb-2">
                          <p className="text-xs font-bold text-blue-900">💎 BENEFÍCIOS:</p>
                          <ul className="text-xs text-left text-blue-900 mt-2 space-y-1">
                            <li>✅ R$ 79,90/mês (preço normal R$ 89,90)</li>
                            <li>✅ Economize R$ 120/ano</li>
                            <li>✅ Badge especial</li>
                            <li>✅ 15 dias grátis</li>
                          </ul>
                        </div>
                        <p className="text-xs text-red-600 font-bold">⚠️ Atenção: Se cancelar e retornar, paga preço normal (R$ 89,90/mês)</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <Link href="/auth/login" className="w-full max-w-md">
                <Button size="lg" className="cta-button-primary w-full text-lg py-6 relative overflow-hidden group">
                  {isFounder && (
                    <>
                      <span className="relative z-10">🔥 GARANTIR R$ 69,90/MÊS</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                    </>
                  )}
                  {isEarlyAdopter && (
                    <>
                      <span className="relative z-10">⭐ GARANTIR R$ 79,90/MÊS</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                    </>
                  )}
                  {!isFounder && !isEarlyAdopter && (
                    <>
                      <span className="relative z-10">🚀 Começar Agora - 15 DIAS GRÁTIS</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity"></span>
                    </>
                  )}
                </Button>
              </Link>
              <p className="text-sm text-gray-500">
                ✅ 15 dias grátis • ✅ Sem cartão de crédito • ✅ Cancele quando quiser
              </p>
              {isFounder && !loading && (
                <p className="text-xs text-red-600 font-bold animate-pulse">
                  ⚠️ Só {founderSpotsLeft} vagas! Após isso, preço sobe para R$ 79,90
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
              <h2 className="text-3xl md:text-4xl font-bold mb-3">💎 Um Único Plano. Tudo Incluído.</h2>
              <p className="text-gray-600 mb-8">Sistema completo de pedidos + gestão. Sem taxa por pedido, sem surpresas.</p>
              
              {/* Comparação de Economia - DESTAQUE */}
              <div className="max-w-3xl mx-auto mb-12">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-6 shadow-xl">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* iFood */}
                    <div className="bg-white rounded-xl p-6 border-2 border-red-400">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-red-600">iFood</h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Concorrente</span>
                      </div>
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mensalidade:</span>
                          <span className="font-bold">R$ 150/mês</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comissão:</span>
                          <span className="font-bold text-red-600">27% por pedido</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>100 pedidos × R$ 50:</span>
                            <span>R$ 5.000</span>
                          </div>
                          <div className="flex justify-between text-xs text-red-600">
                            <span>Comissão 27%:</span>
                            <span>-R$ 1.350</span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t-2 border-red-300 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold">Custo Total/mês:</span>
                          <span className="text-2xl font-bold text-red-600">R$ 1.500</span>
                        </div>
                      </div>
                    </div>

                    {/* Seu Sistema */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 border-2 border-green-400 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-bl-lg text-xs font-bold">
                        VOCÊ ECONOMIZA
                      </div>
                      <div className="flex items-center justify-between mb-4 mt-2">
                        <h3 className="text-xl font-bold text-white">Seu Sistema</h3>
                        <span className="text-xs bg-white/20 text-white px-2 py-1 rounded">✨ NOSSO</span>
                      </div>
                      <div className="space-y-2 text-sm mb-4 text-white">
                        <div className="flex justify-between">
                          <span>Mensalidade:</span>
                          <span className="font-bold">R$ 89,90/mês</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Comissão:</span>
                          <span className="font-bold text-yellow-300">0% por pedido ✨</span>
                        </div>
                        <div className="border-t border-white/20 pt-2 mt-2">
                          <div className="flex justify-between text-xs opacity-90">
                            <span>100 pedidos × R$ 50:</span>
                            <span>R$ 5.000</span>
                          </div>
                          <div className="flex justify-between text-xs text-yellow-300 font-bold">
                            <span>Comissão 0%:</span>
                            <span>R$ 0 🎉</span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t-2 border-white/30 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-white">Custo Total/mês:</span>
                          <span className="text-3xl font-bold text-yellow-300">R$ 89,90</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Economia Total */}
                  <div className="mt-6 text-center bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 shadow-lg">
                    <p className="text-sm text-yellow-900 font-semibold mb-1">💰 VOCÊ ECONOMIZA vs iFood:</p>
                    <p className="text-4xl font-bold text-yellow-900 mb-1">R$ 1.410 /mês</p>
                    <p className="text-2xl font-bold text-yellow-900">R$ 16.920 /ano</p>
                    <p className="text-xs text-yellow-800 mt-2">*Baseado em 100 pedidos/mês com ticket médio de R$ 50</p>
                  </div>
                </div>
              </div>

              {/* Pricing Dinâmico */}
              {!loading && (isFounder || isEarlyAdopter) && (
                <div className="mb-8 text-center">
                  {isFounder && (
                    <div className="inline-block bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg px-6 py-3 animate-pulse">
                      <p className="text-yellow-800 font-bold">
                        🔥 PRIMEIROS 10: R$ 69,90/mês • Só {founderSpotsLeft} vagas! (Preço normal: R$ 89,90)
                      </p>
                    </div>
                  )}
                  {isEarlyAdopter && (
                    <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-400 rounded-lg px-6 py-3 animate-pulse">
                      <p className="text-blue-800 font-bold">
                        ⭐ PRIMEIROS 50: R$ 79,90/mês • Restam {earlySpotsLeft} vagas! (Preço normal: R$ 89,90)
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="max-w-2xl mx-auto">
                {/* Plano Único */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-2xl border-4 border-orange-400 p-8 relative">
                  {!loading && (isFounder || isEarlyAdopter) && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      {isFounder && '👑 PREÇO FUNDADOR'}
                      {isEarlyAdopter && '⭐ EARLY ADOPTER'}
                    </div>
                  )}
                  
                  <div className="text-center text-white">
                    <h3 className="text-3xl font-bold mb-2">Plano Completo</h3>
                    <p className="text-xs text-orange-100 mb-3">Tudo incluído, sem limites artificiais</p>
                    
                    {/* Preço Dinâmico */}
                    {!loading && (
                      <>
                        {isFounder && (
                          <>
                            <div className="text-6xl font-bold mb-1">
                              <span className="text-4xl align-top">R$</span> 49<span className="text-4xl">,90</span>
                            </div>
                            <p className="text-orange-100 text-sm mb-6">/mês</p>
                            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold inline-block mb-4">
                              Só {founderSpotsLeft} vagas restantes!
                            </div>
                          </>
                        )}
                        {isEarlyAdopter && (
                          <>
                            <div className="text-6xl font-bold mb-1">
                              <span className="text-4xl align-top">R$</span> 69<span className="text-4xl">,90</span>
                            </div>
                            <p className="text-orange-100 text-sm mb-6">/mês</p>
                            <div className="bg-blue-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold inline-block mb-4">
                              Só {earlySpotsLeft} vagas restantes!
                            </div>
                          </>
                        )}
                        {!isFounder && !isEarlyAdopter && (
                          <>
                            <div className="text-6xl font-bold mb-1">
                              <span className="text-4xl align-top">R$</span> 89<span className="text-4xl">,90</span>
                            </div>
                            <p className="text-orange-100 text-sm mb-6">/mês</p>
                          </>
                        )}
                      </>
                    )}
                    {loading && (
                      <>
                        <div className="text-6xl font-bold mb-1">
                          <span className="text-4xl align-top">R$</span> 89<span className="text-4xl">,90</span>
                        </div>
                        <p className="text-orange-100 text-sm mb-6">/mês</p>
                      </>
                    )}
                    
                    <ul className="text-left space-y-3 mb-8">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm"><strong>Cardápio Digital Editável</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm"><strong>Pedidos ILIMITADOS</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm">Delivery + Retirada + Mesa</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm">QR Code para Mesas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm"><strong>Kitchen Display (Painel Cozinha)</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm"><strong>Chamadas de Garçom</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm"><strong>Sistema de Cupons</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm"><strong>Notificações Sonoras</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm"><strong>Cálculo de CMV Completo</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm">Painel de Gestão em Tempo Real</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm">Analytics e Relatórios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm">1 Restaurante</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm">Suporte Email + WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-300 mt-1 font-bold text-lg">✓</span>
                        <span className="text-sm"><strong>ZERO Comissão por Pedido</strong></span>
                      </li>
                    </ul>
                    
                    <Link href="/auth/login" className="block">
                      <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold shadow-lg text-base py-6">
                        {isFounder && '🔥 GARANTIR R$ 69,90/MÊS'}
                        {isEarlyAdopter && '⭐ GARANTIR R$ 79,90/MÊS'}
                        {!isFounder && !isEarlyAdopter && '🚀 Começar Agora - 15 DIAS GRÁTIS'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Destaque 15 dias grátis */}
              {!loading && (
                <div className="mt-8 text-center">
                  <div className="inline-block bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg px-6 py-3">
                    <p className="text-green-700 font-semibold">
                      🎁 <strong>15 DIAS GRÁTIS</strong> • Sem cartão de crédito
                      {isFounder && <span className="ml-2">• 🔥 PRIMEIROS 10: R$ 69,90/mês</span>}
                      {isEarlyAdopter && <span className="ml-2">• ⭐ PRIMEIROS 50: R$ 79,90/mês</span>}
                    </p>
                    {(isFounder || isEarlyAdopter) && (
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ Se cancelar e retornar, paga preço normal (R$ 89,90/mês)
                      </p>
                    )}
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
                  {isFounder ? '🔥 GARANTIR R$ 69,90/MÊS' : (isEarlyAdopter ? '⭐ GARANTIR R$ 79,90/MÊS' : '🚀 Começar Agora - 15 DIAS GRÁTIS')}
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
