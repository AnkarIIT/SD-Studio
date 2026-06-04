const ADMIN_SESSION_KEY = 'lb_admin_session';

export function getAdminPassword(): string {
  return import.meta.env.VITE_ADMIN_PASSWORD || 'layerbound2026';
}

export function getAdminApiKey(): string {
  return import.meta.env.VITE_ADMIN_API_KEY || import.meta.env.VITE_ADMIN_PASSWORD || 'layerbound2026';
}

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

export function loginAdmin(password: string): boolean {
  if (password !== getAdminPassword()) return false;
  sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
  return true;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}