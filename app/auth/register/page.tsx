
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    whatsapp: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          whatsapp: formData.whatsapp?.replace(/\D/g, ''),
        }),
      });

      if (response.ok) {
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Cadastro</CardTitle>
          <CardDescription>
            Crie sua conta para começar a gerenciar seu cardápio online
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Seu nome completo"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <Label htmlFor="restaurantName">Nome do Restaurante</Label>
              <Input
                id="restaurantName"
                name="restaurantName"
                type="text"
                value={formData.restaurantName}
                onChange={handleChange}
                required
                placeholder="Nome do seu restaurante"
              />
            </div>
            
            <div>
              <Label htmlFor="whatsapp">Número do WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Sua senha"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirme sua senha"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="text-red-600 hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
