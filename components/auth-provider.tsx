'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Função para buscar dados do usuário via API com retry
  const fetchUserData = async (session: Session, retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      console.log(`Tentativa ${retryCount + 1} de buscar dados do usuário`);
      
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Dados do usuário obtidos via API:', userData);
        setUser(userData);
        return;
      } else {
        console.error(`Erro ${response.status} ao buscar dados do usuário:`, response.statusText);
        
        if (retryCount < maxRetries - 1) {
          console.log(`Tentando novamente em 1 segundo... (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => fetchUserData(session, retryCount + 1), 1000);
          return;
        }
      }
    } catch (error) {
      console.error(`Erro na tentativa ${retryCount + 1}:`, error);
      
      if (retryCount < maxRetries - 1) {
        console.log(`Tentando novamente em 1 segundo... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => fetchUserData(session, retryCount + 1), 1000);
        return;
      }
    }
    
    // Fallback: usar dados da sessão se API falhar
    console.log('API falhou após todas as tentativas, usando dados da sessão como fallback');
    const fallbackUser = {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || null
    };
    console.log('Usando dados de fallback:', fallbackUser);
    setUser(fallbackUser);
  };

  useEffect(() => {
    // Buscar sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Sessão inicial encontrada:', session);
        setSession(session);
        
        if (session?.user) {
          await fetchUserData(session);
        }
      } catch (error) {
        console.error('Erro ao buscar sessão inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        
        if (session?.user) {
          await fetchUserData(session);
          
          // Redirecionamento automático após login bem-sucedido
          if (event === 'SIGNED_IN') {
            console.log('Login detectado, redirecionando...');
            // Pequeno delay para garantir que o estado seja atualizado
            setTimeout(() => {
              const currentPath = window.location.pathname;
              if (currentPath === '/auth/login' || currentPath === '/auth/register') {
                console.log('Redirecionando para dashboard após login');
                router.push('/admin/dashboard');
              }
            }, 500);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      console.log('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}