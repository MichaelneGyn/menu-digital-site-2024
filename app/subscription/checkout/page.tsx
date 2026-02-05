'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, QrCode, Copy, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = {
  pro: {
    name: 'Plano Mensal',
    price: 69.90,
    popular: true,
    features: [
      'Cardápio digital ilimitado',
      'Pedidos via WhatsApp',
      'Painel de gestão completo',
      'Relatórios de vendas',
      'Suporte prioritário',
      'Itens ilimitados',
      'Cupons de desconto',
    ],
  },
};

type Plan = 'pro';

type PaymentData = {
  id: string;
  amount: number;
  pixKey: string;
  pixQrCode: string;
  pixCopyPaste: string;
  status: string;
};

function CheckoutPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan>('pro');
  const [step, setStep] = useState<'confirm' | 'payment'>('confirm'); // Inicia na confirmação
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Como só tem um plano, podemos pular a etapa de seleção ou apenas mostrar o resumo
  
  const handleCreatePayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'pro', // Sempre envia 'pro' pois é o único plano agora
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        try {
            const jsonError = JSON.parse(error);
            throw new Error(jsonError.error || 'Erro ao criar pagamento');
        } catch (e) {
            throw new Error(error || 'Erro ao criar pagamento');
        }
      }

      const data = await res.json();
      setPaymentData(data);
      setStep('payment');
      
      // Inicia verificação automática do pagamento
      startPaymentCheck(data.id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const startPaymentCheck = (paymentId: string) => {
    const interval = setInterval(async () => {
      setCheckingPayment(true);
      try {
        const res = await fetch(`/api/subscription/check-payment?paymentId=${paymentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'COMPLETED') {
            clearInterval(interval);
            toast.success('🎉 Pagamento confirmado! Redirecionando...');
            setTimeout(() => {
              router.push('/admin/dashboard');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      } finally {
        setCheckingPayment(false);
      }
    }, 5000); // Verifica a cada 5 segundos

    // Limpa após 30 minutos
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  };

  const copyPixCode = () => {
    if (paymentData?.pixCopyPaste) {
      navigator.clipboard.writeText(paymentData.pixCopyPaste);
      toast.success('Código PIX copiado!');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>Faça login para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/auth/login')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'payment' && paymentData) {
    const plan = PLANS.pro;
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <Button
            variant="ghost"
            onClick={() => setStep('confirm' as any)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Pagamento via PIX</CardTitle>
              <CardDescription>
                Plano {plan.name} - R$ {plan.price.toFixed(2)}/mês
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg border-2 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={paymentData.pixQrCode} 
                    alt="QR Code PIX" 
                    className="w-64 h-64 object-contain"
                  />
                </div>
                
                {checkingPayment && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Verificando pagamento...</span>
                  </div>
                )}
              </div>

              {/* Código Copia e Cola */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Ou pague com PIX Copia e Cola:
                </Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentData.pixCopyPaste}
                    readOnly
                    className="flex-1 p-2 border rounded text-sm bg-gray-50 font-mono"
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <Button onClick={copyPixCode} variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Instruções */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📱 Como pagar:</h4>
                <ol className="text-sm space-y-1 text-gray-700">
                  <li>1. Abra o app do seu banco</li>
                  <li>2. Escolha pagar com PIX</li>
                  <li>3. Escaneie o QR Code ou cole o código</li>
                  <li>4. Confirme o pagamento</li>
                  <li>5. Aguarde a confirmação automática</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Tela de Confirmação do Plano Único
  const plan = PLANS.pro;
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Finalizar Assinatura</h1>
          <p className="text-gray-600">Confirme os detalhes do seu plano</p>
        </div>

        <div className="max-w-md mx-auto">
            <Card className="border-red-500 border-2 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <Badge className="bg-red-500">Popular</Badge>
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold text-gray-900">
                    R$ {plan.price.toFixed(2)}
                  </span>
                  <span className="text-gray-600">/mês</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleCreatePayment}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Gerando PIX...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pagar com PIX
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  Pagamento seguro via PIX. Liberação imediata.
                </p>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
