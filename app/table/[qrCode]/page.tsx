'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, ShoppingCart, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { useParams } from 'next/navigation';

type Table = {
  id: string;
  number: string;
  restaurantId: string;
  restaurant: {
    slug: string;
    name: string;
  };
};

export default function TableQRCodePage() {
  const params = useParams();
  const qrCode = params?.qrCode as string;
  
  const [table, setTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);

  useEffect(() => {
    if (qrCode) {
      loadTable();
    }
  }, [qrCode]);

  const loadTable = async () => {
    try {
      const res = await fetch(`/api/tables/public?qrCode=${qrCode}`);
      if (!res.ok) {
        throw new Error('Mesa não encontrada');
      }
      const data = await res.json();
      setTable(data.table);
    } catch (error) {
      toast.error('Mesa não encontrada ou inativa');
    } finally {
      setIsLoading(false);
    }
  };

  const callWaiter = async () => {
    if (!table) return;

    setIsCallingWaiter(true);
    try {
      const res = await fetch('/api/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: table.restaurantId,
          tableNumber: table.number,
        }),
      });

      if (!res.ok) throw new Error('Erro ao chamar garçom');

      toast.success('✅ Garçom chamado! Alguém virá atendê-lo em instantes.');
    } catch (error) {
      toast.error('Erro ao chamar garçom. Tente novamente.');
    } finally {
      setIsCallingWaiter(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">Mesa não encontrada</h1>
            <p className="text-gray-600 mb-4">
              Este QR Code não está ativo ou não existe.
            </p>
            <p className="text-sm text-gray-500">
              Entre em contato com o estabelecimento se achar que isso é um erro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header da Mesa */}
        <Card className="mb-6 border-2 border-orange-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-5xl mb-2">🍽️</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Mesa {table.number}
              </h1>
              <p className="text-gray-600">{table.restaurant.name}</p>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Ver Cardápio */}
          <Link href={`/${table.restaurant.slug}?table=${table.id}`}>
            <Button
              size="lg"
              className="w-full h-20 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-bold">Ver Cardápio</div>
                <div className="text-sm opacity-90">Faça seu pedido</div>
              </div>
            </Button>
          </Link>

          {/* Chamar Garçom */}
          <Button
            variant="outline"
            size="lg"
            onClick={callWaiter}
            disabled={isCallingWaiter}
            className="w-full h-16 text-lg border-2 border-orange-300 hover:bg-orange-50"
          >
            {isCallingWaiter ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600 mr-2"></div>
                Chamando...
              </>
            ) : (
              <>
                <Bell className="w-5 h-5 mr-2" />
                Chamar Garçom
              </>
            )}
          </Button>
        </div>

        {/* Informações */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Como funciona:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Clique em "Ver Cardápio" para ver os pratos disponíveis</li>
                  <li>• Adicione itens ao carrinho e finalize seu pedido</li>
                  <li>• Use "Chamar Garçom" se precisar de atendimento</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>✨ Powered by MenuRapido</p>
          <p className="mt-1">Cardápio Digital Inteligente</p>
        </div>
      </div>
    </div>
  );
}
