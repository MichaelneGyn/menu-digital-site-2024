'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type SubscriptionStatus = {
  isActive: boolean;
  isAdmin: boolean;
  isExpired: boolean;
};

/**
 * HOC que verifica se o usuário tem assinatura ativa
 * Redireciona para /subscription-expired se expirado
 * ADMIN sempre tem acesso
 */
export function withSubscriptionCheck<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function ProtectedComponent(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
      const checkSubscription = async () => {
        if (status === 'loading') return;
        
        if (!session) {
          router.push('/auth/login');
          return;
        }

        try {
          const res = await fetch('/api/subscription/status');
          if (res.ok) {
            const data: SubscriptionStatus = await res.json();
            
            // ADMIN ou assinatura ativa = acesso permitido
            if (data.isActive || data.isAdmin) {
              setHasAccess(true);
            } else {
              // Redireciona para página de assinatura expirada
              router.push('/subscription-expired');
            }
          } else {
            // Se erro na API, permite acesso temporário (evita bloquear por erro de rede)
            console.error('Erro ao verificar assinatura');
            setHasAccess(true);
          }
        } catch (error) {
          console.error('Erro ao verificar assinatura:', error);
          // Permite acesso temporário em caso de erro
          setHasAccess(true);
        } finally {
          setIsChecking(false);
        }
      };

      checkSubscription();
    }, [session, status, router]);

    if (status === 'loading' || isChecking) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="pizza-loader mb-4"></div>
            <p>Verificando acesso...</p>
          </div>
        </div>
      );
    }

    if (!hasAccess) {
      return null;
    }

    return <Component {...props} />;
  };
}
