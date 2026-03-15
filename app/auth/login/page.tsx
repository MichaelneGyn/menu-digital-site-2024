
'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { GTMEvents } from '@/lib/gtm';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redireciona para cadastro se tiver ?register=true
  useEffect(() => {
    if (searchParams?.get('register') === 'true') {
      router.push('/auth/register');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const email = searchParams?.get('email');
    const verification = searchParams?.get('verification');
    const verified = searchParams?.get('verified');

    if (email) {
      setFormData((current) => (
        current.email === email
          ? current
          : {
              ...current,
              email,
            }
      ));
    }

    if (verification === 'sent') {
      toast.success('Conta criada. Enviamos o link de verificacao para seu email.');
    }

    if (verification === 'resent') {
      toast.success('Seu cadastro ainda estava pendente. Reenviamos o link de verificacao.');
    }

    if (verified === 'success') {
      GTMEvents.startTrial();
      toast.success('Email confirmado. Agora voce ja pode fazer login.');
    }

    if (verified === 'already') {
      toast.success('Esse email ja estava confirmado. Voce ja pode entrar.');
    }

    if (verified === 'expired') {
      toast.error('Seu link expirou. Reenvie a verificacao abaixo.');
    }

    if (verified === 'invalid') {
      toast.error('Link de verificacao invalido ou indisponivel.');
    }
  }, [searchParams]);

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
        if (result.error.includes('EMAIL_NOT_VERIFIED')) {
          toast.error('Confirme seu email antes de entrar.');
        } else {
          toast.error('Email ou senha incorretos');
        }
        setIsLoading(false);
      } else {
        setIsSuccess(true);
        toast.success('Login realizado com sucesso!');
        // Delay para exibir a animação de transição antes de redirecionar
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      }
    } catch (error) {
      toast.error('Erro ao fazer login');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResendVerification = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      toast.error('Informe seu email para reenviar a verificacao.');
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success(data?.message || 'Se houver uma conta pendente, o novo link foi enviado.');
      } else {
        toast.error(data?.error || 'Nao foi possivel reenviar agora.');
      }
    } catch (error) {
      toast.error('Nao foi possivel reenviar agora.');
    } finally {
      setIsResending(false);
    }
  };


  return (
    <>
      {/* Overlay de Transição de Sucesso */}
      {isSuccess && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center animate-bounce shadow-2xl">
              <svg className="w-16 h-16 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.5 1.5c-1.4 0-2.5 1.1-2.5 2.5 0 .8.4 1.5 1 1.9V7c0 .6-.4 1-1 1s-1-.4-1-1V5.9c.6-.4 1-1.1 1-1.9 0-1.4-1.1-2.5-2.5-2.5S5 2.6 5 4c0 .8.4 1.5 1 1.9V7c0 .6-.4 1-1 1s-1-.4-1-1V5.9c.6-.4 1-1.1 1-1.9 0-1.4-1.1-2.5-2.5-2.5S0 2.6 0 4c0 1.4 1.1 2.5 2.5 2.5.3 0 .6-.1.9-.2.2 1.2 1.2 2.2 2.6 2.2h12c1.4 0 2.4-1 2.6-2.2.3.1.6.2.9.2 1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5zm-9 8.5v9c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2v-9H3.5z"/>
              </svg>
            </div>
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping opacity-20"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">Acesso Autorizado!</h2>
          <p className="text-gray-500 font-medium">Preparando seu painel...</p>
        </div>
      )}

      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        {/* Chef Hat Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shadow-lg border border-primary/20">
            <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.5 1.5c-1.4 0-2.5 1.1-2.5 2.5 0 .8.4 1.5 1 1.9V7c0 .6-.4 1-1 1s-1-.4-1-1V5.9c.6-.4 1-1.1 1-1.9 0-1.4-1.1-2.5-2.5-2.5S5 2.6 5 4c0 .8.4 1.5 1 1.9V7c0 .6-.4 1-1 1s-1-.4-1-1V5.9c.6-.4 1-1.1 1-1.9 0-1.4-1.1-2.5-2.5-2.5S0 2.6 0 4c0 1.4 1.1 2.5 2.5 2.5.3 0 .6-.1.9-.2.2 1.2 1.2 2.2 2.6 2.2h12c1.4 0 2.4-1 2.6-2.2.3.1.6.2.9.2 1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5zm-9 8.5v9c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2v-9H3.5z"/>
            </svg>
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-gray-900 text-3xl font-bold mb-2">Virtual Cardápio</h1>
        <p className="text-gray-500 text-lg mb-8">Plataforma de Pedidos</p>

        {/* Login Form */}
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email"
                className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            
            <div>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Senha"
                className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <Button
              type="submit"
              className={`w-full h-14 font-bold text-lg rounded-xl border-0 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg
                ${isLoading 
                  ? 'bg-primary/80 scale-95 opacity-90 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary/90 hover:scale-[1.03] hover:shadow-xl active:scale-95'
                } text-white`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="tracking-widest animate-pulse">ACESSANDO...</span>
                </div>
              ) : (
                <>
                  <span>ENTRAR NO SISTEMA</span>
                  <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900 font-medium">
              No primeiro acesso, voce precisa confirmar o email do cadastro.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="mt-2 text-sm font-semibold text-amber-700 hover:text-amber-900 disabled:opacity-60"
            >
              {isResending ? 'Reenviando link...' : 'Nao recebeu o email? Reenviar verificacao'}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-gray-500 text-sm hover:text-primary underline hover:no-underline transition-colors">
              Esqueci minha senha
            </Link>
          </div>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Não tem conta?{' '}
              <Link href="/auth/register" className="text-primary font-bold hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
