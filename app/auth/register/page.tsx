
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GTMEvents } from '@/lib/gtm';
import { Check, Zap, TrendingUp, Shield } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    whatsapp: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.whatsapp) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const cleanWhatsapp = formData.whatsapp.replace(/\D/g, '');

      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Restaurante',
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.password,
          restaurantName: 'Meu Restaurante',
          whatsapp: cleanWhatsapp,
        }),
      });

      if (response.ok) {
        // Rastreia conversão de cadastro
        GTMEvents.signup();
        GTMEvents.startTrial();
        
        toast.success('🎉 Conta criada! Faça login para começar.');
        router.push('/auth/login');
      } else {
        const error = await response.text();
        toast.error(error || 'Erro ao criar conta');
      }
    } catch (error) {
      toast.error('Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'whatsapp') {
      // Máscara BR: (00) 00000-0000
      const digits = value.replace(/\D/g, '').slice(0, 11);
      let masked = digits;
      if (digits.length > 0) masked = `(${digits.slice(0,2)}`;
      if (digits.length >= 3) masked = `(${digits.slice(0,2)}) ${digits.slice(2,7)}`;
      if (digits.length >= 8) masked = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7,11)}`;
      setFormData({ ...formData, whatsapp: masked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-orange-600">
            Virtual Cardápio
          </Link>
          <Link href="/auth/login">
            <Button variant="ghost" className="font-semibold">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-12">
        
        {/* SEÇÃO 1: Vídeos + Por que escolher? - PARA TODOS */}
        <div className="mb-8 max-w-4xl mx-auto">
          
          {/* Grid de Vídeos - 2 colunas em todas as telas */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3 lg:gap-6">
              {/* Vídeo 1 - Simulação de Pedido */}
              <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl p-3 lg:p-4 border-2 border-orange-200">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3 shadow-md">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/videos/Simulação de pedido.mp4" type="video/mp4" />
                  </video>
                </div>
                <h3 className="font-bold text-xs lg:text-sm text-gray-900 text-center">📱 Como Funciona</h3>
                <p className="text-[10px] lg:text-xs text-gray-600 text-center mt-0.5 lg:mt-1">
                  Veja um pedido real!
                </p>
              </div>

              {/* Vídeo 2 - Upsell */}
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-3 lg:p-4 border-2 border-green-200">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3 shadow-md">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/videos/Criar up sell .mp4" type="video/mp4" />
                  </video>
                </div>
                <h3 className="font-bold text-xs lg:text-sm text-gray-900 text-center">💰 Upsell</h3>
                <p className="text-[10px] lg:text-xs text-gray-600 text-center mt-0.5 lg:mt-1">
                  Aumenta vendas!
                </p>
              </div>
            </div>
          </div>

          {/* Card: Por que escolher? */}
          <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-gray-100">
            <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2 justify-center lg:justify-start">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Por que escolher?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  <strong>0% de comissão</strong> por pedido
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  <strong>Economize até R$ 1.400/mês</strong> vs iFood
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  <strong>Seus clientes</strong> são seus para sempre
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  <strong>Suporte rápido</strong> via WhatsApp
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* FORMULÁRIO CENTRALIZADO */}
        <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-orange-200">
              {/* Header do Card */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 text-center">
                <h1 className="text-3xl md:text-4xl font-black mb-2">
                  🚀 Comece Grátis
                </h1>
                <p className="text-orange-100 text-sm">
                  Crie sua conta em 30 segundos
                </p>
                <div className="mt-4 inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-sm font-bold">
                    🎉 30 dias grátis • Sem cartão de crédito
                  </p>
                </div>
              </div>

              {/* Formulário */}
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  <div>
                    <Label htmlFor="whatsapp" className="text-base font-bold text-gray-700">
                      📱 WhatsApp
                    </Label>
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      placeholder="(11) 99999-9999"
                      className="h-14 mt-2 text-base border-2 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Para contato e suporte</p>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-bold text-gray-700">
                      ✉️ Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="seu@email.com"
                      className="h-14 mt-2 text-base border-2 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Seu login no sistema</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="text-base font-bold text-gray-700">
                      🔒 Senha
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="h-14 mt-2 text-base border-2 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Mínimo 6 caracteres</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-black bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? '⏳ Criando sua conta...' : '✨ Criar Conta Grátis'}
                  </Button>
                  
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-bold text-green-900">Garantia de 30 dias</p>
                    </div>
                    <p className="text-xs text-green-700">
                      Teste grátis por 30 dias. Cancele quando quiser, sem burocracia.
                    </p>
                  </div>
                </form>

                <div className="mt-6 text-center border-t pt-6">
                  <p className="text-sm text-gray-600">
                    Já tem uma conta?{' '}
                    <Link href="/auth/login" className="text-orange-600 hover:underline font-bold">
                      Faça login aqui
                    </Link>
                  </p>
                </div>
              </div>
            </div>
        </div>

        {/* SEÇÃO 3: Dicas + Oferta + O que está incluso - PARA TODOS */}
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Card: Dicas para Aumentar Conversões */}
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-5 border-2 border-green-200 shadow-lg">
            <h3 className="font-black text-lg text-gray-900 mb-4 text-center">🔥 Dicas para AUMENTAR CONVERSÕES:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-2xl">👍</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">USE DESCONTOS:</p>
                  <p className="text-xs text-gray-700">10-20% de desconto aumenta conversão em até 300%!</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🍕</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">Produtos Complementares:</p>
                  <p className="text-xs text-gray-700">Pizza + Refrigerante, Hambúrguer + Batata</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Card: Preço */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
            <h3 className="font-black text-xl mb-3 text-center">💰 Plano Mensal</h3>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-3">
              <p className="text-xs font-bold mb-1 text-center">Mensalidade:</p>
              <p className="text-3xl font-black text-center">R$ 69,90<span className="text-base">/mês</span></p>
              <p className="text-xs opacity-90 mt-2 text-center">✨ Sem taxas por pedido!</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xs font-bold mb-1">🎉 30 dias grátis</p>
              <p className="text-xs opacity-90">Teste sem compromisso</p>
            </div>
          </div>

          {/* Card: O que está incluso? */}
          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 mb-3">📊 O que está incluso?</h3>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Cardápio digital ilimitado
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Pedidos via WhatsApp
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Relatórios de vendas
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Suporte prioritário
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Atualizações gratuitas
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
