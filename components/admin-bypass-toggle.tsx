'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

interface AdminBypassToggleProps {
  onBypassActivated: (email: string) => void;
}

export default function AdminBypassToggle({ onBypassActivated }: AdminBypassToggleProps) {
  const [showInput, setShowInput] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleActivate = () => {
    if (!email.trim()) {
      setError('Digite um email');
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }

    // Ativar bypass
    onBypassActivated(email.toLowerCase());
    setShowInput(false);
    setEmail('');
    setError('');
  };

  if (!showInput) {
    return (
      <div className="flex justify-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInput(true)}
          className="text-xs text-gray-500 hover:text-purple-600 border-dashed"
        >
          <ShieldCheck className="w-3 h-3 mr-1" />
          Modo Admin
        </Button>
      </div>
    );
  }

  return (
    <Card className="mt-4 border-purple-200 bg-purple-50">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-purple-800">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-semibold">Ativar Modo Admin</span>
          </div>
          
          <div className="text-xs text-purple-700">
            Digite seu email de administrador para fazer pedidos fora do horário (apenas para testes)
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="seu-email@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
              className="text-sm"
            />
            
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleActivate}
                size="sm"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Ativar
              </Button>
              <Button
                onClick={() => {
                  setShowInput(false);
                  setEmail('');
                  setError('');
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
