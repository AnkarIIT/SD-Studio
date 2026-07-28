/**
 * Cashfree integration.
 * Uses environment variables so deployments can switch between sandbox and production safely.
 */

const CASHFREE_MODE = (process.env.CASHFREE_MODE || process.env.NODE_ENV || 'development').toLowerCase();
const IS_PROD = CASHFREE_MODE === 'production';
const BASE_URL = IS_PROD ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';

const APP_ID = process.env.CASHFREE_APP_ID?.trim();
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY?.trim();

export async function createCashfreeOrder(payload: any) {
  try {
    if (!APP_ID || !SECRET_KEY) {
      return { error: 'Cashfree credentials are not configured' };
    }

    const response = await fetch(`${BASE_URL}/orders`, {
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
          return_url: `https://sd-studio-two.vercel.app/order-success?order_id={order_id}`,
        },
      }),
    });

    const data = await response.json() as any;
    if (!response.ok) return { error: data.message || 'Cashfree API Error' };
    return { data };
  } catch (err: any) {
    return { error: err?.message || 'Connection to Cashfree failed' };
  }
}

export async function verifyCashfreePayment(orderId: string) {
  try {
    if (!APP_ID || !SECRET_KEY) return false;

    const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
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
