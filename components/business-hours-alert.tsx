'use client';

import { isRestaurantOpen, getBusinessHoursDisplay, BusinessHours } from '@/lib/business-hours';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface BusinessHoursAlertProps {
  restaurant: BusinessHours & { name: string };
  adminEmail?: string;
}

export default function BusinessHoursAlert({ restaurant, adminEmail }: BusinessHoursAlertProps) {
  const status = isRestaurantOpen(restaurant, adminEmail);
  const hoursDisplay = getBusinessHoursDisplay(restaurant);

  // Se é bypass de admin, mostrar alerta especial
  if (status.isBypass) {
    return (
      <Alert className="bg-purple-50 border-purple-500">
        <CheckCircle className="h-5 w-5 text-purple-600" />
        <AlertTitle className="text-purple-800 font-semibold">🔓 Modo Admin Ativo</AlertTitle>
        <AlertDescription className="text-purple-700">
          <div>Bypass de horário habilitado - Você pode fazer pedidos a qualquer momento</div>
          <div className="text-sm mt-1 opacity-80">{hoursDisplay}</div>
        </AlertDescription>
      </Alert>
    );
  }

  if (status.isOpen) {
    return (
      <Alert className="bg-green-50 border-green-500">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <AlertTitle className="text-green-800 font-semibold">🟢 Estamos Abertos!</AlertTitle>
        <AlertDescription className="text-green-700">
          <div>{status.message}</div>
          <div className="text-sm mt-1 opacity-80">{hoursDisplay}</div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-red-50 border-red-500">
      <XCircle className="h-5 w-5 text-red-600" />
      <AlertTitle className="text-red-800 font-semibold">🔴 Estamos Fechados</AlertTitle>
      <AlertDescription className="text-red-700">
        <div>{status.message}</div>
        <div className="text-sm mt-1 opacity-80">{hoursDisplay}</div>
        <div className="text-xs mt-2 bg-red-100 p-2 rounded">
          ⚠️ Não é possível fazer pedidos fora do horário de funcionamento.
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Componente simples para header
export function BusinessHoursIndicator({ restaurant, adminEmail }: BusinessHoursAlertProps) {
  const status = isRestaurantOpen(restaurant, adminEmail);

  // Se é bypass de admin
  if (status.isBypass) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
        <Clock className="h-4 w-4" />
        <span>🔓 Admin</span>
        <span className="text-xs opacity-75">•</span>
        <span className="text-xs">Bypass ativo</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      status.isOpen 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      <Clock className="h-4 w-4" />
      <span>{status.isOpen ? 'Aberto' : 'Fechado'}</span>
      <span className="text-xs opacity-75">•</span>
      <span className="text-xs">{status.message}</span>
    </div>
  );
}
