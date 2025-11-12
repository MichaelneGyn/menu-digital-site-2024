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
  
  const PROMO_LIMIT = 10; // BLACK FRIDAY: PRIMEIROS 10 com 50% OFF
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
      
      {/* BLACK FRIDAY BANNER - TOPO FIXO */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-black via-red-900 to-black text-white py-3 shadow-2xl border-b-4 border-yellow-400 animate-glow-red">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
            <div className="flex items-center gap-2 animate-float">
              <span className="text-2xl md:text-3xl animate-flash">🔥</span>
              <span className="text-lg md:text-2xl font-black text-yellow-400 text-shadow-yellow animate-pulse">BLACK FRIDAY</span>
              <span className="text-2xl md:text-3xl animate-flash">🔥</span>
            </div>
            
            {/* Countdown */}
            <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base">
              <span className="font-bold text-white text-shadow-strong">Termina em:</span>
              <div className="flex gap-1 md:gap-2">
                <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 text-black px-2 md:px-3 py-1 rounded-lg font-black min-w-[40px] md:min-w-[50px] text-center shadow-lg transform hover:scale-110 transition-transform">
                  {String(timeLeft.days).padStart(2, '0')}
                  <div className="text-xs font-bold">dias</div>
                </div>
                <span className="text-yellow-400 font-black text-xl">:</span>
                <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 text-black px-2 md:px-3 py-1 rounded-lg font-black min-w-[40px] md:min-w-[50px] text-center shadow-lg transform hover:scale-110 transition-transform">
                  {String(timeLeft.hours).padStart(2, '0')}
                  <div className="text-xs font-bold">hrs</div>
                </div>
                <span className="text-yellow-400 font-black text-xl">:</span>
                <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 text-black px-2 md:px-3 py-1 rounded-lg font-black min-w-[40px] md:min-w-[50px] text-center shadow-lg transform hover:scale-110 transition-transform">
                  {String(timeLeft.minutes).padStart(2, '0')}
                  <div className="text-xs font-bold">min</div>
                </div>
                <span className="text-yellow-400 font-black text-xl">:</span>
                <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 text-black px-2 md:px-3 py-1 rounded-lg font-black min-w-[40px] md:min-w-[50px] text-center shadow-lg animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                  <div className="text-xs font-bold">seg</div>
                </div>
              </div>
            </div>
            
            <div className="text-xs md:text-sm font-black text-yellow-400 text-shadow-yellow animate-bounce">
              ⚡ 50% OFF • 10 VAGAS! ⚡
            </div>
          </div>
        </div>
      </div>
      
      <div className="min-h-screen page-transition pt-40 md:pt-36 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Efeito de partículas de fogo no fundo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-red-500 rounded-full animate-pulse opacity-50"></div>
          <div className="absolute top-60 left-1/4 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-60"></div>
          <div className="absolute top-80 right-1/3 w-2 h-2 bg-orange-500 rounded-full animate-ping opacity-70"></div>
          <div className="absolute bottom-40 left-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse opacity-50"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 py-8 md:p-8 relative z-10">
          <div className="hero-section-landing">
          
          {/* Badge BLACK FRIDAY */}
          <div className="inline-block mb-6 animate-float">
            <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 text-black px-4 py-3 md:px-8 md:py-4 rounded-full font-black text-lg md:text-2xl shadow-2xl border-2 md:border-4 border-red-600 animate-glow-yellow">
              <span className="animate-pulse">🔥 OFERTA BLACK FRIDAY 🔥</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight text-white text-shadow-strong animate-float px-2">
            Pare de Pagar 27% de Comissão
            <br />
            <span className="text-yellow-400 text-shadow-yellow">para o iFood</span>
          </h1>
          <p className="text-xl md:text-3xl text-white mb-8 font-bold leading-relaxed max-w-3xl mx-auto text-shadow-strong px-2">
            Sistema completo de <span className="text-yellow-400 font-black text-shadow-yellow">pedidos + delivery + gestão</span>
            <br className="hidden md:block" />
            <span className="text-yellow-400 font-black text-shadow-yellow">ZERO comissão</span> por pedido. Você fica com 100% do lucro.
          </p>
          <p className="text-lg md:text-2xl text-yellow-400 mb-8 font-black text-shadow-yellow px-2">
            ✅ Sistema completo para seu restaurante
          </p>
          
          {/* BLACK FRIDAY - Oferta Especial */}
          <div className="max-w-2xl mx-auto mb-8 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 p-1 md:p-2 rounded-2xl shadow-2xl">
            <div className="bg-gradient-to-br from-gray-900 to-black p-6 md:p-10 rounded-xl border-2 md:border-4 border-yellow-400">
              <div className="text-yellow-400 font-black text-3xl md:text-6xl mb-4 text-shadow-yellow">
                🎉 BLACK FRIDAY
              </div>
              <div className="text-white text-2xl md:text-4xl font-black mb-4 text-shadow-strong">
                50% OFF
              </div>
              <div className="text-white text-lg md:text-2xl font-black mb-2 text-shadow-strong flex flex-col md:flex-row items-center justify-center gap-2">
                <span className="line-through text-gray-500 text-base md:text-xl">R$ 69,90/mês</span>
                <span className="text-yellow-400 text-2xl md:text-4xl text-shadow-yellow">R$ 34,95/mês</span>
              </div>
              <div className="text-gray-300 text-xs md:text-sm mb-4 font-semibold text-shadow-strong">
                Por 3 meses, depois R$ 69,90/mês
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 mb-8 px-2">
            {/* Botão Primário - Ver Demonstração (Menos comprometedor) */}
            <Button 
              size="lg" 
              className="w-full max-w-md text-lg md:text-2xl py-6 md:py-8 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white font-black shadow-2xl border-2 md:border-4 border-white transform hover:scale-105 transition-all"
              onClick={() => {
                const screenshotsSection = document.getElementById('screenshots');
                if (screenshotsSection) {
                  screenshotsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              🎥 VER COMO FUNCIONA (Grátis)
            </Button>
            
            {/* Botão Secundário - Garantir Desconto */}
            <Link href="/auth/login?register=true" className="w-full max-w-md">
              <Button 
                size="lg" 
                className="w-full text-lg md:text-2xl py-6 md:py-8 bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300 hover:from-yellow-400 hover:to-yellow-500 text-black font-black shadow-2xl border-2 md:border-4 border-red-600 transform hover:scale-105 md:hover:scale-110 transition-all animate-glow-yellow"
                onClick={() => GTMEvents.clickFreeTrial()}
              >
                <span className="animate-pulse">🔥 GARANTIR 50% OFF AGORA! 🔥</span>
              </Button>
            </Link>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
              <p className="text-sm md:text-base text-white font-bold text-shadow-strong text-center mb-2">
                ✅ 30 dias grátis
              </p>
              <p className="text-sm md:text-base text-white font-bold text-shadow-strong text-center mb-2">
                ✅ Sem cartão de crédito
              </p>
              <p className="text-sm md:text-base text-white font-bold text-shadow-strong text-center">
                ✅ Cancele quando quiser
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl font-black text-sm md:text-lg border-2 md:border-4 border-yellow-400 shadow-2xl text-center">
              ⏰ Oferta válida até Segunda-feira 23:59
            </div>
          </div>

          {/* 3 Cards BLACK FRIDAY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 px-2">
            <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-2xl p-6 md:p-8 text-black shadow-2xl hover:shadow-yellow-400/70 transition-all transform hover:scale-105 md:hover:scale-110 md:hover:rotate-2 border-2 md:border-4 border-black animate-glow-yellow">
              <div className="text-5xl md:text-7xl mb-4 text-center animate-bounce">🚀</div>
              <h3 className="text-xl md:text-2xl font-black mb-3 text-center">Sistema de Pedidos Online</h3>
              <p className="text-sm md:text-base font-bold text-center leading-relaxed">Clientes fazem pedidos pelo celular (delivery, retirada ou mesa). Seu próprio sistema, sem intermediários.</p>
            </div>
            
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-2xl p-6 md:p-8 text-white shadow-2xl hover:shadow-red-600/70 transition-all transform hover:scale-105 md:hover:scale-110 border-2 md:border-4 border-yellow-400 animate-glow-red">
              <div className="text-5xl md:text-7xl mb-4 text-center animate-pulse">📊</div>
              <h3 className="text-xl md:text-2xl font-black mb-3 text-center text-shadow-strong">Painel de Gestão Completo</h3>
              <p className="text-sm md:text-base font-bold text-center leading-relaxed text-shadow-strong">Kitchen Display, comandas, relatórios e controle total em tempo real. Como o iFood, mas melhor.</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-2xl p-6 md:p-8 text-black shadow-2xl hover:shadow-yellow-400/70 transition-all transform hover:scale-105 md:hover:scale-110 md:hover:rotate-[-2deg] border-2 md:border-4 border-black animate-glow-yellow">
              <div className="text-5xl md:text-7xl mb-4 text-center animate-bounce">💰</div>
              <h3 className="text-xl md:text-2xl font-black mb-3 text-center">Zero Comissão por Pedido</h3>
              <p className="text-sm md:text-base font-bold text-center leading-relaxed">Sem taxa de 27% como iFood. Pague apenas <span className="text-red-600 font-black">R$ 34,95/mês</span> (3 meses) e fique com 100% das vendas!</p>
            </div>
          </div>

          {/* Seção de Integrações - EM DESENVOLVIMENTO */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-blue-300 relative overflow-hidden">
            {/* Badge de Desenvolvimento */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              🚧 EM DESENVOLVIMENTO
            </div>
            
            {/* Título */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                🔗 Integrações Futuras com Plataformas de Delivery
              </h2>
              <p className="text-lg text-gray-700 font-semibold">
                Estamos trabalhando para integrar com as principais plataformas!
              </p>
            </div>

            {/* Grid de Logos das Plataformas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8 opacity-60">
              {/* iFood */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
                <div className="text-center">
                  <div className="text-5xl mb-3">🍔</div>
                  <h3 className="font-bold text-lg text-gray-600">iFood</h3>
                  <p className="text-xs text-gray-500 mt-1">Em breve</p>
                </div>
              </div>

              {/* 99Food */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
                <div className="text-center">
                  <div className="text-5xl mb-3">🍕</div>
                  <h3 className="font-bold text-lg text-gray-600">99Food</h3>
                  <p className="text-xs text-gray-500 mt-1">Em breve</p>
                </div>
              </div>

              {/* Rappi */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
                <div className="text-center">
                  <div className="text-5xl mb-3">🛵</div>
                  <h3 className="font-bold text-lg text-gray-600">Rappi</h3>
                  <p className="text-xs text-gray-500 mt-1">Em breve</p>
                </div>
              </div>

              {/* Uber Eats */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
                <div className="text-center">
                  <div className="text-5xl mb-3">🚗</div>
                  <h3 className="font-bold text-lg text-gray-600">Uber Eats</h3>
                  <p className="text-xs text-gray-500 mt-1">Em breve</p>
                </div>
              </div>

              {/* aiqfome */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
                <div className="text-center">
                  <div className="text-5xl mb-3">🍽️</div>
                  <h3 className="font-bold text-lg text-gray-600">aiqfome</h3>
                  <p className="text-xs text-gray-500 mt-1">Em breve</p>
                </div>
              </div>
            </div>

            {/* Benefícios Futuros */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-inner">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4">
                  <div className="text-3xl mb-2">📱</div>
                  <h4 className="font-bold text-gray-900 mb-1">Painel Único</h4>
                  <p className="text-sm text-gray-600">Todos os pedidos em um só lugar</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="font-bold text-gray-900 mb-1">Sincronização Automática</h4>
                  <p className="text-sm text-gray-600">Cardápio atualizado em todas</p>
                </div>
                <div className="p-4">
                  <div className="text-3xl mb-2">💰</div>
                  <h4 className="font-bold text-gray-900 mb-1">Sem Custo Extra</h4>
                  <p className="text-sm text-gray-600">Incluído no plano mensal</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-6">
              <p className="text-lg font-bold text-blue-700">
                🚀 Clientes atuais receberão upgrade GRATUITO quando disponível!
              </p>
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

          {/* Seção de Depoimentos / Prova Social */}
          <div className="mt-20 mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-12 text-center text-white text-shadow-strong">
              ⭐ O Que Nossos Clientes Dizem
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {[
                { nome: "Pizzaria Bella Napoli", msg: "Economizei R$ 2.400 no primeiro mês! Antes pagava 27% pro iFood, agora fico com 100% do lucro 🎉", hora: "15:42" },
                { nome: "Burger House Premium", msg: "Sistema muito fácil de usar! Em 2 minutos já estava recebendo pedidos. Meus clientes adoraram! 🚀", hora: "14:28" },
                { nome: "Restaurante Sabor & Arte", msg: "Melhor decisão que tomei! Agora os dados dos clientes são meus, não do iFood 💪", hora: "16:15" },
                { nome: "Sushi Bar Matsuri", msg: "Parei de pagar R$ 1.800/mês de comissão. Agora pago só R$ 69,90 e fico com tudo! 🍣", hora: "11:23" },
                { nome: "Churrascaria Boi na Brasa", msg: "Sistema perfeito! Meus garçons adoraram o tablet. Pedidos não se perdem mais 🥩", hora: "19:45" },
                { nome: "Cantina Italiana Nonna", msg: "Fiz 85 pedidos ontem pelo sistema. Tudo organizado, sem erro. Recomendo demais! 🍝", hora: "10:12" },
                { nome: "Lanchonete do Zé", msg: "Simples e funciona! Meus clientes pedem pelo celular e eu recebo na hora. Top! 🌭", hora: "13:56" },
                { nome: "Açaí da Praia", msg: "Dobrei as vendas! Agora aceito pedido pelo WhatsApp integrado. Muito bom! 🍨", hora: "16:30" },
                { nome: "Padaria Pão Quente", msg: "Sistema leve e rápido. Até minha mãe conseguiu usar sem dificuldade 😂🥖", hora: "07:15" },
                { nome: "Restaurante Tempero Caseiro", msg: "Economizo R$ 950/mês. Uso há 2 meses e não volto pro iFood nunca mais! 🍲", hora: "12:40" },
                { nome: "Pizzaria Forno a Lenha", msg: "Melhor custo-benefício! R$ 69,90 vs R$ 2.100 que pagava no iFood 🍕", hora: "20:18" },
                { nome: "Hamburgueria Artesanal", msg: "Sistema profissional por um preço justo. Vale cada centavo! 🍔", hora: "18:25" },
                { nome: "Sorveteria Gelato", msg: "Meus clientes amaram o cardápio digital. Ficou muito bonito! 🍦", hora: "15:50" },
                { nome: "Restaurante Vegano Raiz", msg: "Suporte rápido e atencioso. Resolveram minha dúvida em 5 minutos! 🥗", hora: "14:05" },
                { nome: "Espetinho do Carlinhos", msg: "Fácil de usar e barato. Recomendo pra todo mundo! �串", hora: "21:30" }
              ].map((depo, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
                  <div className="mb-3 pb-2 border-b border-gray-100">
                    <h3 className="font-bold text-sm text-gray-900">{depo.nome}</h3>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 relative">
                    <p className="text-gray-800 text-xs leading-relaxed">{depo.msg}</p>
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <span className="text-xs text-gray-400">{depo.hora}</span>
                      <span className="text-blue-500 text-xs">✓✓</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Números Reais */}
            <div className="mt-12 grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-center text-white shadow-xl">
                <div className="text-4xl font-black mb-2">15</div>
                <div className="text-sm font-bold">Clientes Ativos</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-center text-white shadow-xl">
                <div className="text-4xl font-black mb-2">~180</div>
                <div className="text-sm font-bold">Pedidos Hoje</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-center text-white shadow-xl">
                <div className="text-4xl font-black mb-2">R$ 18k</div>
                <div className="text-sm font-bold">Economizado/Mês</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-center text-white shadow-xl">
                <div className="text-4xl font-black mb-2">4.8★</div>
                <div className="text-sm font-bold">Avaliação Média</div>
              </div>
            </div>
          </div>

          {/* Seção de Planos e Preços */}
          <div id="planos" className="mt-20 bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-center text-gray-900">💰 Veja Quanto Você Economiza</h2>
            <p className="text-gray-800 mb-12 text-center text-xl font-bold">Comparação real: 100 pedidos de R$ 50 por mês</p>
            
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
                        <span className="font-semibold">R$ 149,90/mês</span>
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
                          <span className="text-xl font-bold text-green-600">R$ 149,90</span>
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
                  🎉 PRIMEIROS 50: R$ 99,90/mês VITALÍCIO • Restam {displaySpotsLeft} vagas! (Preço normal: R$ 149,90)
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
            
            {/* Banner BLACK FRIDAY */}
            <div className="max-w-3xl mx-auto mt-8 p-1 bg-gradient-to-r from-yellow-400 via-red-600 to-yellow-400 rounded-xl shadow-2xl">
              <div className="bg-black p-4 rounded-lg">
                <p className="text-center text-sm md:text-base text-yellow-400 font-black">
                  🔥 <strong>BLACK FRIDAY</strong> • 30 DIAS GRÁTIS • 🔥 <strong>10 PRIMEIROS: 50% OFF!</strong>
                </p>
                <p className="text-center text-xs md:text-sm text-gray-300 mt-1">
                  De R$ 69,90 por apenas <span className="text-yellow-400 font-black">R$ 34,95/mês</span> (3 meses)
                </p>
                <p className="text-center text-xs text-gray-400 mt-1">
                  Depois: R$ 69,90/mês
                </p>
                <p className="text-center text-xs text-red-500 mt-2 font-bold animate-pulse">
                  ⏰ Termina Segunda-feira 23:59 • Restam {displaySpotsLeft} vagas!
                </p>
              </div>
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
          <div className="mt-16 text-left max-w-3xl mx-auto bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl">
            <h2 className="text-4xl md:text-5xl font-black mb-8 text-center text-gray-900">❓ Perguntas Frequentes</h2>
            <div className="space-y-4">
              <details className="bg-white p-4 rounded-lg shadow-sm border">
                <summary className="font-semibold cursor-pointer">Como funciona o teste grátis?</summary>
                <p className="mt-3 text-gray-600">🔥 <strong>Primeiros 50 clientes:</strong> 15 dias grátis! Depois: 7 dias grátis. Você cria sua conta e tem acesso completo ao sistema. Não pedimos cartão de crédito. Após o período, você decide se quer continuar.</p>
              </details>
              
              <details className="bg-white p-4 rounded-lg shadow-sm border">
                <summary className="font-semibold cursor-pointer">Vocês cobram taxa por pedido?</summary>
                <p className="mt-3 text-gray-600">NÃO! Você paga apenas a mensalidade fixa de R$ 149,90/mês (ou R$ 99,90 se for dos primeiros 50). Zero taxa por pedido, ao contrário do iFood que cobra 27%.</p>
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

          {/* CTA Final BLACK FRIDAY */}
          <div className="mt-16 text-center px-4">
            <div className="max-w-2xl mx-auto mb-6 bg-gradient-to-r from-red-600 via-black to-red-600 p-1 rounded-2xl shadow-2xl">
              <div className="bg-black p-6 rounded-xl">
                <div className="text-yellow-400 font-black text-4xl mb-2">
                  ⚡ ÚLTIMA CHANCE! ⚡
                </div>
                <div className="text-white text-xl font-bold mb-2">
                  50% OFF por 3 meses • Restam <span className="text-yellow-400 text-3xl">{displaySpotsLeft}</span> vagas
                </div>
                <div className="text-gray-300 text-sm mb-2">
                  R$ 34,95/mês (3 meses) • Depois R$ 69,90/mês
                </div>
                <div className="text-red-500 font-black text-sm animate-pulse">
                  Termina Segunda-feira 23:59!
                </div>
              </div>
            </div>
            
            <Link href="/auth/login?register=true" className="inline-block w-full max-w-md">
              <Button size="lg" className="w-full text-lg md:text-xl py-6 md:py-8 px-6 md:px-12 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-black shadow-2xl border-4 border-black transform hover:scale-105 transition-all">
                🔥 GARANTIR 50% OFF AGORA!
              </Button>
            </Link>
            <p className="text-gray-300 mt-4 text-sm md:text-base px-4 font-semibold">
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
