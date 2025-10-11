'use client';

import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Input de preço com formatação automática de centavos
 * 
 * Como funciona:
 * - Digite apenas números (sem vírgula ou ponto)
 * - O sistema adiciona automaticamente os centavos
 * 
 * Exemplos:
 * - Digita "14" → Mostra "R$ 0,14" → Salva "0.14"
 * - Digita "1400" → Mostra "R$ 14,00" → Salva "14.00"
 * - Digita "14990" → Mostra "R$ 149,90" → Salva "149.90"
 */
export function PriceInput({ value, onChange, placeholder, className }: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState(() => formatDisplay(value));

  // Formata valor numérico para exibição (R$ XX,XX)
  function formatDisplay(val: string): string {
    if (!val || val === '0' || val === '0.00') return '';
    
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  // Converte digitação em centavos para valor decimal
  function formatCents(raw: string): string {
    // Remove tudo que não é número
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '0.00';

    // Converte para centavos
    // Exemplo: "1490" → "14.90"
    const cents = parseInt(digits, 10);
    const reais = cents / 100;
    
    return reais.toFixed(2);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove formatação (R$, espaços, etc)
    const cleanValue = inputValue.replace(/[^\d]/g, '');
    
    // Converte para decimal
    const decimalValue = formatCents(cleanValue);
    
    // Atualiza valor real (para envio)
    onChange(decimalValue);
    
    // Atualiza display formatado
    setDisplayValue(formatDisplay(decimalValue));
  };

  const handleFocus = () => {
    // Ao focar, mostra apenas números para facilitar edição
    if (value && value !== '0.00') {
      const num = parseFloat(value) * 100;
      setDisplayValue(Math.round(num).toString());
    }
  };

  const handleBlur = () => {
    // Ao perder foco, formata com R$
    setDisplayValue(formatDisplay(value));
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder || "Digite apenas números: 1490 = R$ 14,90"}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
    />
  );
}
