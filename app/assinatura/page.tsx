"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  start_date: string;
  end_date: string;
}

export default function AssinaturaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);
      
      // Verificar se é admin
         const adminEmails = [
           "michaeldouglasqueiroz@gmail.com",
           "admin@onpedido.com"
         ];
      const userIsAdmin = adminEmails.includes(user.email || "");
      setIsAdmin(userIsAdmin);
      
      await fetchSubscription();
    } catch (error) {
      console.error("Erro ao verificar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Erro ao buscar assinatura:", error);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      // Aqui você integraria com um gateway de pagamento (Stripe, PagSeguro, etc.)
      // Por enquanto, vamos simular o upgrade direto
      const response = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Upgrade realizado com sucesso! Agora você tem 30 dias de acesso completo.");
        await fetchSubscription();
        router.push("/admin");
      } else {
        const error = await response.json();
        alert(`Erro no upgrade: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro no upgrade:", error);
      alert("Erro interno. Tente novamente.");
    } finally {
      setUpgrading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  const isExpired = subscription && new Date(subscription.end_date) < new Date();
  const daysRemaining = subscription ? getDaysRemaining(subscription.end_date) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gerenciar Assinatura
          </h1>
          <p className="text-xl text-gray-600">
            Escolha o plano ideal para seu restaurante
          </p>
          {isAdmin && (
            <div className="mt-4 p-4 bg-purple-100 border border-purple-300 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
                </svg>
                <span className="text-purple-800 font-semibold">🔑 Acesso de Administrador Ativo</span>
              </div>
              <p className="text-purple-700 text-sm mt-1">Você tem acesso completo a todas as funcionalidades como dono do site</p>
            </div>
          )}
        </div>

        {/* Status Atual */}
        {subscription && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Status Atual</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Plano Atual</p>
                <p className={`text-lg font-semibold ${
                  subscription.plan === 'paid' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {subscription.plan === 'paid' ? 'Pago' : 'Gratuito'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-lg font-semibold ${
                  isExpired ? 'text-red-600' : 'text-green-600'
                }`}>
                  {isExpired ? 'Expirado' : 'Ativo'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Dias Restantes</p>
                <p className={`text-lg font-semibold ${
                  daysRemaining <= 1 ? 'text-red-600' : daysRemaining <= 3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {daysRemaining} dias
                </p>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              Válido até: {formatDate(subscription.end_date)}
            </div>
          </div>
        )}

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plano Gratuito */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 text-white p-6 text-center">
              <h3 className="text-2xl font-bold">Plano Gratuito</h3>
              <p className="text-blue-100 mt-2">Teste por 3 dias</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 0</span>
                <span className="text-blue-100">/3 dias</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cardápio digital completo
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Produtos ilimitados
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Relatórios avançados
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Personalização avançada
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Suporte prioritário
                </li>
              </ul>
              <div className="mt-6">
                <button 
                  disabled={!(subscription?.plan === 'free' && !isExpired)}
                  onClick={() => subscription?.plan === 'free' && !isExpired && router.push('/admin/dashboard')}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    subscription?.plan === 'free' && !isExpired
                      ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {subscription?.plan === 'free' && !isExpired ? 'Acessar Dashboard' : 'Plano Atual'}
                </button>
              </div>
            </div>
          </div>

          {/* Plano Pago */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-green-500">
            <div className="bg-green-500 text-white p-6 text-center relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-sm font-semibold rounded-bl-lg">
                Recomendado
              </div>
              <h3 className="text-2xl font-bold">Plano Pago</h3>
              <p className="text-green-100 mt-2">Acesso completo</p>
              <div className="mt-4">
                <span className="text-4xl font-bold">R$ 29,90</span>
                <span className="text-green-100">/mês</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cardápio digital completo
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Produtos ilimitados
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Relatórios avançados
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Personalização avançada
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Suporte prioritário
                </li>
              </ul>
              <div className="mt-6">
                <button 
                  onClick={handleUpgrade}
                  disabled={upgrading || (subscription?.plan === 'paid' && !isExpired)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    subscription?.plan === 'paid' && !isExpired
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : upgrading
                      ? 'bg-green-400 text-white cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {upgrading 
                    ? 'Processando...' 
                    : subscription?.plan === 'paid' && !isExpired
                    ? 'Plano Atual'
                    : 'Fazer Upgrade'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Aviso sobre expiração */}
        {subscription && (isExpired || daysRemaining <= 1) && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">
                  {isExpired ? 'Assinatura Expirada' : 'Assinatura Expirando'}
                </h3>
                <p className="text-red-700 mt-1">
                  {isExpired 
                    ? 'Sua assinatura expirou. Faça upgrade para continuar usando todos os recursos.'
                    : `Sua assinatura expira em ${daysRemaining} dia(s). Faça upgrade para não perder o acesso.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}