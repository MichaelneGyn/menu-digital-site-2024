'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, Clock } from 'lucide-react';

type SubscriptionInfo = {
  isActive: boolean;
  isAdmin: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysRemaining: number;
  message?: string;
};

export default function SubscriptionExpiredPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/subscription/status');
        if (res.ok) {
          const data = await res.json();
          setInfo(data);
          
          // Se tiver acesso ativo, redireciona
          if (data.isActive || data.isAdmin) {
            router.push('/admin/dashboard');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      checkStatus();
    }
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Verificando assinatura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Assinatura Expirada
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Seu período de teste gratuito terminou. Assine agora para continuar usando todas as funcionalidades!
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Info */}
          {info && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{info.message || 'Sua assinatura expirou'}</span>
              </div>
            </div>
          )}

          {/* Planos */}
          <div className="border-t pt-6 flex justify-center">
            <div className="w-full max-w-md">
              <h3 className="font-semibold text-lg mb-4 text-center">Escolha seu plano:</h3>
              
              <Card className="border-2 border-red-600 shadow-lg relative transform hover:scale-[1.02] transition-all">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  Popular
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">Plano Mensal</CardTitle>
                  <CardDescription>Tudo que você precisa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">R$ 69,90</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">✅</span>
                      Cardápio digital ilimitado
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">✅</span>
                      Pedidos via WhatsApp
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">✅</span>
                      Painel de gestão completo
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">✅</span>
                      Relatórios de vendas
                    </li>
                    <li className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">✅</span>
                      Suporte prioritário
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl shadow-md"
                    onClick={() => router.push('/subscription/checkout?plan=pro')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Assinar Agora
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Garantia */}
          <div className="text-center text-sm text-gray-600 pt-4 border-t">
            <p>🔒 Pagamento 100% seguro via PIX ou Cartão</p>
            <p className="mt-1">💯 Garantia de 7 dias - Cancele quando quiser</p>
          </div>

          {/* Logout */}
          <div className="text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/auth/logout')}
            >
              Fazer logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
