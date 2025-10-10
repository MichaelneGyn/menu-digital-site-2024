'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

type Payment = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
};

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Verifica se é ADMIN
  const isAdmin = session?.user?.email === 'michaeldouglasqueiroz@gmail.com';

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
      return;
    }
    if (!isAdmin) {
      router.replace('/admin/dashboard');
      return;
    }

    loadPayments();
  }, [session, status, router, isAdmin]);

  const loadPayments = async () => {
    try {
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    if (!confirm('Confirmar este pagamento?')) return;

    try {
      const res = await fetch('/api/subscription/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (res.ok) {
        toast.success('✅ Pagamento confirmado e assinatura ativada!');
        loadPayments();
      } else {
        const error = await res.text();
        toast.error(error || 'Erro ao confirmar pagamento');
      }
    } catch (error) {
      toast.error('Erro ao confirmar pagamento');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
      PENDING: { label: 'Pendente', variant: 'outline' },
      PROCESSING: { label: 'Processando', variant: 'secondary' },
      COMPLETED: { label: 'Pago', variant: 'default' },
      FAILED: { label: 'Falhou', variant: 'destructive' },
    };
    
    const { label, variant } = config[status] || { label: status, variant: 'outline' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Pagamentos</h1>
          <p className="text-gray-600 mt-1">Confirme pagamentos pendentes</p>
        </div>
        <Button onClick={() => router.push('/admin/dashboard')}>Voltar</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pagamentos ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum pagamento encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-3 font-semibold">Usuário</th>
                    <th className="p-3 font-semibold">Valor</th>
                    <th className="p-3 font-semibold">Método</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Data</th>
                    <th className="p-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{payment.user.name || 'Sem nome'}</div>
                        <div className="text-xs text-gray-500">{payment.user.email}</div>
                      </td>
                      <td className="p-3 font-semibold">
                        R$ {payment.amount.toFixed(2)}
                      </td>
                      <td className="p-3">
                        {payment.paymentMethod || 'PIX'}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          {new Date(payment.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleTimeString('pt-BR')}
                        </div>
                      </td>
                      <td className="p-3">
                        {payment.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmPayment(payment.id)}
                          >
                            Confirmar Pagamento
                          </Button>
                        )}
                        {payment.status === 'COMPLETED' && (
                          <span className="text-xs text-gray-500">
                            Pago em {new Date(payment.paidAt!).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Página de Testes</h3>
        <p className="text-sm text-yellow-700">
          Esta página é para simular a confirmação de pagamentos durante o desenvolvimento.
          Em produção, a confirmação será automática via webhook do provedor de pagamento.
        </p>
      </div>
    </div>
  );
}
