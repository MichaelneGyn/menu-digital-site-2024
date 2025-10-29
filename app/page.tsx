'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ScreenshotsSection from '@/components/ScreenshotsSection';

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
  
  // Animated counter states
  const [displaySpotsLeft, setDisplaySpotsLeft] = useState(10);
  
  const PROMO_LIMIT = 10; // Limite de usuários para promoção (PRIMEIROS 10)
  const spotsLeft = Math.max(0, PROMO_LIMIT - totalUsers);
  const isPromoActive = totalUsers < PROMO_LIMIT;
  const soldCount = PROMO_LIMIT - spotsLeft; // Quantos já foram vendidos
  
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
  
  // Animated counter effect
  useEffect(() => {
    if (loading) return;
    
    const duration = 1500; // 1.5 segundos
    const steps = 30;
    const stepDuration = duration / steps;
    const start = 10;
    const end = spotsLeft;
    const diff = end - start;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3); // Easing function
      const value = Math.round(start + (diff * easeOut));
      
      setDisplaySpotsLeft(value);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplaySpotsLeft(spotsLeft);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [loading, spotsLeft]);
  
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
  const ourPrice = 89.90;
  const savings = ifoodTotal - ourPrice;
  const yearSavings = savings * 12;

  return (
    <>
      <LandingHeader />
      <div className="min-h-screen page-transition pt-16">
        <div className="max-w-4xl mx-auto text-center p-8">
          <div className="hero-section-landing">
          <h1 className="landing-main-title">
            Plataforma de Pedidos Online para Restaurantes
          </h1>
          <p className="landing-main-subtitle">
            Seu próprio sistema de delivery e gestão, sem comissão. Como o iFood, mas 100% seu.
          </p>
          
          <div className="flex flex-col items-center gap-3 mb-8">
            <Link href="/auth/login" className="w-full max-w-md">
              <Button size="lg" className="w-full text-lg py-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-lg">
                🔥 GARANTIR R$ 69,90/MÊS
              </Button>
            </Link>
            <p className="text-sm text-gray-600">
              ✅ 15 dias grátis • ✅ Sem cartão de crédito • ✅ Cancele quando quiser
            </p>
            {isPromoActive && !loading && (
              <p className="text-sm font-bold text-red-600 animate-pulse">
                🔥 Só {displaySpotsLeft} vagas! Após isso, preço sobe para R$ 89,90
              </p>
            )}
          </div>

          {/* 3 Cards Vermelhos Grandes */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-shadow">
              <div className="text-6xl mb-4 text-center">🚀</div>
              <h3 className="text-2xl font-bold mb-3 text-center">Sistema de Pedidos Online</h3>
              <p className="text-sm text-white/90 text-center leading-relaxed">Clientes fazem pedidos pelo celular (delivery, retirada ou mesa). Seu próprio sistema, sem intermediários.</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-shadow">
              <div className="text-6xl mb-4 text-center">📊</div>
              <h3 className="text-2xl font-bold mb-3 text-center">Painel de Gestão Completo</h3>
              <p className="text-sm text-white/90 text-center leading-relaxed">Kitchen Display, comandas, relatórios e controle total em tempo real. Como o iFood, mas melhor.</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-shadow">
              <div className="text-6xl mb-4 text-center">💰</div>
              <h3 className="text-2xl font-bold mb-3 text-center">Zero Comissão por Pedido</h3>
              <p className="text-sm text-white/90 text-center leading-relaxed">Sem taxa de 27% como iFood. Pague apenas R$ 119,90/mês fixo e fique com 100% das vendas!</p>
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
            
            {/* Card de Comparação iFood vs Nosso Sistema */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">iFood</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mensalidade:</span>
                        <span className="font-semibold">R$ 150/mês</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comissão:</span>
                        <span className="font-semibold text-red-600">27% por pedido</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>100 pedidos × R$ 50:</span>
                          <span>R$ 5.000</span>
                        </div>
                        <div className="flex justify-between text-xs text-red-600 font-medium">
                          <span>Comissão 27%:</span>
                          <span>-R$ 1.350</span>
                        </div>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Custo Total:</span>
                          <span className="text-xl font-bold text-red-600">R$ 1.500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Seu Sistema</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mensalidade:</span>
                        <span className="font-semibold">R$ 89,90/mês</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Comissão:</span>
                        <span className="font-semibold text-green-600">0% por pedido</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>100 pedidos × R$ 50:</span>
                          <span>R$ 5.000</span>
                        </div>
                        <div className="flex justify-between text-xs text-green-600 font-medium">
                          <span>Comissão 0%:</span>
                          <span>R$ 0</span>
                        </div>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Custo Total:</span>
                          <span className="text-xl font-bold text-green-600">R$ 89,90</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Você economiza vs iFood:</p>
                  <p className="text-3xl font-bold text-orange-600">R$ 1.410 /mês</p>
                  <p className="text-lg font-semibold text-gray-700">R$ 16.920 /ano</p>
                  <p className="text-xs text-gray-500 mt-2">*Baseado em 100 pedidos/mês com ticket médio de R$ 50</p>
                </div>
              </div>
            </div>

            {/* Banner Promocional */}
            {isPromoActive && !loading && (
              <div className="max-w-3xl mx-auto mb-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl shadow-sm">
                <p className="text-center text-sm font-bold text-orange-700">
                  🔥 PRIMEIROS 10: R$ 69,90/mês • Só {displaySpotsLeft} vagas! (Preço normal: R$ 89,90)
                </p>
              </div>
            )}

            {/* Card Plano Completo - LARANJA */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-2xl p-8 relative hover:shadow-orange-500/50 transition-all duration-500" 
                   style={{ 
                     animationDelay: '0.2s',
                     opacity: 0,
                     animation: 'fadeInUp 0.8s ease-out forwards, glowPulse 3s ease-in-out infinite'
                   }}>
                <style dangerouslySetInnerHTML={{
                  __html: `
                    @keyframes fadeInUp {
                      0% {
                        opacity: 0;
                        transform: translateY(30px);
                      }
                      100% {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                    @keyframes glowPulse {
                      0%, 100% {
                        box-shadow: 0 20px 60px rgba(249, 115, 22, 0.4), 
                                    0 0 40px rgba(251, 146, 60, 0.3),
                                    inset 0 0 60px rgba(255, 255, 255, 0.1);
                      }
                      50% {
                        box-shadow: 0 25px 80px rgba(249, 115, 22, 0.6), 
                                    0 0 60px rgba(251, 146, 60, 0.5),
                                    inset 0 0 80px rgba(255, 255, 255, 0.15);
                      }
                    }
                  `
                }} />
                {/* Badge de Vagas Vendidas */}
                {isPromoActive && !loading && (
                  <div className="absolute top-6 right-6 bg-yellow-400 text-orange-900 px-4 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse-slow">
                    <span className="inline-block animate-bounce-subtle">🔥</span> {soldCount} vendidas
                  </div>
                )}
                
                <div className="text-center text-white">
                  <h3 className="text-3xl font-bold mb-2">Plano Completo</h3>
                  <p className="text-sm text-orange-100 mb-3">Tudo incluído, sem limites artificiais</p>
                  
                  {/* Contador de Vagas com Barra de Progresso */}
                  {isPromoActive && !loading && (
                    <div className="mb-4">
                      <div className="flex items-center justify-start gap-2 mb-3">
                        <span className="text-5xl font-bold animate-number-pop">{displaySpotsLeft}</span>
                        <span className="text-sm">de {PROMO_LIMIT} vagas</span>
                      </div>
                      {/* Barra de Progresso Horizontal com Animação ULTRA */}
                      <div className="w-full bg-orange-300/30 rounded-full h-4 overflow-hidden shadow-inner">
                        <div 
                          className="h-full transition-all duration-1000 ease-out relative overflow-hidden"
                          style={{ 
                            width: `${(soldCount / PROMO_LIMIT) * 100}%`,
                            background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 25%, #fbbf24 50%, #f59e0b 75%, #fbbf24 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'gradientShift 3s ease infinite',
                            boxShadow: '0 0 20px rgba(251, 191, 36, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
                          }}
                        >
                          <div 
                            className="absolute inset-0 w-full h-full"
                            style={{
                              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)',
                              animation: 'shimmer 1.5s infinite linear',
                              filter: 'blur(2px)'
                            }}
                          />
                          <div 
                            className="absolute inset-0 w-full h-full"
                            style={{
                              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
                              backgroundSize: '10px 10px',
                              animation: 'sparkle 2s infinite'
                            }}
                          />
                        </div>
                      </div>
                      <style dangerouslySetInnerHTML={{
                        __html: `
                          @keyframes shimmer {
                            0% {
                              transform: translateX(-100%);
                            }
                            100% {
                              transform: translateX(200%);
                            }
                          }
                          @keyframes gradientShift {
                            0%, 100% {
                              background-position: 0% 50%;
                            }
                            50% {
                              background-position: 100% 50%;
                            }
                          }
                          @keyframes sparkle {
                            0%, 100% {
                              opacity: 0.3;
                            }
                            50% {
                              opacity: 0.8;
                            }
                          }
                          .animate-pulse-slow {
                            animation: pulseSlow 2s ease-in-out infinite;
                          }
                          .animate-bounce-subtle {
                            animation: bounceSubtle 1s ease-in-out infinite;
                          }
                          @keyframes pulseSlow {
                            0%, 100% {
                              transform: scale(1);
                              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            }
                            50% {
                              transform: scale(1.05);
                              box-shadow: 0 6px 20px rgba(251, 191, 36, 0.5);
                            }
                          }
                          @keyframes bounceSubtle {
                            0%, 100% {
                              transform: translateY(0);
                            }
                            50% {
                              transform: translateY(-3px);
                            }
                          }
                          @keyframes numberPop {
                            0% {
                              transform: scale(1);
                            }
                            50% {
                              transform: scale(1.1);
                              color: #fbbf24;
                            }
                            100% {
                              transform: scale(1);
                            }
                          }
                          .animate-number-pop {
                            animation: numberPop 0.5s ease-out;
                          }
                        `
                      }} />
                    </div>
                  )}
                  
                  {/* Box do Preço */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                    <p className="text-xs text-orange-100 uppercase tracking-wide mb-2">APÓS PERÍODO DE TESTE:</p>
                    <div className="text-7xl font-bold mb-2">
                      <span className="text-5xl align-top">R$</span> 69<span className="text-5xl">,90</span>
                    </div>
                    <p className="text-orange-100 text-base mb-4">/mês</p>
                    
                    {isPromoActive && !loading && (
                      <button className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 overflow-hidden group">
                        <span className="relative z-10 flex items-center gap-2">
                          <span className="animate-pulse">🔥</span>
                          PRIMEIROS 10: Só {displaySpotsLeft} vagas!
                          <span className="animate-pulse">🔥</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300 transform -skew-x-12 group-hover:animate-wave"></div>
                      </button>
                    )}
                    <style dangerouslySetInnerHTML={{
                      __html: `
                        @keyframes wave {
                          0% {
                            transform: translateX(-100%) skewX(-12deg);
                          }
                          100% {
                            transform: translateX(200%) skewX(-12deg);
                          }
                        }
                        .group:hover .animate-wave {
                          animation: wave 0.8s ease-in-out;
                        }
                      `
                    }} />
                    
                    <p className="text-xs text-orange-100 mt-3">* Após os 10 primeiros clientes haverá reajuste de preço</p>
                  </div>
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
                    <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 shadow-2xl text-lg py-7 font-black tracking-wide" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                      🔥 GARANTIR R$ 69,90/MÊS
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Banner Verde Informativo */}
            <div className="max-w-3xl mx-auto mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-sm">
              <p className="text-center text-sm text-gray-700">
                🎁 <strong>15 DIAS GRÁTIS</strong> • Sem cartão de crédito • 🔥 <strong>PRIMEIROS 10: R$ 69,90/mês</strong>
              </p>
              <p className="text-center text-xs text-gray-600 mt-1">
                🔥 Se cancelar e retornar, paga preço normal (R$ 89,90/mês)
              </p>
            </div>
          </div>

          {/* Screenshots Section */}
        </div>
        
        <ScreenshotsSection />
        
        <div className="max-w-4xl mx-auto text-center p-8">
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
                  <li>📈 Relatórios completos + CMV</li>
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
                <p className="text-2xl font-bold text-blue-600">R$ {monthlyRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">iFood cobraria</p>
                <p className="text-xs text-gray-500 mt-1">*26,2% + R$ 150/mês</p>
                <p className="text-2xl font-bold text-red-600">R$ {ifoodTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Nosso sistema</p>
                <p className="text-2xl font-bold text-green-600">R$ 119.90</p>
              </div>
            </div>
            
            {savings > 0 && (
              <div className="mt-6 p-4 bg-green-100 rounded-lg text-center">
                <p className="text-lg mb-2">💚 Você economizaria:</p>
                <p className="text-4xl font-bold text-green-600 mb-2">R$ {savings.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
                <p className="text-xl text-green-700">R$ {yearSavings.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/ano</p>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="mt-16 text-left max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">❓ Perguntas Frequentes</h2>
            <div className="space-y-4">
              <details className="bg-white p-4 rounded-lg shadow-sm border">
                <summary className="font-semibold cursor-pointer">Como funciona o teste grátis?</summary>
                <p className="mt-3 text-gray-600">🔥 <strong>Primeiros 50 clientes:</strong> 15 dias grátis! Depois: 7 dias grátis. Você cria sua conta e tem acesso completo ao sistema. Não pedimos cartão de crédito. Após o período, você decide se quer continuar.</p>
              </details>
              
              <details className="bg-white p-4 rounded-lg shadow-sm border">
                <summary className="font-semibold cursor-pointer">Vocês cobram taxa por pedido?</summary>
                <p className="mt-3 text-gray-600">NÃO! Você paga apenas a mensalidade fixa (a partir de R$ 69,90/mês). Zero taxa por pedido, ao contrário do iFood que cobra 27%.</p>
              </details>
              
              <details className="bg-white p-4 rounded-lg shadow-sm border">
                <summary className="font-semibold cursor-pointer">Posso cancelar quando quiser?</summary>
                <p className="mt-3 text-gray-600">Sim! Não há fidelidade. Você pode cancelar quando quiser sem multa ou burocracia.</p>
              </details>
              
              <details className="bg-white p-4 rounded-lg shadow-sm border">
                <summary className="font-semibold cursor-pointer">Vocês têm integração com Mercado Pago?</summary>
                <p className="mt-3 text-gray-600">Sim! No plano Premium você tem integração completa com Mercado Pago para pagamentos automáticos via PIX e cartão.</p>
              </details>
              
              <details className="bg-white p-4 rounded-lg shadow-sm border">
                <summary className="font-semibold cursor-pointer">Os dados dos clientes são meus?</summary>
                <p className="mt-3 text-gray-600">SIM! Ao contrário do iFood, VOCÊ é dono dos dados dos seus clientes. Todos os contatos, histórico e informações são 100% seus.</p>
              </details>
              
              <details className="bg-white p-4 rounded-lg shadow-sm border">
                <summary className="font-semibold cursor-pointer">Preciso de conhecimento técnico?</summary>
                <p className="mt-3 text-gray-600">Não! O sistema é super intuitivo. Se você sabe usar WhatsApp, vai saber usar nosso sistema. Além disso, oferecemos suporte completo.</p>
              </details>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">📞 Ficou com dúvida?</h2>
            <p className="text-gray-600 mb-6">Entre em contato conosco! Responderemos em até 24 horas.</p>
            
            <form onSubmit={handleContactSubmit} className="max-w-2xl mx-auto space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Restaurante *</label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pizzaria do João"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="João Silva"
                    required
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="joao@pizzaria.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mensagem (opcional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Conte-nos sobre seu restaurante e suas necessidades..."
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={sending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                {sending ? '📤 Enviando...' : '📧 Enviar Mensagem'}
              </Button>
            </form>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              💬 Veja o botão verde no canto da tela para falar conosco no WhatsApp!
            </p>
          </div>

          {/* CTA Final */}
          <div className="mt-16 text-center">
            <Link href="/auth/login">
              <Button size="lg" className="cta-button-primary text-xl py-8 px-12">
                {isPromoActive ? '🔥 Começar Agora - 15 DIAS GRÁTIS' : '🚀 Começar Teste Grátis'}
              </Button>
            </Link>
            <p className="text-gray-600 mt-4">
              Junte-se aos restaurantes que economizam milhares por mês!
            </p>
          </div>
          </div>
        </div>
      </div>
      <LandingFooter />
    </>
  );
}
