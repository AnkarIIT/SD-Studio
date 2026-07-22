import { getAdminApiKey, getAdminToken } from './adminAuth';
import type { Order } from '../types';

const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

function adminHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : { 'X-Admin-Key': getAdminApiKey() }),
  };
}

export type AdminSummary = {
  orders: number;
  pendingVerifications: number;
  newsletterSubscribers: number;
  customLabRequests: number;
  databaseConnected: boolean;
  emailConfigured: boolean;
};

export async function fetchAdminSiteConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/site-config`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return null;
    return data.config;
  } catch {
    return null;
  }
}

export async function saveAdminSiteConfig(config: unknown) {
  const res = await fetch(`${API_BASE}/api/admin/site-config`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(config),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.config;
}

export async function fetchAdminSummary(): Promise<AdminSummary | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/summary`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return null;
    return data.summary;
  } catch {
    return null;
  }
}

export async function fetchAdminOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/orders`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return [];
    return data.orders ?? [];
  } catch {
    return [];
  }
}

export async function fetchPaymentQueue(status = 'pending') {
  try {
    const res = await fetch(`${API_BASE}/api/admin/payments/verify-queue?status=${status}`, {
      headers: adminHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return [];
    return data.entries ?? [];
  } catch {
    return [];
  }
}

export async function approvePaymentQueue(id: string) {
  const res = await fetch(`${API_BASE}/api/admin/payments/verify-queue/${id}/approve`, {
    method: 'POST',
    headers: adminHeaders(),
  });
  return res.json();
}

export async function fetchAdminOrderTimeline(orderId: string) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/orders/${encodeURIComponent(orderId)}/timeline`, {
      headers: adminHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, timeline: [], error: data.error };
    return { success: true, timeline: data.timeline ?? [] };
  } catch {
    return { success: false, timeline: [], error: 'Could not load timeline' };
  }
}

export async function advanceOrderTimeline(orderId: string, stage: string, message?: string) {
  const res = await fetch(`${API_BASE}/api/admin/orders/${encodeURIComponent(orderId)}/timeline/advance`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ stage, message }),
  });
  return res.json();
}

export type StoreAnalytics = {
  totalOrders: number;
  paidOrders: number;
  revenue: number;
  avgOrderValue: number;
  byStatus: Record<string, number>;
  last7Days: Array<{ date: string; orders: number; revenue: number }>;
};

export async function fetchAdminAnalytics(): Promise<StoreAnalytics | null> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/analytics`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return null;
    return data.analytics;
  } catch {
    return null;
  }
}

export async function fetchAdminProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/products`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return { products: [], overrides: [] };
    return { products: data.products ?? [], overrides: data.overrides ?? [] };
  } catch {
    return { products: [], overrides: [] };
  }
}

export async function patchAdminProduct(
  productId: string,
  patch: Record<string, unknown>
) {
  const res = await fetch(`${API_BASE}/api/admin/products/${productId}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(patch),
  });
  return res.json();
}

export async function fetchAdminCustomLab() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/custom-lab`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return { requests: [], error: data.error };
    return { requests: data.requests ?? [], error: undefined };
  } catch {
    return { requests: [], error: 'Failed to load custom lab requests' };
  }
}

export async function fetchAdminNewsletter() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/newsletter`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return { subscribers: [], error: data.error };
    return { subscribers: data.subscribers ?? [], error: undefined };
  } catch {
    return { subscribers: [], error: 'Failed to load subscribers' };
  }
}

export async function patchCustomLabStatus(requestId: string, status: string) {
  const res = await fetch(`${API_BASE}/api/admin/custom-lab/${requestId}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function fetchAdminUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return { users: [], error: data.error };
    return { users: data.users ?? [], error: undefined };
  } catch {
    return { users: [], error: 'Failed to load users' };
  }
}

export async function createAdminUser(userData: { name?: string; email: string; password: string; role?: string }) {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function updateAdminUser(userId: string, userData: { name?: string; role?: string; isActive?: boolean }) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(userData),
  });
  return res.json();
}

export async function deactivateAdminUser(userId: string) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return res.json();
}

export async function fetchActivityLogs() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/activity-logs`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return { logs: [], error: data.error };
    return { logs: data.logs ?? [], error: undefined };
  } catch {
    return { logs: [], error: 'Failed to load activity logs' };
  }
}

export async function enableUserTotp(userId: string) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/totp/enable`, {
    method: 'POST',
    headers: adminHeaders(),
  });
  return res.json();
}

export async function confirmUserTotp(userId: string, token: string) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/totp/confirm`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ token }),
  });
  return res.json();
}

export async function disableUserTotp(userId: string) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/totp/disable`, {
    method: 'POST',
    headers: adminHeaders(),
  });
  return res.json();
}

export async function fetchUserSessions(userId: string) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}/sessions`, { headers: adminHeaders() });
    const data = await res.json();
    if (!res.ok) return { sessions: [], error: data.error };
    return { sessions: data.sessions ?? [], error: undefined };
  } catch {
    return { sessions: [], error: 'Failed to load sessions' };
  }
}

export async function terminateSession(sessionId: string) {
  const res = await fetch(`${API_BASE}/api/admin/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return res.json();
}

export async function terminateAllUserSessions(userId: string) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/sessions`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
  return res.json();
}
