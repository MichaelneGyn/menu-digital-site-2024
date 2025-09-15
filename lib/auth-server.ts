import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Função para criar cliente Supabase nas APIs do servidor
export function createServerSupabaseClient() {
  return createRouteHandlerClient({ cookies });
}