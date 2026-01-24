'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import ScreenshotsSection from '@/components/ScreenshotsSection';
import { GTMEvents } from '@/lib/gtm';

export default function HomePage() {
  const [orders, setOrders] = useState(100);
  const [avgTicket, setAvgTicket] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // BLACK FRIDAY - Countdown até segunda-feira 23:59
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  // Form states
  const [restaurantName, setRestaurantName] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Animated counter states
  const [displaySpotsLeft, setDisplaySpotsLeft] = useState(10);
  
  const PROMO_LIMIT = 0; // Promoção encerrada
  const spotsLeft = 0;
  const isPromoActive = false;
  const soldCount = 0;
  
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
  
  // BLACK FRIDAY - Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      // Próxima segunda-feira 23:59:59
      const now = new Date();
      const nextMonday = new Date();
      const daysUntilMonday = (1 + 7 - now.getDay()) % 7 || 7;
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(23, 59, 59, 999);
      
      const difference = nextMonday.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
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
      
      <div className="min-h-screen page-transition pt-20 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
        
        <div className="max-w-4xl mx-auto text-center px-4 py-8 md:p-8 relative z-10">
          <div className="hero-section-landing">
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white px-2">
            Sistema de Pedidos Online
            <br />
            <span className="text-yellow-400">para Restaurantes</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto px-2">
            Plataforma completa de pedidos, delivery e gestão.
            <br className="hidden md:block" />
            Sem comissão por pedido. Mensalidade fixa de R$ 69,90/mês.
          </p>
          
          {/* Preço Destaque */}
          <div className="max-w-2xl mx-auto mb-8 bg-white rounded-xl shadow-xl p-8">
            <div className="text-gray-900 text-xl font-semibold mb-3">
              Plano Mensal
            </div>
            <div className="text-orange-600 text-4xl md:text-5xl font-bold mb-3">
              R$ 69,90<span className="text-2xl">/mês</span>
            </div>
            <div className="text-gray-600 text-sm space-y-1">
              <p>✓ Sem taxas por pedido</p>
              <p>✓ 30 dias de teste grátis</p>
              <p>✓ Cancele quando quiser</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 mb-8 px-2">
            <Link href="/auth/login?register=true" className="w-full max-w-md">
              <Button 
                size="lg" 
                className="w-full text-lg py-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg transition-all"
                onClick={() => GTMEvents.clickFreeTrial()}
              >
                Começar Teste Grátis
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              variant="outline"
              className="w-full max-w-md text-lg py-6 bg-white hover:bg-gray-50 text-gray-900 font-semibold border-2 border-gray-300 transition-all"
              onClick={() => {
                const screenshotsSection = document.getElementById('screenshots');
                if (screenshotsSection) {
                  screenshotsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              Ver Demonstração
            </Button>
          </div>

          {/* 3 Cards de Benefícios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 px-2">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="text-4xl mb-4 text-center">📱</div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-900">Pedidos Online</h3>
              <p className="text-sm text-gray-600 text-center leading-relaxed">Sistema completo para delivery, retirada e pedidos na mesa via QR Code.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="text-4xl mb-4 text-center">📊</div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-900">Gestão Completa</h3>
              <p className="text-sm text-gray-600 text-center leading-relaxed">Painel administrativo, relatórios, controle de estoque e cálculo de CMV.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
              <div className="text-4xl mb-4 text-center">💰</div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-900">Sem Comissão</h3>
              <p className="text-sm text-gray-600 text-center leading-relaxed">Apenas R$ 69,90/mês fixo. Sem taxas por pedido como iFood (27%).</p>
            </div>
          </div>


          {/* Features Adicionais */}
          <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recursos Inclusos</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🍽️</div>
                <p className="text-sm font-medium text-gray-700">QR Code Mesas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <p className="text-sm font-medium text-gray-700">Kitchen Display</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-sm font-medium text-gray-700">Cálculo CMV</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎫</div>
                <p className="text-sm font-medium text-gray-700">Cupons</p>
              </div>
            </div>
          </div>

          {/* Seção de Depoimentos / Prova Social */}
          <div className="mt-20 mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
              Depoimentos de Clientes
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {[
                { nome: "Pizzaria Bella Napoli", msg: "Economizei muito no primeiro mês. Sistema completo e fácil de usar.", rating: 5 },
                { nome: "Burger House", msg: "Configuração rápida. Clientes gostaram da praticidade do cardápio digital.", rating: 5 },
                { nome: "Restaurante Sabor & Arte", msg: "Controle total dos dados e pedidos. Suporte atencioso.", rating: 5 },
                { nome: "Sushi Bar Matsuri", msg: "Redução significativa nos custos operacionais. Recomendo.", rating: 5 },
                { nome: "Churrascaria Boi na Brasa", msg: "Sistema organizado. Equipe adaptou-se rapidamente.", rating: 4 },
                { nome: "Cantina Italiana Nonna", msg: "Gestão de pedidos eficiente. Relatórios úteis para análise.", rating: 5 }
              ].map((depo, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900">{depo.nome}</h3>
                    <div className="flex gap-1 mt-1">
                      {[...Array(depo.rating)].map((_, j) => (
                        <span key={j} className="text-yellow-500">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{depo.msg}</p>
                </div>
              ))}
            </div>
            
            {/* Números Reais */}
            <div className="mt-12 grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
                <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
                <div className="text-sm text-gray-600">Clientes Ativos</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
                <div className="text-3xl font-bold text-gray-900 mb-2">180+</div>
                <div className="text-sm text-gray-600">Pedidos/Dia</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
                <div className="text-3xl font-bold text-gray-900 mb-2">R$ 18k</div>
                <div className="text-sm text-gray-600">Economizado/Mês</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200">
                <div className="text-3xl font-bold text-gray-900 mb-2">4.8★</div>
                <div className="text-sm text-gray-600">Avaliação</div>
              </div>
            </div>
          </div>

          {/* Seção de Planos e Preços */}
          <div id="planos" className="mt-20 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900">Comparação de Custos</h2>
            <p className="text-gray-600 mb-12 text-center text-lg">Exemplo: 100 pedidos de R$ 50/mês</p>
            
            {/* Comparação Visual Melhorada */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="grid md:grid-cols-2 gap-8">
                {/* iFood - Card Vermelho */}
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 relative">
                  <div className="absolute -top-3 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ❌ CARO
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-2">iFood</h3>
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
                
                {/* Virtual Cardápio - Card Verde/Laranja */}
                <div className="bg-gradient-to-br from-orange-50 to-green-50 border-2 border-orange-400 rounded-xl p-6 relative shadow-lg">
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    ✅ ECONÔMICO
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-2">Virtual Cardápio</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mensalidade:</span>
                        <span className="font-semibold">R$ 69,90/mês</span>
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
                          <span className="text-xl font-bold text-green-600">R$ 69,90</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card de Economia Total */}
                <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-center text-white shadow-2xl">
                  <p className="text-lg mb-2 opacity-90">💰 Você economiza vs iFood:</p>
                  <p className="text-5xl md:text-6xl font-black mb-2">R$ 1.410</p>
                  <p className="text-2xl font-bold mb-4">por mês</p>
                  <div className="border-t border-white/30 pt-4 mt-4">
                    <p className="text-lg opacity-90">Em 1 ano:</p>
                    <p className="text-4xl font-black">R$ 16.920</p>
                  </div>
              </div>
            </div>

            {/* Banner Promocional */}
            {isPromoActive && !loading && (
              <div className="max-w-3xl mx-auto mb-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl shadow-sm">
                <p className="text-center text-sm font-bold text-orange-700">
                  🎉 30 DIAS GRÁTIS • Comece sem compromisso!
                </p>
              </div>
            )}

            {/* Card Plano Completo - LARANJA COM BORDA */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-2xl p-8 relative hover:shadow-orange-500/50 transition-all duration-500 border-4 border-white" 
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
                  <h3 className="text-3xl font-bold mb-2 text-shadow-strong">Plano Completo</h3>
                  <p className="text-base font-bold text-white mb-3 text-shadow-strong">Tudo incluído, sem limites artificiais</p>
                  
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
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-white/30">
                    <p className="text-sm text-white uppercase tracking-wide mb-2 font-bold text-shadow-strong">APÓS PERÍODO DE TESTE:</p>
                    <div className="text-7xl font-bold mb-2 text-shadow-strong">
                      <span className="text-5xl align-top">R$</span> 69<span className="text-5xl">,90</span>
                    </div>
                    <p className="text-white text-lg mb-4 font-bold text-shadow-strong">/mês</p>
                    
                    {isPromoActive && !loading && (
                      <button className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-700 hover:via-red-600 hover:to-red-700 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 overflow-hidden group">
                        <span className="relative z-10 flex items-center gap-2">
                          <span className="animate-pulse">🔥</span>
                          30 Dias Grátis - Comece Agora!
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
                    
                    <p className="text-sm text-white mt-3 font-bold text-shadow-strong">* Após os 10 primeiros clientes haverá reajuste de preço</p>
                  </div>
                  <ul className="text-left space-y-3 mb-8">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong"><strong>Cardápio Digital Editável</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong"><strong>Pedidos ILIMITADOS</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong">Delivery + Retirada + Mesa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong">QR Code para Mesas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong"><strong>Kitchen Display (Painel Cozinha)</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong"><strong>Chamadas de Garçom</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong"><strong>Sistema de Cupons</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong"><strong>Notificações Sonoras</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong"><strong>Cálculo de CMV Completo</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong">Painel de Gestão em Tempo Real</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong">Analytics e Relatórios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong">1 Restaurante</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong">Suporte Email + WhatsApp</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-300 mt-1 font-bold text-2xl">✓</span>
                      <span className="text-base font-bold text-shadow-strong"><strong>ZERO Comissão por Pedido</strong></span>
                    </li>
                  </ul>
                  <Link href="/auth/login?register=true" className="block">
                    <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 shadow-2xl text-base md:text-xl py-5 md:py-8 font-black border-4 border-orange-300 px-3" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em'}}>
                      <span className="block leading-tight">🔥 COMEÇAR TESTE GRÁTIS</span>
                      <span className="block text-xs md:text-base leading-tight">(30 DIAS)</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Banner Informativo */}
            <div className="max-w-3xl mx-auto mt-8 p-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-2xl">
              <div className="bg-black p-4 rounded-lg">
                <p className="text-center text-sm md:text-base text-orange-400 font-black">
                  🎉 <strong>TESTE GRÁTIS</strong> • 30 DIAS SEM COMPROMISSO • 🎉
                </p>
                <p className="text-center text-xs md:text-sm text-gray-300 mt-1">
                  Apenas <span className="text-orange-400 font-black">R$ 69,90/mês</span> sem taxas por pedido
                </p>
                <p className="text-center text-xs text-gray-400 mt-1">
                  Cancele quando quiser
                </p>
              </div>
            </div>
          </div>

          {/* Screenshots Section */}
        </div>
        
        <ScreenshotsSection />
        
        <div className="max-w-4xl mx-auto text-center p-8">
          {/* Comparação com Concorrentes */}
          <div className="mt-16 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Comparação com iFood</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-600 mb-3">iFood</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 26,2% taxa por pedido</li>
                  <li>• R$ 150/mês mensalidade</li>
                  <li>• Dados dos clientes limitados</li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">Fonte: iFood Parceiros (2024)</p>
              </div>
              <div className="border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-600 mb-3">Virtual Cardápio</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 0% taxa por pedido</li>
                  <li>• R$ 69,90/mês fixo</li>
                  <li>• Controle total dos dados</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Calculadora de Economia */}
          <div className="mt-16 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Calculadora de Economia</h2>
            <p className="text-gray-600 mb-6">Simule sua economia mensal</p>
            
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
              <div className="mt-6 p-6 bg-green-50 rounded-lg text-center border border-green-200">
                <p className="text-lg mb-2 text-gray-700">Economia estimada:</p>
                <p className="text-3xl font-bold text-green-600 mb-2">R$ {savings.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</p>
                <p className="text-lg text-gray-600">R$ {yearSavings.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/ano</p>
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="mt-16 text-left max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Perguntas Frequentes</h2>
            <div className="space-y-4">
              <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <summary className="font-semibold cursor-pointer text-gray-900">Como funciona o teste grátis?</summary>
                <p className="mt-3 text-gray-600">Você cria sua conta e tem 30 dias de acesso completo ao sistema. Não pedimos cartão de crédito. Após o período, você decide se quer continuar.</p>
              </details>
              
              <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <summary className="font-semibold cursor-pointer text-gray-900">Vocês cobram taxa por pedido?</summary>
                <p className="mt-3 text-gray-600">Não. Você paga apenas a mensalidade fixa de R$ 69,90/mês. Sem taxas por pedido.</p>
              </details>
              
              <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <summary className="font-semibold cursor-pointer text-gray-900">Posso cancelar quando quiser?</summary>
                <p className="mt-3 text-gray-600">Sim. Não há fidelidade. Você pode cancelar a qualquer momento.</p>
              </details>
              
              <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <summary className="font-semibold cursor-pointer text-gray-900">Como funcionam os pagamentos?</summary>
                <p className="mt-3 text-gray-600">Os clientes pagam diretamente ao restaurante via PIX, dinheiro ou cartão na entrega. O sistema gera QR Code PIX automaticamente.</p>
              </details>
              
              <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <summary className="font-semibold cursor-pointer text-gray-900">Os dados dos clientes são meus?</summary>
                <p className="mt-3 text-gray-600">Sim. Você tem acesso completo aos dados dos seus clientes, incluindo contatos e histórico de pedidos.</p>
              </details>
              
              <details className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <summary className="font-semibold cursor-pointer text-gray-900">Preciso de conhecimento técnico?</summary>
                <p className="mt-3 text-gray-600">Não. O sistema é intuitivo e oferecemos suporte completo para configuração.</p>
              </details>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div className="mt-16 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Entre em Contato</h2>
            <p className="text-gray-600 mb-6">Responderemos em até 24 horas.</p>
            
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
              Ou fale conosco pelo WhatsApp usando o botão no canto da tela.
            </p>
          </div>

          {/* CTA Final */}
          <div className="mt-16 text-center px-4">
            <div className="max-w-2xl mx-auto mb-6 bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Comece Agora
              </h3>
              <p className="text-gray-600 mb-4">
                30 dias grátis • Sem cartão de crédito
              </p>
              <p className="text-sm text-gray-500">
                R$ 69,90/mês após o período de teste
              </p>
            </div>
            
            <Link href="/auth/login?register=true" className="inline-block w-full max-w-md">
              <Button size="lg" className="w-full text-lg py-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg transition-all">
                Iniciar Teste Grátis
              </Button>
            </Link>
            <p className="text-gray-400 mt-4 text-sm px-4">
              Sem compromisso. Cancele quando quiser.
            </p>
          </div>
          </div>
        </div>
      </div>
      <LandingFooter />
    </>
  );
}
