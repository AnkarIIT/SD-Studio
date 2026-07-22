const ADMIN_TOKEN_KEY = 'lb_admin_token';

export function getAdminPassword(): string {
  return import.meta.env.VITE_ADMIN_PASSWORD || 'layerbound2026';
}

export function getAdminApiKey(): string {
  return import.meta.env.VITE_ADMIN_API_KEY || import.meta.env.VITE_ADMIN_PASSWORD || 'layerbound2026';
}

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken());
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function requestAdminLogin(
  email: string,
  password: string,
  otp: string,
  sessionId: string
): Promise<{ success: boolean; token?: string; requires2FA?: boolean; sessionId?: string; error?: string }> {
  const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

  try {
    const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, code: otp, sessionId }),
    });
    const data = await res.json();
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login request failed';
    return { success: false, error: message };
  }
}

export async function requestAdminLoginTotp(
  email: string,
  password: string,
  totpCode: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

  try {
    const res = await fetch(`${API_BASE}/api/admin/auth/login-totp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, totpCode }),
    });
    const data = await res.json();
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'TOTP login request failed';
    return { success: false, error: message };
  }
}