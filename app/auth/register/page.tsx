
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GTMEvents } from '@/lib/gtm';
import { Check, Shield, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex bg-white">
      {/* Lado Esquerdo - Formulário */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[45%] border-r border-gray-100">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link href="/" className="flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12.5 1.5c-1.4 0-2.5 1.1-2.5 2.5 0 .8.4 1.5 1 1.9V7c0 .6-.4 1-1 1s-1-.4-1-1V5.9c.6-.4 1-1.1 1-1.9 0-1.4-1.1-2.5-2.5-2.5S5 2.6 5 4c0 .8.4 1.5 1 1.9V7c0 .6-.4 1-1 1s-1-.4-1-1V5.9c.6-.4 1-1.1 1-1.9 0-1.4-1.1-2.5-2.5-2.5S0 2.6 0 4c0 1.4 1.1 2.5 2.5 2.5.3 0 .6-.1.9-.2.2 1.2 1.2 2.2 2.6 2.2h12c1.4 0 2.4-1 2.6-2.2.3.1.6.2.9.2 1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5zm-9 8.5v9c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2v-9H3.5z"/>
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-900">Virtual Cardápio</span>
            </Link>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Comece Grátis</h2>
            <p className="text-gray-500">
              Crie seu cardápio digital em menos de 1 minuto. <br/>
              <span className="text-primary font-semibold">Sem cartão de crédito.</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700">
                WhatsApp do Negócio
              </Label>
              <div className="mt-1">
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  required
                  placeholder="(00) 00000-0000"
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Seu melhor Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="voce@restaurante.com"
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50/50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Crie uma Senha
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar minha conta agora'} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
             <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-gray-600">Seus dados estão 100% seguros</span>
             </div>
             <p className="text-sm text-gray-500">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="font-bold text-primary hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Banner/Visual */}
      <div className="hidden lg:flex flex-1 relative bg-slate-50 items-center justify-center overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-lg">
           {/* iPhone Mockup (Simplificado para compor o layout) */}
           <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-[32px] h-[600px] w-[300px] shadow-2xl flex flex-col justify-center overflow-hidden transform rotate-[-5deg] hover:rotate-0 transition-all duration-700">
              <div className="w-[100px] h-[24px] bg-gray-800 absolute top-0 left-1/2 -translate-x-1/2 z-20 rounded-b-[12px]"></div>
              <div className="w-full h-full bg-white relative overflow-hidden">
                <img 
                  src="/videos/Escolhe os Produtos.gif" 
                  className="w-full h-full object-cover" 
                  alt="App Demo"
                />
              </div>
           </div>

           {/* Floating Cards */}
           <div className="absolute top-20 -right-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-bounce delay-700">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Check size={20} strokeWidth={3} />
                 </div>
                 <div>
                    <p className="font-bold text-gray-900">Venda Aprovada</p>
                    <p className="text-xs text-gray-500">R$ 48,90 via PIX</p>
                 </div>
              </div>
           </div>

           <div className="absolute bottom-40 -left-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100 animate-pulse">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                    30%
                 </div>
                 <div>
                    <p className="font-bold text-gray-900">Mais Vendas</p>
                    <p className="text-xs text-gray-500">Com cardápio digital</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
