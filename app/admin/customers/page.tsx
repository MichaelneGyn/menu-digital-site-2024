'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Customer = {
  id: string;
  email: string;
  name?: string | null;
  role: 'ADMIN' | 'STAFF';
  createdAt: string;
  subscriptionAtual: {
    id: string;
    plan: string;
    status: string;
    validUntil?: string | null;
  } | null;
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

  const createOrUpdateSub = async (userId: string) => {
    const plan = prompt('Plano (ex: basic, pro)') ?? '';
    const status = prompt('Status (active, past_due, canceled)') ?? 'active';
    if (!plan) return;

    await fetch('/api/admin/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan, status }),
    });
    // reload
    try {
      const res = await fetch('/api/admin/customers');
      const j = await res.json();
      setData(j);
    } catch {}
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuários & Assinaturas</h1>
        <Button onClick={() => router.push('/admin/dashboard')}>Voltar</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-gray-500">Nenhum cliente encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Usuário</th>
                    <th className="p-2">Plano</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Validade</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c) => {
                    const sub = c.subscriptionAtual;
                    return (
                      <tr key={c.id} className="border-t">
                        <td className="p-2">
                          <div className="font-medium">{c.name || '—'}</div>
                          <div className="text-gray-600 text-xs">{c.email}</div>
                        </td>
                        <td className="p-2">{sub?.plan ?? '—'}</td>
                        <td className="p-2">{sub?.status ?? '—'}</td>
                        <td className="p-2">{sub?.validUntil ? new Date(sub.validUntil).toLocaleDateString('pt-BR') : '—'}</td>
                        <td className="p-2">
                          <Button variant="outline" size="sm" onClick={() => createOrUpdateSub(c.id)}>
                            {sub ? 'Alterar Assinatura' : 'Criar Assinatura'}
                          </Button>
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