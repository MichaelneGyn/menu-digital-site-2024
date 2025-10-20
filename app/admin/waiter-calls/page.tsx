'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, X, Clock, Users, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type WaiterCall = {
  id: string;
  restaurantId: string;
  tableNumber: string;
  status: 'PENDING' | 'ATTENDED' | 'DISMISSED';
  createdAt: string;
  attendedAt: string | null;
  table: {
    number: string;
    capacity: number;
  };
};

export default function WaiterCallsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeCalls, setActiveCalls] = useState<WaiterCall[]>([]);
  const [recentCalls, setRecentCalls] = useState<WaiterCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousCountRef = useRef(0);

  // Redirecionar se não autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Carregar chamadas
  const loadCalls = async () => {
    try {
      const res = await fetch('/api/waiter-calls');
      if (!res.ok) throw new Error('Erro ao carregar chamadas');
      
      const data = await res.json();
      
      // Tocar som se houver novas chamadas
      if (soundEnabled && data.activeCalls.length > previousCountRef.current) {
        playAlertSound();
      }
      
      previousCountRef.current = data.activeCalls.length;
      setActiveCalls(data.activeCalls);
      setRecentCalls(data.recentCalls);
    } catch (error) {
      console.error('Erro ao carregar chamadas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Polling a cada 5 segundos
  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 5000);
    return () => clearInterval(interval);
  }, [soundEnabled]);

  // Criar audio element
  useEffect(() => {
    // Som de alerta simples usando Web Audio API
    audioRef.current = new Audio();
    // Usar um som de notificação (frequências)
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAlertSound = () => {
    try {
      // Criar som de alerta usando beep
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800; // Frequência em Hz
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Erro ao tocar som:', error);
    }
  };

  const handleAttend = async (callId: string) => {
    try {
      const res = await fetch('/api/waiter-calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, status: 'ATTENDED' }),
      });

      if (!res.ok) throw new Error('Erro ao atender chamada');

      toast.success('✅ Mesa atendida!');
      loadCalls();
    } catch (error) {
      toast.error('Erro ao atender chamada');
    }
  };

  const handleDismiss = async (callId: string) => {
    try {
      const res = await fetch('/api/waiter-calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, status: 'DISMISSED' }),
      });

      if (!res.ok) throw new Error('Erro ao dispensar chamada');

      loadCalls();
    } catch (error) {
      toast.error('Erro ao dispensar chamada');
    }
  };

  const getWaitTime = (createdAt: string) => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diff = Math.floor((now - created) / 1000); // segundos

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    return `${Math.floor(diff / 3600)}h`;
  };

  const getUrgencyColor = (createdAt: string) => {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    const diff = Math.floor((now - created) / (60 * 1000)); // minutos

    if (diff < 2) return 'bg-yellow-100 border-yellow-300';
    if (diff < 5) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300 animate-pulse';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="pizza-loader mb-4"></div>
          <p className="text-gray-600">Carregando chamadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">🔔 Chamadas de Garçom</h1>
          <p className="text-gray-600 mt-1">
            {activeCalls.length === 0 
              ? 'Nenhuma chamada ativa' 
              : `${activeCalls.length} ${activeCalls.length === 1 ? 'mesa aguardando' : 'mesas aguardando'}`}
          </p>
        </div>
        
        <Button
          variant={soundEnabled ? 'default' : 'outline'}
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="gap-2"
        >
          <Bell className={soundEnabled ? 'animate-bounce' : ''} />
          Som {soundEnabled ? 'ON' : 'OFF'}
        </Button>
      </div>

      {/* Chamadas Ativas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="text-red-500" />
            Chamadas Ativas ({activeCalls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeCalls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Nenhuma chamada ativa</p>
              <p className="text-sm">As chamadas aparecerão aqui quando um cliente chamar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeCalls.map((call) => (
                <div
                  key={call.id}
                  className={`p-4 rounded-lg border-2 ${getUrgencyColor(call.createdAt)} transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-gray-800">
                        Mesa {call.table.number}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          {call.table.capacity} pessoas
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Clock className="w-4 h-4" />
                          Esperando há <strong>{getWaitTime(call.createdAt)}</strong>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAttend(call.id)}
                        className="bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Atender
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDismiss(call.id)}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Dispensar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico Recente */}
      {recentCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-3 rounded-lg bg-gray-50 border flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">Mesa {call.table.number}</span>
                    <span className="text-sm text-gray-600">
                      {call.status === 'ATTENDED' ? '✅ Atendida' : '❌ Dispensada'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(call.attendedAt!).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
