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
