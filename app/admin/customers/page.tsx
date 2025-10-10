'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Payment = {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
};

type Subscription = {
  id: string;
  plan: string;
  status: string;
  amount: number;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  daysRemaining: number;
  isExpired: boolean;
};

type Customer = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'STAFF';
  createdAt: string;
  subscription: Subscription | null;
  recentPayments: Payment[];
};

export default function AdminCustomersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace('/auth/login');
      return;
    }

    const load = async () => {
      try {
        const res = await fetch('/api/admin/customers');
        if (!res.ok) throw new Error('Falha ao carregar clientes');
        const j = await res.json();
        setData(j);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session, status, router]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
      TRIAL: { label: 'Trial Gratuito', variant: 'secondary' },
      ACTIVE: { label: 'Ativo', variant: 'default' },
      PAST_DUE: { label: 'Vencido', variant: 'destructive' },
      CANCELED: { label: 'Cancelado', variant: 'outline' },
      EXPIRED: { label: 'Expirado', variant: 'destructive' },
    };
    
    const config = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanLabel = (plan: string) => {
    const planMap: Record<string, string> = {
      basic: 'Básico',
      pro: 'Profissional',
      enterprise: 'Empresarial',
    };
    return planMap[plan] || plan;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p>Carregando usuários e assinaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Usuários & Assinaturas</h1>
          <p className="text-gray-600 mt-1">Gerencie clientes e seus planos de assinatura</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => router.push('/admin/payments')}
          >
            💳 Gerenciar Pagamentos
          </Button>
          <Button onClick={() => router.push('/admin/dashboard')}>Voltar</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes ({data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum cliente encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-3 font-semibold">Usuário</th>
                    <th className="p-3 font-semibold">Plano</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Dias Restantes</th>
                    <th className="p-3 font-semibold">Vencimento</th>
                    <th className="p-3 font-semibold">Pagamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c) => {
                    const sub = c.subscription;
                    const endDate = sub?.trialEndsAt || sub?.currentPeriodEnd;
                    
                    return (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{c.name || 'Sem nome'}</div>
                          <div className="text-gray-500 text-xs">{c.email}</div>
                        </td>
                        
                        <td className="p-3">
                          {sub ? (
                            <span className="font-medium">{getPlanLabel(sub.plan)}</span>
                          ) : (
                            <span className="text-gray-400">Sem plano</span>
                          )}
                        </td>
                        
                        <td className="p-3">
                          {sub ? (
                            getStatusBadge(sub.status)
                          ) : (
                            <Badge variant="outline">Inativo</Badge>
                          )}
                        </td>
                        
                        <td className="p-3">
                          {sub ? (
                            sub.isExpired ? (
                              <span className="text-red-600 font-semibold">Expirado</span>
                            ) : (
                              <div>
                                <span className={`font-bold text-lg ${
                                  sub.daysRemaining <= 3 ? 'text-red-600' : 
                                  sub.daysRemaining <= 7 ? 'text-orange-600' : 
                                  'text-green-600'
                                }`}>
                                  {sub.daysRemaining}
                                </span>
                                <span className="text-gray-500 text-xs ml-1">dias</span>
                              </div>
                            )
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        
                        <td className="p-3">
                          {endDate ? (
                            <div>
                              <div className="font-medium">
                                {new Date(endDate).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(endDate).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        
                        <td className="p-3">
                          {c.recentPayments.length > 0 ? (
                            <div className="text-xs">
                              <div className="font-medium">
                                {c.recentPayments.length} pagamento(s)
                              </div>
                              <div className="text-gray-500">
                                Último: R$ {c.recentPayments[0].amount.toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Nenhum</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}