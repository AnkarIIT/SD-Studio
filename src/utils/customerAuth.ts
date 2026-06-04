const VERIFIED_EMAIL_KEY = 'lb_verified_email';
const ORDER_ACCESS_TOKEN_KEY = 'lb_order_access_token';

export function getVerifiedEmail(): string {
  return sessionStorage.getItem(VERIFIED_EMAIL_KEY) ?? '';
}

export function getOrderAccessToken(): string {
  return sessionStorage.getItem(ORDER_ACCESS_TOKEN_KEY) ?? '';
}

export function setVerifiedEmail(email: string) {
  sessionStorage.setItem(VERIFIED_EMAIL_KEY, email.trim().toLowerCase());
}

export function setOrderAccessToken(token: string) {
  sessionStorage.setItem(ORDER_ACCESS_TOKEN_KEY, token);
}

export function clearVerifiedEmail() {
  sessionStorage.removeItem(VERIFIED_EMAIL_KEY);
  sessionStorage.removeItem(ORDER_ACCESS_TOKEN_KEY);
}

const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

export async function requestTrackOrderOtp(email: string): Promise<{
  success: boolean;
  message?: string;
  devHint?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/otp/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Dev-Panel': import.meta.env.DEV ? 'true' : '',
      },
      body: JSON.stringify({ to: email.trim().toLowerCase(), expiryMinutes: 10 }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return {
      success: Boolean(data.success),
      message: data.message,
      devHint: data.devHint,
    };
  } catch {
    return { success: false, error: 'Could not send OTP' };
  }
}

export async function verifyTrackOrderOtp(
  email: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email.trim().toLowerCase(), otp: otp.trim() }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error ?? data.message ?? 'Invalid OTP' };
    }
    const normalized = email.trim().toLowerCase();
    setVerifiedEmail(normalized);
    if (data.orderAccessToken) {
      setOrderAccessToken(String(data.orderAccessToken));
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Verification failed' };
  }
}