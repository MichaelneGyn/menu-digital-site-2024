'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Menu, X, ChevronRight, Smartphone, Zap, 
  BarChart3, Check, ChefHat, QrCode, ArrowRight,
  ShieldCheck, Clock, DollarSign, Gift, Star, Utensils
} from "lucide-react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const steps = [
    {
      id: "01",
      title: "Cliente Acessa o Cardápio",
      desc: "Via QR Code na mesa ou link direto no WhatsApp. Sem downloads.",
      icon: <QrCode className="w-6 h-6" />,
      video: "/videos/Cliente Acessa o Cardápio.gif"
    },
    {
      id: "02",
      title: "Escolhe os Produtos",
      desc: "Navegação fácil com fotos, descrições e opções de personalização.",
      icon: <Utensils className="w-6 h-6" />,
      video: "/videos/Escolhe os Produtos.gif"
    },
    {
      id: "03",
      title: "Finaliza o Pedido",
      desc: "Pagamento online integrado ou na entrega/retirada. Rápido e seguro.",
      icon: <Smartphone className="w-6 h-6" />,
      video: "/videos/Finaliza o Pedido (1).gif"
    },
    {
      id: "04",
      title: "Você Recebe Instantaneamente",
      desc: "Notificação em tempo real no seu painel administrativo e WhatsApp.",
      icon: <Check className="w-6 h-6" />,
      video: "/videos/Você Recebe Instantaneamente.gif"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans overflow-x-hidden selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-black/[0.03]">
        <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl shadow-[0_8px_16px_-4px_rgba(255,107,53,0.3)]">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-[#1A1A1A]">
              Virtual<span className="text-primary">Cardápio</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#funciona" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">Como Funciona</a>
            <a href="#recursos" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">Recursos</a>
            <a href="#precos" className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">Planos</a>
            <div className="flex items-center gap-3 ml-4">
              <Link href="/auth/login" className="bg-[#1A1A1A] text-white hover:bg-black px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg">
                Entrar
              </Link>
              <Link href="/auth/login?register=true" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20">
                Criar Grátis
              </Link>
            </div>
          </div>

          <button className="md:hidden p-2 text-foreground" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
            <a href="#funciona" className="text-lg font-bold p-2" onClick={() => setIsMenuOpen(false)}>Como Funciona</a>
            <a href="#recursos" className="text-lg font-bold p-2" onClick={() => setIsMenuOpen(false)}>Recursos</a>
            <a href="#precos" className="text-lg font-bold p-2" onClick={() => setIsMenuOpen(false)}>Planos</a>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link href="/auth/login" className="bg-muted text-foreground py-4 rounded-2xl font-bold text-center">Login</Link>
              <Link href="/auth/login?register=true" className="bg-primary text-white py-4 rounded-2xl font-bold text-center">Começar</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10"
            >
              <h1 className="text-5xl md:text-8xl font-display font-bold leading-[0.95] text-[#111111] mb-8 tracking-tighter">
                Venda mais com um <br/>
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary italic">Cardápio Inteligente.</span>
                  <motion.span 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="absolute -bottom-2 left-0 h-4 bg-primary/10 -z-10 rounded-full"
                  />
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl leading-relaxed mb-12 font-medium">
                Abandone os PDFs estáticos. Ofereça uma experiência interativa que <span className="text-[#111111] font-bold">converte visitantes em clientes famintos.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <Link 
                  href="/auth/login?register=true"
                  className="bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-[24px] font-black text-lg transition-all transform hover:scale-105 hover:rotate-1 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3"
                >
                  Criar Meu Cardápio <ArrowRight className="w-6 h-6" />
                </Link>
                <button className="bg-white hover:bg-muted text-foreground border-2 border-border px-10 py-5 rounded-[24px] font-black text-lg transition-all flex items-center justify-center gap-3">
                  Ver Exemplo <Smartphone className="w-6 h-6" />
                </button>
              </div>

            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative lg:ml-auto"
            >
              <div className="relative z-10 p-4 md:p-8 bg-white/50 backdrop-blur-sm rounded-[48px] border border-white/40 shadow-2xl">
                <div className="rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-background">
                  <img 
                    src="/assets/hero-menu.png" 
                    alt="Virtual Cardápio interface" 
                    className="w-full h-auto object-cover transform hover:scale-105 transition-all duration-1000"
                  />
                </div>
              </div>
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -left-6 md:-left-12 bg-white p-6 rounded-3xl shadow-2xl border border-border z-20 hidden md:block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">Aumento de 30%</div>
                    <div className="text-xs text-muted-foreground">Nas vendas via cardápio</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center justify-items-center text-white">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-display font-black mb-2 tracking-tighter">15+</div>
              <div className="text-sm font-bold opacity-80">Clientes Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-display font-black mb-2 tracking-tighter">180+</div>
              <div className="text-sm font-bold opacity-80">Pedidos/Dia</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-display font-black mb-2 tracking-tighter">R$ 18k</div>
              <div className="text-sm font-bold opacity-80">Economizado/Mês</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl md:text-5xl font-display font-black tracking-tighter">4.9</span>
                <Star className="w-8 h-8 fill-white" />
              </div>
              <div className="text-sm font-bold opacity-80">Avaliação</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="funciona" className="py-24 md:py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-foreground leading-tight">
                Processo inteligente, <br/><span className="text-primary">resultado imediato.</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Elimine erros de pedido e filas. Ofereça autonomia para o seu cliente com um processo fluido e 100% digital.
              </p>
            </div>
            <div className="hidden lg:block">
               <button className="group flex items-center gap-2 font-bold text-primary hover:gap-4 transition-all">
                  Ver tutorial completo <ChevronRight className="w-5 h-5" />
               </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div 
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="group flex flex-col items-center"
            >
              <div className="relative mb-8 w-full max-w-[280px]">
                {/* iPhone 16 Pro Max Mockup */}
                <div className="relative mx-auto h-[550px] w-full bg-black rounded-[50px] shadow-[0_0_0_2px_#3f3f3f,0_0_0_6px_#1f1f1f,0_20px_50px_rgba(0,0,0,0.4)] border-[8px] border-black overflow-hidden ring-1 ring-white/10 transform transition-transform duration-500 hover:scale-[1.02]">
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-[12px] left-1/2 -translate-x-1/2 h-[26px] w-[90px] bg-black rounded-full z-20 flex items-center justify-center pointer-events-none">
                     <div className="w-16 h-4 bg-[#0a0a0a] rounded-full flex items-center justify-end px-2 gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#1a1a1a] shadow-inner"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2f2f2f]"></div>
                     </div>
                  </div>

                  {/* Side Buttons */}
                  <div className="absolute top-[100px] -left-[10px] w-[3px] h-[26px] bg-[#2f2f2f] rounded-l-md shadow-[-1px_0_1px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute top-[140px] -left-[10px] w-[3px] h-[50px] bg-[#2f2f2f] rounded-l-md shadow-[-1px_0_1px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute top-[200px] -left-[10px] w-[3px] h-[50px] bg-[#2f2f2f] rounded-l-md shadow-[-1px_0_1px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute top-[130px] -right-[10px] w-[3px] h-[80px] bg-[#2f2f2f] rounded-r-md shadow-[1px_0_1px_rgba(0,0,0,0.5)]"></div>

                  {/* Screen Content */}
                  <div className="w-full h-full bg-white rounded-[42px] overflow-hidden relative border-[3px] border-black">
                    {/* Status Bar Mock */}
                    <div className="absolute top-0 w-full h-12 px-7 flex justify-between items-center z-10 text-black font-medium text-[10px] pt-3">
                        <span className="font-semibold">9:41</span>
                        <div className="flex gap-1.5 items-center">
                           <div className="w-4 h-2.5 bg-black rounded-[2px]"></div>
                           <div className="w-4 h-2.5 bg-black rounded-[2px]"></div>
                           <div className="w-5 h-2.5 border border-black/30 rounded-[3px] relative">
                              <div className="absolute inset-0.5 bg-black rounded-[1px]"></div>
                           </div>
                        </div>
                    </div>

                    {step.video ? (
                      <img 
                        src={step.video} 
                        className="w-full h-full object-cover"
                        alt={step.title}
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                          {step.icon}
                        </div>
                      </div>
                    )}
                    
                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/80 rounded-full z-10"></div>
                  </div>
                </div>
                
                {/* Step Number Overlay */}
                <div className="absolute top-4 -left-2 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-display font-black text-xl shadow-[0_8px_20px_rgba(255,107,53,0.4)] border-4 border-white z-30 transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                  {step.id}
                </div>
              </div>
              
              <h3 className="text-xl font-display font-bold mb-3 text-[#111111] text-center group-hover:text-primary transition-colors tracking-tight">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium text-center opacity-80 group-hover:opacity-100 transition-opacity px-4">
                {step.desc}
              </p>
            </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upsell/Modern Features Highlight */}
      <section className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10" />
         
         <div className="container mx-auto px-4 md:px-6">
           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1">
                <div className="relative mx-auto max-w-[400px]">
                   <div className="relative z-10 flex flex-col gap-4 items-center justify-center h-full">
                        {/* iPhone 14/15 Pro Mockup */}
                        <div className="relative mx-auto h-[600px] w-[300px] bg-black rounded-[55px] shadow-[0_0_0_2px_#3f3f3f,0_0_0_6px_#1f1f1f,0_20px_50px_rgba(0,0,0,0.5)] border-[8px] border-black overflow-hidden ring-1 ring-white/10">
                          
                          {/* Dynamic Island / Notch */}
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[28px] w-[100px] bg-black rounded-b-[18px] z-20 flex items-center justify-center">
                             {/* Camera/Sensors */}
                             <div className="w-16 h-4 bg-[#0a0a0a] rounded-full flex items-center justify-end px-2 gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#1a1a1a] shadow-inner"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#2f2f2f"></div>
                             </div>
                          </div>

                          {/* Side Buttons */}
                          <div className="absolute top-[100px] -left-[10px] w-[3px] h-[26px] bg-[#2f2f2f] rounded-l-md shadow-[-1px_0_1px_rgba(0,0,0,0.5)]"></div> {/* Mute Switch */}
                          <div className="absolute top-[140px] -left-[10px] w-[3px] h-[50px] bg-[#2f2f2f] rounded-l-md shadow-[-1px_0_1px_rgba(0,0,0,0.5)]"></div> {/* Vol Up */}
                          <div className="absolute top-[200px] -left-[10px] w-[3px] h-[50px] bg-[#2f2f2f] rounded-l-md shadow-[-1px_0_1px_rgba(0,0,0,0.5)]"></div> {/* Vol Down */}
                          <div className="absolute top-[130px] -right-[10px] w-[3px] h-[80px] bg-[#2f2f2f] rounded-r-md shadow-[1px_0_1px_rgba(0,0,0,0.5)]"></div> {/* Power */}

                          {/* Screen Content */}
                          <div className="w-full h-full bg-white rounded-[46px] overflow-hidden relative">
                             {/* Status Bar Fake */}
                             <div className="absolute top-0 w-full h-10 px-6 flex justify-between items-center z-10 text-black font-medium text-[10px] pt-2">
                                <span>9:41</span>
                                <div className="flex gap-1.5 items-center">
                                   <div className="w-4 h-2.5 bg-black rounded-[2px] opacity-20"></div> {/* Signal */}
                                   <div className="w-4 h-2.5 bg-black rounded-[2px] opacity-20"></div> {/* WiFi */}
                                   <div className="w-5 h-2.5 border border-black/30 rounded-[3px] relative">
                                      <div className="absolute inset-0.5 bg-black rounded-[1px]"></div>
                                   </div> {/* Battery */}
                                </div>
                             </div>

                             <img 
                               src="/attached_assets/simulação_de_pedido_2_1769532247933.gif" 
                               className="w-full h-full object-cover" 
                               alt="App screenshot"
                             />
                             
                             {/* Upsell Pop-up Mockup */}
                             <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none flex items-end justify-center pb-8 bg-black/10 backdrop-blur-[1px]">
                                <div className="bg-white p-4 rounded-2xl shadow-2xl w-[85%] animate-bounce border border-gray-100 relative z-10">
                                   <div className="flex justify-between items-center mb-2">
                                      <span className="font-bold text-sm text-gray-800">Vai uma bebida?</span>
                                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Promoção</span>
                                   </div>
                                   <div className="flex gap-3 items-center">
                                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex-shrink-0 flex items-center justify-center text-xl">🥤</div>
                                      <div className="flex-1">
                                         <div className="h-2 w-20 bg-gray-200 rounded mb-1.5"></div>
                                         <div className="h-2 w-12 bg-gray-100 rounded"></div>
                                      </div>
                                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">+</div>
                                   </div>
                                </div>
                             </div>
                             
                             {/* Home Indicator */}
                             <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full z-10"></div>
                          </div>
                        </div>
                      </div>
                   {/* Background aura */}
                   <div className="absolute inset-0 bg-primary rounded-full blur-[100px] opacity-20 -z-10" />
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 leading-tight">
                  Aumente seu ticket médio com <span className="text-primary">Upsell Automático.</span>
                </h2>
                <div className="space-y-8">
                   <div className="flex gap-6">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                         <Zap className="text-primary w-7 h-7" />
                      </div>
                      <div>
                         <h4 className="text-xl font-bold mb-2">Sugestões Inteligentes</h4>
                         <p className="text-secondary-foreground/70 leading-relaxed">
                            O sistema sugere acompanhamentos e bebidas automaticamente antes do fechamento do pedido.
                         </p>
                      </div>
                   </div>
                   <div className="flex gap-6">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                         <BarChart3 className="text-primary w-7 h-7" />
                      </div>
                      <div>
                         <h4 className="text-xl font-bold mb-2">Monitoramento de Pedidos</h4>
                         <p className="text-secondary-foreground/70 leading-relaxed">
                            Seu cliente acompanha cada etapa do pedido em tempo real, reduzindo a ansiedade e chamados.
                         </p>
                      </div>
                   </div>
                </div>
                <button className="mt-12 bg-white text-secondary py-5 px-10 rounded-2xl font-black text-lg hover:bg-primary hover:text-white transition-all shadow-xl">
                  Quero Vender Mais
                </button>
              </div>
           </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold mb-6">Tudo que você precisa em um só lugar</h2>
            <p className="text-xl text-muted-foreground">Ferramentas profissionais para gerenciar seu restaurante</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Cardápio Digital",
                desc: "Cardápio online personalizável com fotos, descrições e preços. Atualize em tempo real.",
                icon: <Menu className="w-6 h-6" />
              },
              {
                title: "Gestão de Pedidos",
                desc: "Receba e gerencie pedidos em tempo real. Kitchen display e notificações automáticas.",
                icon: <Check className="w-6 h-6" />
              },
              {
                title: "QR Code para Mesas",
                desc: "Clientes fazem pedidos direto da mesa escaneando o QR Code. Sem aplicativo.",
                icon: <QrCode className="w-6 h-6" />
              },
              {
                title: "Relatórios e CMV",
                desc: "Análise completa de vendas, custos e lucratividade. Tome decisões baseadas em dados.",
                icon: <BarChart3 className="w-6 h-6" />
              },
              {
                title: "Cupons de Desconto",
                desc: "Crie promoções e cupons personalizados para aumentar suas vendas.",
                icon: <Gift className="w-6 h-6" />
              },
              {
                title: "Sem Comissão",
                desc: "Pague apenas R$ 69,90/mês. Zero taxa por pedido. Todo lucro é seu.",
                icon: <DollarSign className="w-6 h-6" />
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="bg-background p-8 rounded-3xl border border-border shadow-sm transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/5 group"
              >
                <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:bg-primary group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-[#111111]">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground">
              Restaurantes que confiam em nós
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Pizzaria Bella Napoli",
                initial: "P",
                text: "Sistema completo e fácil de usar. Economizei muito no primeiro mês.",
                color: "bg-orange-500"
              },
              {
                name: "Burger House",
                initial: "B",
                text: "Configuração rápida. Clientes gostaram da praticidade do cardápio digital.",
                color: "bg-orange-600"
              },
              {
                name: "Sushi Bar Matsuri",
                initial: "S",
                text: "Redução significativa nos custos operacionais. Recomendo muito!",
                color: "bg-orange-500"
              }
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] flex flex-col items-start gap-6 hover:-translate-y-2 transition-transform duration-300">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-lg text-gray-700 font-medium leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-4 mt-auto">
                  <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                    {testimonial.initial}
                  </div>
                  <div>
                    <div className="font-bold text-[#111111]">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">Cliente verificado</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-24 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Investimento justo para o seu <span className="text-primary">sucesso.</span></h2>
            <p className="text-xl text-muted-foreground">Compare os custos e veja quanto você economiza vs iFood</p>
          </div>

          <div className="max-w-[500px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-[48px] border border-border shadow-2xl overflow-hidden relative"
            >
              <div className="p-12 text-center border-b border-border/50">
                <div className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Plano Completo</div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-4xl font-display font-black text-foreground">R$</span>
                  <span className="text-7xl font-display font-black text-foreground">69,90</span>
                  <span className="text-xl font-bold text-muted-foreground">/mês</span>
                </div>
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary/5 rounded-full text-primary font-bold text-sm border border-primary/10">
                  <Zap className="w-4 h-4 fill-primary" />
                  30 dias grátis para testar
                </div>
              </div>

              <div className="p-12 bg-slate-50/50">
                <ul className="space-y-5 mb-10">
                  {[
                    "Pedidos ilimitados",
                    "Cardápio digital completo",
                    "QR Code para mesas",
                    "Kitchen Display",
                    "Relatórios e CMV",
                    "Cupons de desconto",
                    "Suporte via WhatsApp",
                    "Zero comissão por pedido"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-foreground/80 font-medium">
                      <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-green-600 stroke-[3]" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/auth/login?register=true"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-3xl font-black text-xl transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 group"
                >
                  Começar agora <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <p className="text-center text-sm text-muted-foreground mt-6">
                  Não é necessário cartão de crédito para começar
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="bg-[#0B0E14] rounded-[64px] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-3xl">
            {/* CTA Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-7xl font-display font-bold mb-8 tracking-tight">
                Seu cardápio novo está a <span className="text-primary">um clique.</span>
              </h2>
              <p className="text-xl text-white/60 mb-12 font-medium">
                Junte-se a centenas de estabelecimentos que já modernizaram seu atendimento e economizam milhares de reais em taxas.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                  href="/auth/login?register=true"
                  className="bg-primary text-white px-12 py-6 rounded-[28px] font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center"
                >
                  Começar Agora Grátis
                </Link>
                <a 
                  href="https://wa.me/5562981105064?text=Ol%C3%A1!%20Gostaria%20de%20falar%20com%20um%20consultor%20sobre%20o%20Virtual%20Card%C3%A1pio."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 backdrop-blur-md border-2 border-white/10 px-12 py-6 rounded-[28px] font-black text-xl hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  Falar com Consultor
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Animated Button */}
      <motion.a
        href="https://wa.me/5562981105064"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-[60] cursor-pointer"
      >
        <div className="relative flex items-center justify-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.8],
              opacity: [0.5, 0] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-[#25D366] rounded-full -z-10"
          />
          <motion.div 
            animate={{ 
              scale: [1, 2.2],
              opacity: [0.3, 0] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: 1
            }}
            className="absolute inset-0 bg-[#25D366] rounded-full -z-10"
          />
          
          {/* Main static button */}
          <div className="relative bg-[#25D366] text-white p-5 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.3)]">
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.969c0 2.112.551 4.173 1.597 5.981L0 24l6.152-1.613a11.822 11.822 0 005.894 1.562h.005c6.604 0 11.968-5.364 11.97-11.97 0-3.202-1.246-6.212-3.506-8.471z"/>
            </svg>
          </div>
        </div>
      </motion.a>

      {/* Footer */}
      <footer className="bg-[#0B0E14] text-white py-20 border-t border-white/5 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 p-2 rounded-xl">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl leading-none">Virtual Cardápio</h3>
                  <p className="text-xs text-white/50 mt-1">Plataforma de Pedidos</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                Seu próprio sistema de delivery e gestão, sem comissão. Como o iFood, mas 100% seu.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Empresa</h4>
              <ul className="space-y-4 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#precos" className="hover:text-white transition-colors">Planos e Preços</a></li>
                <li><a href="#funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cases de Sucesso</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Suporte</h4>
              <ul className="space-y-4 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutoriais</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Contato</h4>
              <ul className="space-y-4 text-sm text-white/50">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">📧</div>
                  virtualcardapio@gmail.com
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">📱</div>
                  (62) 98110-5064
                </li>
                <li className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">⏰</div>
                    <span>Suporte via WhatsApp</span>
                  </div>
                  <span className="text-[10px] ml-8">Suporte o mais rápido possível</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">📸</div>
                  @virtualcardapio
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center gap-6 mb-12">
            <a 
              href="https://instagram.com/virtualcardapio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 group"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a 
              href="https://wa.me/5562981105064" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 group"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" 
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.969c0 2.112.551 4.173 1.597 5.981L0 24l6.152-1.613a11.822 11.822 0 005.894 1.562h.005c6.604 0 11.968-5.364 11.97-11.97 0-3.202-1.246-6.212-3.506-8.471z"/>
              </svg>
            </a>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-white/40">
              © 2025 <span className="font-bold text-white/60">Virtual Cardápio</span>. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-8 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
