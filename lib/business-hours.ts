// Função para verificar se o restaurante está aberto

export interface BusinessHours {
  openTime: string | null;
  closeTime: string | null;
  workingDays: string | null;
}

// Lista de emails admin que podem fazer pedidos a qualquer hora (para testes)
const ADMIN_BYPASS_EMAILS = [
  'michaeldouglasqueiroz@gmail.com'
];

export function isRestaurantOpen(restaurant: BusinessHours, userEmail?: string): {
  isOpen: boolean;
  message: string;
  nextOpenTime?: string;
  isBypass?: boolean;
} {
  // Bypass para admins - permite pedidos a qualquer hora
  if (userEmail && ADMIN_BYPASS_EMAILS.includes(userEmail.toLowerCase())) {
    return {
      isOpen: true,
      message: 'Modo Admin - Bypass de horário ativo',
      isBypass: true
    };
  }

  // Se não houver horários configurados, considera aberto
  if (!restaurant.openTime || !restaurant.closeTime || !restaurant.workingDays) {
    return {
      isOpen: true,
      message: 'Aberto agora'
    };
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  // Verificar se hoje é dia de funcionamento
  const workingDaysArray = restaurant.workingDays.split(',').map(d => parseInt(d));
  
  if (!workingDaysArray.includes(currentDay)) {
    // Encontrar próximo dia de funcionamento
    const nextDay = findNextWorkingDay(currentDay, workingDaysArray);
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return {
      isOpen: false,
      message: `Fechado hoje. Abrimos na ${dayNames[nextDay]} às ${restaurant.openTime}`,
      nextOpenTime: `${dayNames[nextDay]} ${restaurant.openTime}`
    };
  }

  // Verificar horário
  if (currentTime < restaurant.openTime) {
    return {
      isOpen: false,
      message: `Abrimos hoje às ${restaurant.openTime}`,
      nextOpenTime: `Hoje ${restaurant.openTime}`
    };
  }

  if (currentTime >= restaurant.closeTime) {
    // Encontrar próximo dia de funcionamento
    const nextDay = findNextWorkingDay(currentDay, workingDaysArray);
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return {
      isOpen: false,
      message: `Fechado. Abrimos na ${dayNames[nextDay]} às ${restaurant.openTime}`,
      nextOpenTime: `${dayNames[nextDay]} ${restaurant.openTime}`
    };
  }

  // Está aberto!
  return {
    isOpen: true,
    message: `Aberto até ${restaurant.closeTime}`
  };
}

function findNextWorkingDay(currentDay: number, workingDays: number[]): number {
  // Procurar o próximo dia de funcionamento
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    if (workingDays.includes(nextDay)) {
      return nextDay;
    }
  }
  return currentDay; // Fallback (não deveria acontecer)
}

export function getBusinessHoursDisplay(restaurant: BusinessHours): string {
  if (!restaurant.openTime || !restaurant.closeTime || !restaurant.workingDays) {
    return 'Horário não configurado';
  }

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const workingDaysArray = restaurant.workingDays.split(',').map(d => parseInt(d)).sort();
  
  if (workingDaysArray.length === 7) {
    return `Todos os dias: ${restaurant.openTime} - ${restaurant.closeTime}`;
  }

  const daysStr = workingDaysArray.map(d => dayNames[d]).join(', ');
  return `${daysStr}: ${restaurant.openTime} - ${restaurant.closeTime}`;
}
