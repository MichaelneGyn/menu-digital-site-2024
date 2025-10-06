import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Limpar entradas antigas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Número máximo de requisições permitidas
}

/**
 * Rate limiter simples baseado em memória
 * Para produção, considere usar Redis ou similar
 */
export function rateLimit(config: RateLimitConfig) {
  return (identifier: string): { success: boolean; response?: NextResponse } => {
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    if (!entry) {
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { success: true };
    }

    if (now > entry.resetTime) {
      rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { success: true };
    }

    if (entry.count >= config.maxRequests) {
      const resetIn = Math.ceil((entry.resetTime - now) / 1000);
      return {
        success: false,
        response: NextResponse.json(
          { error: `Muitas requisições. Tente novamente em ${resetIn} segundos.` },
          { 
            status: 429,
            headers: {
              'Retry-After': resetIn.toString(),
            }
          }
        ),
      };
    }

    entry.count += 1;
    return { success: true };
  };
}

// Configurações pré-definidas
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5, // 5 tentativas por IP
});

export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  maxRequests: 60, // 60 requisições por minuto
});
