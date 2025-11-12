
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GTMEvents } from '@/lib/gtm';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    restaurantName: '',
    whatsapp: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.restaurantName || !formData.whatsapp) {
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
          name: formData.restaurantName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.password,
          restaurantName: formData.restaurantName,
          whatsapp: cleanWhatsapp,
        }),
      });

      if (response.ok) {
        // Rastreia conversão de cadastro
        GTMEvents.signup();
        GTMEvents.startTrial();
        
        toast.success('Conta criada com sucesso! Faça login para continuar.');
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-orange-50 to-white">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-black">🚀 Cadastro</CardTitle>
          <CardDescription className="text-orange-100">
            Crie sua conta para começar a gerenciar seu cardápio online
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="restaurantName" className="font-semibold">Nome do Restaurante</Label>
              <Input
                id="restaurantName"
                name="restaurantName"
                type="text"
                value={formData.restaurantName}
                onChange={handleChange}
                required
                placeholder="Ex: Pizzaria Bella Napoli"
                className="h-12 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="whatsapp" className="font-semibold">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                required
                placeholder="(11) 99999-9999"
                className="h-12 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="font-semibold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
                className="h-12 mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="font-semibold">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
                className="h-12 mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
            
            <p className="text-center text-xs text-gray-600">
              ✅ 30 dias grátis • ✅ Sem cartão • ✅ Cancele quando quiser
            </p>
          </form>

          <div className="mt-6 text-center border-t pt-6">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-orange-600 hover:underline font-bold">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
