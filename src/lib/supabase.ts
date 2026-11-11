import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Lectura de variables de entorno de Astro / Vite / Cloudflare
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente público para consultas de frontend / visitantes (sujeto a RLS)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Función para obtener cliente con token JWT de usuario autenticado
export function getAuthenticatedSupabaseClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Cliente con Service Role Key (exclusivo para backend / API de administración)
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!supabaseServiceRoleKey || supabaseServiceRoleKey === 'placeholder-service-key') {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Helper para comprobar si las credenciales de Supabase están configuradas
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    !supabaseUrl.includes('placeholder.supabase.co') &&
    Boolean(supabaseAnonKey) &&
    supabaseAnonKey !== 'placeholder-anon-key'
  );
}
