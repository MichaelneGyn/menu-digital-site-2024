
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Função para criar cliente Supabase
export function createSupabaseClient() {
  return createClientComponentClient();
}

// Cliente padrão para compatibilidade
export const supabase = createSupabaseClient();

// Tipos para autenticação
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Funções de autenticação
export async function signUp({ email, password, name }: SignUpData) {
  try {
    const supabaseClient = createSupabaseClient();
    console.log('Tentando criar usuário:', { email, name });
    
    // Registrar no Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
          full_name: name || ''
        }
      }
    });

    console.log('Resultado do signup:', { user: authData.user?.id, error: authError });

    if (authError) {
      console.error('Erro no Supabase signup:', authError);
      throw new Error(authError.message);
    }

    return { user: authData.user, session: authData.session };
  } catch (error) {
    console.error('Erro no signup:', error);
    throw error;
  }
}

export async function signIn({ email, password }: SignInData) {
  try {
    const supabaseClient = createSupabaseClient();
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Erro de autenticação:', error);
      throw new Error(error.message);
    }

    console.log('Login bem-sucedido:', data.user?.id);
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Erro no signin:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const supabaseClient = createSupabaseClient();
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Erro no signout:', error);
    throw error;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabaseClient = createSupabaseClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || undefined
    };
  } catch (error) {
    console.error('Erro ao buscar usuário atual:', error);
    return null;
  }
}

export async function getSession() {
  try {
    const supabaseClient = createSupabaseClient();
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  } catch (error) {
    console.error('Erro ao buscar sessão:', error);
    return null;
  }
}
