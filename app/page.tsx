'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, Play, ArrowRight, Star, Zap, Shield, TrendingUp, Menu as MenuIcon, ClipboardList, QrCode, BarChart3, Ticket, DollarSign } from 'lucide-react';
import LandingHeader from '@/components/LandingHeader';
import LandingFooter from '@/components/LandingFooter';
import PhoneMockup from '@/components/PhoneMockup';
import { useLanguage } from '@/contexts/LanguageContext';
import { GTMEvents } from '@/lib/gtm';

export default function HomePage() {
  const { t, formatPrice } = useLanguage();

  return (
    <>
      <LandingHeader />
      
      {/* Hero Section - Estilo Anota AI */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-32 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(251 146 60) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                <span>Teste Grátis por 30 Dias</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t('hero.title')}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t('hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/auth/login?register=true">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                    onClick={() => GTMEvents.clickFreeTrial()}
                  >
                    {t('hero.cta')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto text-lg px-8 py-6 border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50"
                  onClick={() => {
                    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demonstração
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>{t('hero.noCard')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>{t('hero.cancelAnytime')}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 font-semibold">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Right - Phone Mockup with Video */}
            <div className="flex justify-center lg:justify-end">
              <PhoneMockup
                video="/videos/Criar up sell .mp4"
                alt="Demonstração do sistema"
                blurPersonalData={true}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-orange-100">Clientes Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">180+</div>
              <div className="text-orange-100">Pedidos/Dia</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">R$ 18k</div>
              <div className="text-orange-100">Economizado/Mês</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-orange-100">Avaliação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Veja o Sistema em Ação
            </h2>
            <p className="text-xl text-gray-600">
              Interface simples e intuitiva para você e seus clientes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <PhoneMockup
                video="/videos/simulação de pedido 2.mp4"
                alt="Simulação de pedido"
                blurPersonalData={true}
              />
            </div>
            <div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Cliente Acessa o Cardápio</h3>
                    <p className="text-gray-600">Via QR Code na mesa ou link direto no WhatsApp</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Escolhe os Produtos</h3>
                    <p className="text-gray-600">Navegação fácil com fotos e descrições completas</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Finaliza o Pedido</h3>
                    <p className="text-gray-600">Pagamento online ou na entrega/retirada</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Você Recebe Instantaneamente</h3>
                    <p className="text-gray-600">Notificação em tempo real no painel administrativo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Estilo Anota AI */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MenuIcon,
                title: t('features.menu.title'),
                description: t('features.menu.desc'),
              },
              {
                icon: ClipboardList,
                title: t('features.orders.title'),
                description: t('features.orders.desc'),
              },
              {
                icon: QrCode,
                title: t('features.qr.title'),
                description: t('features.qr.desc'),
              },
              {
                icon: BarChart3,
                title: t('features.reports.title'),
                description: t('features.reports.desc'),
              },
              {
                icon: Ticket,
                title: t('features.coupons.title'),
                description: t('features.coupons.desc'),
              },
              {
                icon: DollarSign,
                title: t('features.noCommission.title'),
                description: t('features.noCommission.desc'),
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-orange-50 text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section - Estilo Clean Professional */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Pricing Card */}
          <div className="relative max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative hover:shadow-2xl transition-shadow duration-300">
              {/* Popular Badge - Cleaner */}
              <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                MAIS POPULAR
              </div>

              <div className="p-10 text-center border-b border-gray-100">
                <h3 className="text-xl font-medium text-gray-500 mb-4 uppercase tracking-wide">{t('pricing.plan')}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-5xl font-bold text-gray-900">{formatPrice(69.90)}</span>
                  <span className="text-xl text-gray-500">/mês</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  {t('pricing.trial')}
                </div>
              </div>

              <div className="p-10 bg-white">
                <div className="space-y-4 mb-10">
                  {[
                    'Pedidos ilimitados',
                    'Cardápio digital completo',
                    'QR Code para mesas',
                    'Kitchen Display',
                    'Relatórios e CMV',
                    'Cupons de desconto',
                    'Suporte via WhatsApp',
                    'Zero comissão por pedido'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/auth/login?register=true" className="block">
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-lg hover:shadow-orange-200 transition-all"
                  >
                    {t('pricing.cta')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-center text-gray-400 text-sm mt-6">
                  Não é necessário cartão de crédito para começar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Restaurantes que confiam em nós
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { nome: "Pizzaria Bella Napoli", msg: "Sistema completo e fácil de usar. Economizei muito no primeiro mês.", rating: 5 },
              { nome: "Burger House", msg: "Configuração rápida. Clientes gostaram da praticidade do cardápio digital.", rating: 5 },
              { nome: "Sushi Bar Matsuri", msg: "Redução significativa nos custos operacionais. Recomendo muito!", rating: 5 }
            ].map((depo, i) => (
              <div key={i} className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 shadow-lg border border-orange-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(depo.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">"{depo.msg}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                    {depo.nome.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{depo.nome}</div>
                    <div className="text-sm text-gray-500">Cliente verificado</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            {t('cta.subtitle')}
          </p>
          <Link href="/auth/login?register=true">
            <Button 
              size="lg" 
              className="text-lg px-12 py-6 bg-white text-orange-600 hover:bg-gray-100 shadow-2xl transform hover:scale-105 transition-all"
            >
              {t('cta.button')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <LandingFooter />
    </>
  );
}
