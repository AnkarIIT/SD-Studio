/**
 * Cashfree integration.
 * Uses environment variables so deployments can switch between sandbox and production safely.
 */

type CashfreeMode = 'sandbox' | 'production';

const CASHFREE_MODE = (process.env.CASHFREE_MODE || process.env.NODE_ENV || 'development').toLowerCase();
const PRODUCTION_BASE_URL = 'https://api.cashfree.com/pg';
const SANDBOX_BASE_URL = 'https://sandbox.cashfree.com/pg';

const APP_ID = process.env.CASHFREE_APP_ID?.trim();
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY?.trim();

function getHostname(value?: string) {
  if (!value) return '';
  try {
    const url = value.startsWith('http') ? new URL(value) : new URL(`https://${value}`);
    return url.hostname.toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

function isLocalHostname(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  );
}

function getRuntime(origin?: string): { mode: CashfreeMode; baseUrl: string } {
  const requestedProduction = CASHFREE_MODE === 'production';
  const localRequest = isLocalHostname(getHostname(origin));
  const mode: CashfreeMode = requestedProduction && !localRequest ? 'production' : 'sandbox';

  return {
    mode,
    baseUrl: mode === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL,
  };
}

function getReturnUrl(origin?: string) {
  const configuredFrontendUrl = process.env.FRONTEND_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  const originIsLocal = isLocalHostname(getHostname(origin));
  const baseUrl = originIsLocal
    ? origin
    : configuredFrontendUrl || origin || vercelUrl || 'http://localhost:3000';
  return `${baseUrl.replace(/\/$/, '')}/order-success?order_id={order_id}`;
}

export async function createCashfreeOrder(payload: any, origin?: string) {
  try {
    if (!APP_ID || !SECRET_KEY) {
      return { error: 'Cashfree credentials are not configured' };
    }

    const runtime = getRuntime(origin);
    const response = await fetch(`${runtime.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': APP_ID,
        'x-client-secret': SECRET_KEY,
      },
      body: JSON.stringify({
        order_id: payload.orderId,
        order_amount: payload.amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: payload.email.replace(/[^a-zA-Z0-9]/g, '_'),
          customer_name: payload.name,
          customer_email: payload.email,
          customer_phone: payload.phone.replace(/[^0-9]/g, '').slice(-10),
        },
        order_meta: {
          return_url: getReturnUrl(origin),
        },
      }),
    });

    const data = await response.json() as any;
    if (!response.ok) return { error: data.message || 'Cashfree API Error' };
    return { data, mode: runtime.mode };
  } catch (err: any) {
    return { error: err?.message || 'Connection to Cashfree failed' };
  }
}

export async function verifyCashfreePayment(orderId: string, origin?: string) {
  try {
    if (!APP_ID || !SECRET_KEY) return false;

    const runtime = getRuntime(origin);
    const response = await fetch(`${runtime.baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': APP_ID,
        'x-client-secret': SECRET_KEY,
      },
    });

    const data = await response.json() as any;
    if (!response.ok) return false;
    return data.order_status === 'PAID';
  } catch {
    return false;
  }
}
