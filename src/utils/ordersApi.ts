import { Order } from '../types';
import { getOrderAccessToken } from './customerAuth';
import { fetchJSON } from './fetchJSON';

const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

function orderAccessHeaders(): HeadersInit {
  const token = getOrderAccessToken();
  if (!token) return {};
  return { 'X-Order-Token': token };
}

export const LAST_ORDER_EMAIL_KEY = 'sd_last_order_email';

export function rememberOrderEmail(email: string) {
  localStorage.setItem(LAST_ORDER_EMAIL_KEY, email.trim().toLowerCase());
}

export function getRememberedOrderEmail(): string {
  return localStorage.getItem(LAST_ORDER_EMAIL_KEY) ?? '';
}

export async function saveOrderToServer(order: Order): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
}> {
  try {
    const data = await fetchJSON<{ success: boolean; order?: Order; error?: string }>(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...orderAccessHeaders() },
      body: JSON.stringify(order),
    });
    if (!data.success) {
      return { success: false, error: data.error ?? 'Failed to save order' };
    }
    rememberOrderEmail(order.shippingAddress.email);
    return { success: true, order: data.order as Order };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Network error';
    return { success: false, error: message };
  }
}

export async function fetchOrdersFromServer(email: string): Promise<{
  success: boolean;
  orders: Order[];
  error?: string;
}> {
  try {
    const q = encodeURIComponent(email.trim().toLowerCase());
    const data = await fetchJSON<{ success: boolean; orders?: Order[]; error?: string }>(`${API_BASE}/api/orders?email=${q}`, {
      headers: orderAccessHeaders(),
    });
    if (!data.success) {
      return { success: false, orders: [], error: data.error };
    }
    return { success: true, orders: (data.orders ?? []) as Order[] };
  } catch {
    return { success: false, orders: [], error: 'Could not load orders from server' };
  }
}

export async function subscribeNewsletter(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const data = await fetchJSON<{ success: boolean; message?: string; error?: string }>(`${API_BASE}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!data.success) return { success: false, error: data.error };
    return { success: true, message: data.message };
  } catch {
    return { success: false, error: 'Subscribe failed — is the API server running?' };
  }
}

export type TimelineEvent = {
  id: string;
  orderId: string;
  stage: string;
  label: string;
  message?: string;
  emailSent: boolean;
  createdAt: string;
};

export async function fetchOrderTimeline(orderId: string): Promise<{
  success: boolean;
  timeline: TimelineEvent[];
  error?: string;
}> {
  try {
    const data = await fetchJSON<{ success: boolean; timeline?: TimelineEvent[]; error?: string }>(`${API_BASE}/api/orders/${encodeURIComponent(orderId)}/timeline`, {
      headers: orderAccessHeaders(),
    });
    if (!data.success) return { success: false, timeline: [], error: data.error };
    return { success: true, timeline: data.timeline ?? [] };
  } catch {
    return { success: false, timeline: [], error: 'Could not load timeline' };
  }
}

export async function enqueuePaymentVerification(input: {
  orderId: string;
  method: string;
  reference?: string;
  amount: number;
}): Promise<{ success: boolean; autoVerified?: boolean; error?: string; message?: string }> {
  try {
    const data = await fetchJSON<{ success: boolean; autoVerified?: boolean; message?: string; error?: string }>(`${API_BASE}/api/payments/verify-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!data.success) return { success: false, error: data.error };
    return { success: true, autoVerified: data.autoVerified, message: data.message };
  } catch {
    return { success: false, error: 'Verification queue unavailable' };
  }
}

export async function submitCustomLabRequest(form: FormData): Promise<{
  success: boolean;
  requestId?: string;
  message?: string;
  error?: string;
}> {
  try {
    const data = await fetchJSON<{ success: boolean; requestId?: string; message?: string; error?: string }>(`${API_BASE}/api/custom-requests`, {
      method: 'POST',
      body: form,
    });
    if (!data.success) return { success: false, error: data.error };
    return { success: true, requestId: data.requestId, message: data.message };
  } catch {
    return { success: false, error: 'Could not submit — is the API server running?' };
  }
}