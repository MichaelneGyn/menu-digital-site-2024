export const onlyDigits = (s?: string) => (s ?? '').replace(/\D/g, '');

export const isValidWhatsapp = (digits: string) => {
  // Aceita 10–13 dígitos (DDD + número, opcionalmente com 55 no começo)
  return /^[0-9]{10,13}$/.test(digits);
};

export const formatBRMask = (s?: string) => {
  const d = onlyDigits(s);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  const useFive = rest.length > 8; // 9 dígitos para celular, 8 para fixo
  const first = rest.slice(0, useFive ? 5 : 4);
  const last = rest.slice(useFive ? 5 : 4);
  return `(${ddd}) ${first}${last ? '-' + last : ''}`;
};