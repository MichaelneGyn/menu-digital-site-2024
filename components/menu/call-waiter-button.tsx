'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

interface CallWaiterButtonProps {
  restaurantId: string;
  tableId?: string;
  tableNumber?: string;
}

export default function CallWaiterButton({ restaurantId, tableId, tableNumber }: CallWaiterButtonProps) {
  const [isCalling, setIsCalling] = useState(false);

  const handleCallWaiter = async () => {
    if (!tableId || !tableNumber) {
      toast.error('Informações da mesa não encontradas');
      return;
    }

    setIsCalling(true);
    try {
      const res = await fetch('/api/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          tableNumber,
        }),
      });

      if (!res.ok) throw new Error('Erro ao chamar garçom');

      toast.success('✅ Garçom chamado! Alguém virá atendê-lo em instantes.', {
        duration: 4000,
        icon: '🔔',
      });
    } catch (error) {
      toast.error('Erro ao chamar garçom. Tente novamente.');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <button
      onClick={handleCallWaiter}
      disabled={isCalling}
      className="fixed bottom-24 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      title="Chamar Garçom"
    >
      {isCalling ? (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      ) : (
        <Bell className="w-7 h-7" strokeWidth={2.5} />
      )}
    </button>
  );
}
