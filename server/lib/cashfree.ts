/**
 * Cashfree integration.
 * Uses environment variables so deployments can switch between sandbox and production safely.
 *
 * Mode selection rules:
 *   - Localhost requests → sandbox by default (prevents accidental real charges during dev)
 *   - Set CASHFREE_ALLOW_LOCAL_PRODUCTION=true to use production mode on localhost
 *   - Remote requests → uses CASHFREE_MODE env var (production or sandbox)
 */

type CashfreeMode = 'sandbox' | 'production';

const CASHFREE_MODE = (process.env.CASHFREE_MODE || 'sandbox').toLowerCase();
const ALLOW_LOCAL_PRODUCTION = process.env.CASHFREE_ALLOW_LOCAL_PRODUCTION === 'true';
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
  const hostname = getHostname(origin);
  const localRequest = isLocalHostname(hostname);
  const wantProduction = CASHFREE_MODE === 'production';

  if (localRequest && wantProduction && !ALLOW_LOCAL_PRODUCTION) {
    return { mode: 'sandbox', baseUrl: SANDBOX_BASE_URL };
  }

  const mode: CashfreeMode = wantProduction ? 'production' : 'sandbox';
  return { mode, baseUrl: mode === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL };
}

function ensureProtocol(url: string): string {
  return url.match(/^https?:\/\//) ? url : `https://${url}`;
}

function getSafeBaseUrl(origin?: string): string {
  const configuredFrontendUrl = process.env.FRONTEND_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  const originIsLocal = isLocalHostname(getHostname(origin));
  const base = originIsLocal
    ? configuredFrontendUrl || origin || 'http://localhost:3000'
    : configuredFrontendUrl || origin || vercelUrl || 'http://localhost:3000';
  return ensureProtocol(base);
}

function getReturnUrl(origin?: string) {
  return `${getSafeBaseUrl(origin).replace(/\/$/, '')}/order-success?order_id={order_id}`;
}

export async function createCashfreeOrder(payload: {
  orderId: string;
  items: Array<{ id: string; quantity: number }>;
  couponCode?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}, origin?: string) {
  try {
    if (!APP_ID || !SECRET_KEY) {
      return { error: 'Cashfree credentials are not configured' };
    }

    const { computeServerAmount } = await import('./orders');
    const { amount, errors } = await computeServerAmount(payload.items, payload.couponCode);
    if (errors.length > 0) {
      return { error: errors.join('; ') };
    }

    const phone = (payload.customerPhone || '').replace(/[^0-9]/g, '').slice(-10);
    if (!phone || phone.length < 10) {
      return { error: 'Valid 10-digit phone number is required' };
    }

    const runtime = getRuntime(origin);
    const url = `${runtime.baseUrl}/orders`;
    console.log('Cashfree request:', { url, mode: runtime.mode, keyPreview: APP_ID?.slice(0, 8) });
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': APP_ID!,
        'x-client-secret': SECRET_KEY!,
      },
      body: JSON.stringify({
        order_id: payload.orderId,
        order_amount: amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: (payload.customerEmail || 'guest').replace(/[^a-zA-Z0-9]/g, '_'),
          customer_name: payload.customerName,
          customer_email: payload.customerEmail,
          customer_phone: phone,
        },
        order_meta: {
          return_url: getReturnUrl(origin),
          notify_url: `${getSafeBaseUrl(origin).replace(/\/$/, '')}/api/webhooks/cashfree`,
        },
      }),
    });

    const text = await response.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch { data = { message: text }; }
    if (!response.ok) {
      console.error('Cashfree error:', { status: response.status, body: text, url, keyPrefix: APP_ID?.slice(0, 8) });
      return { error: `Cashfree: ${data.message || data.error || `HTTP ${response.status}`}` };
    }
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
