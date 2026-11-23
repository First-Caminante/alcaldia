import {
  createStatelessSupabaseClient,
  getAuthenticatedSupabaseClient,
  getSupabaseAdmin,
  isSupabaseConfigured,
} from './supabase';

export interface AdminSessionCheckResult {
  valid: boolean;
  refreshed?: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: {
    id: string;
    email?: string;
    full_name?: string;
  };
}

/**
 * Decodifica el payload de un JWT sin verificar firma criptográfica
 * (la validación criptográfica se realiza contra Supabase Auth).
 */
export function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isJwtExpired(token?: string | null, bufferSeconds = 30): boolean {
  if (!token) return true;
  if (token === 'demo-token-gam-pelechuco' && !isSupabaseConfigured()) return false;
  const payload = parseJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  return payload.exp * 1000 <= Date.now() + bufferSeconds * 1000;
}

async function isActiveAdminUser(userId: string, accessToken?: string): Promise<{ active: boolean; full_name?: string }> {
  const client = getSupabaseAdmin() || (accessToken ? getAuthenticatedSupabaseClient(accessToken) : createStatelessSupabaseClient());
  const { data, error } = await client
    .from('admin_users')
    .select('id, full_name')
    .eq('id', userId)
    .eq('is_active', true)
    .single();

  if (error || !data) return { active: false };
  return { active: true, full_name: data.full_name };
}

/**
 * Verifica que el token de sesión siga vigente en Supabase y, si expiró,
 * intenta renovarlo silenciosamente con el refresh_token.
 */
export async function verifyOrRefreshAdminSession(
  accessToken?: string | null,
  refreshToken?: string | null
): Promise<AdminSessionCheckResult> {
  if (!isSupabaseConfigured()) {
    if (accessToken === 'demo-token-gam-pelechuco') {
      return {
        valid: true,
        refreshed: false,
        accessToken,
        user: {
          id: 'demo-admin-id',
          email: 'admin@pelechuco.gob.bo',
          full_name: 'Administrador Municipal GAM (Demo)',
        },
      };
    }
    return { valid: false };
  }

  // 1. Verificar token de acceso vigente (evita llamadas innecesarias si ya venció)
  if (accessToken && !isJwtExpired(accessToken, 30)) {
    try {
      const authClient = getAuthenticatedSupabaseClient(accessToken);
      const { data: { user }, error } = await authClient.auth.getUser();
      if (!error && user) {
        const adminCheck = await isActiveAdminUser(user.id, accessToken);
        if (adminCheck.active) {
          return {
            valid: true,
            refreshed: false,
            accessToken,
            refreshToken: refreshToken || undefined,
            user: {
              id: user.id,
              email: user.email,
              full_name: adminCheck.full_name,
            },
          };
        }
      }
    } catch {
      // Continuar con refresh si falló la verificación directa
    }
  }

  // 2. Intentar renovar automáticamente con refresh_token
  if (refreshToken) {
    try {
      const stateless = createStatelessSupabaseClient();
      const { data, error } = await stateless.auth.refreshSession({ refresh_token: refreshToken });
      if (!error && data.session?.access_token && data.user) {
        const adminCheck = await isActiveAdminUser(data.user.id, data.session.access_token);
        if (adminCheck.active) {
          return {
            valid: true,
            refreshed: true,
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token || refreshToken,
            expiresAt: data.session.expires_at,
            user: {
              id: data.user.id,
              email: data.user.email,
              full_name: adminCheck.full_name,
            },
          };
        }
      }
    } catch {
      return { valid: false };
    }
  }

  return { valid: false };
}
