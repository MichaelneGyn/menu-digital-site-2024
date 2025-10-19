
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Email ou senha incorretos');
      } else {
        toast.success('Login realizado com sucesso!');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-4">
      {/* Chef Hat Logo */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.5 1.5c-1.4 0-2.5 1.1-2.5 2.5 0 .8.4 1.5 1 1.9V7c0 .6-.4 1-1 1s-1-.4-1-1V5.9c.6-.4 1-1.1 1-1.9 0-1.4-1.1-2.5-2.5-2.5S5 2.6 5 4c0 .8.4 1.5 1 1.9V7c0 .6-.4 1-1 1s-1-.4-1-1V5.9c.6-.4 1-1.1 1-1.9 0-1.4-1.1-2.5-2.5-2.5S0 2.6 0 4c0 1.4 1.1 2.5 2.5 2.5.3 0 .6-.1.9-.2.2 1.2 1.2 2.2 2.6 2.2h12c1.4 0 2.4-1 2.6-2.2.3.1.6.2.9.2 1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5zm-9 8.5v9c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2v-9H3.5z"/>
          </svg>
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-white text-3xl font-bold mb-2">OnPedido</h1>
      <p className="text-red-100 text-lg mb-8">Seja bem vindo!</p>

      {/* Login Form */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full h-12 px-4 rounded-lg border-0 bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="......"
              className="w-full h-12 px-4 rounded-lg border-0 bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-lg border-0 transition-colors duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'ENTRANDO...' : 'ENTRAR'}
          </Button>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <Link href="/auth/forgot-password" className="text-red-100 text-sm hover:text-white underline hover:no-underline">
            Esqueci minha senha
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-red-100 text-sm">
            Não tem conta?{' '}
            <Link href="/auth/register" className="text-white font-semibold underline hover:no-underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
