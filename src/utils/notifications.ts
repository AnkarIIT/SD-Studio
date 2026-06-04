/**
 * Notification Service - Frontend utilities to call backend notification APIs
 */

import { isDemoModeActive } from './notificationMode';

/** Empty string = same-origin /api via Vite proxy in dev */
export const NOTIFICATION_API = import.meta.env.VITE_NOTIFICATION_API_URL || '';

async function postOrderNotification(
  path: string,
  body: object,
  demoLabel: string
): Promise<NotificationResponse> {
  if (isDemoModeActive()) {
    return {
      success: true,
      results: [`Demo: ${demoLabel} (no real email/SMS sent)`],
      message: 'Demo mode — notification simulated',
    };
  }

  try {
    const response = await fetch(`${NOTIFICATION_API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as { error?: string }).error || 'Failed to send notification');
    }

    return await response.json();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send notification';
    console.error(`${demoLabel} error:`, error);
    return { success: false, error: message };
  }
}

export const DEV_PANEL_HEADER = 'X-Dev-Panel';

export interface PaymentNotificationData {
  email: string;
  phone?: string;
  customerName: string;
  orderId: string;
  amount: string;
  paymentMethod: string;
  orderDate?: string;
}

export interface OrderConfirmedNotificationData {
  email: string;
  phone?: string;
  customerName: string;
  orderId: string;
  estimatedProduction?: string;
}

export interface OrderShippedNotificationData {
  email: string;
  phone?: string;
  customerName: string;
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export interface DeliveryNotificationData {
  email: string;
  phone?: string;
  customerName: string;
  orderId: string;
  trackingNumber?: string;
  deliveryDate?: string;
  returnWindow?: number;
}

export interface NotificationResponse {
  success: boolean;
  emailSent?: boolean;
  smsSent?: boolean;
  results?: string[];
  error?: string;
  message?: string;
}

/**
 * Send payment success notification (email + SMS)
 */
export const sendPaymentSuccessNotification = async (
  data: PaymentNotificationData
): Promise<NotificationResponse> =>
  postOrderNotification('/api/notifications/payment-success', data, 'Payment confirmation');

/**
 * Send order confirmed notification (email + SMS)
 */
export const sendOrderConfirmedNotification = async (
  data: OrderConfirmedNotificationData
): Promise<NotificationResponse> =>
  postOrderNotification('/api/notifications/order-confirmed', data, 'Order confirmed');

/**
 * Send order shipped notification (email + SMS)
 */
export const sendOrderShippedNotification = async (
  data: OrderShippedNotificationData
): Promise<NotificationResponse> =>
  postOrderNotification('/api/notifications/order-shipped', data, 'Order shipped');

/**
 * Send delivery confirmation notification (email + SMS)
 */
export const sendDeliveryNotification = async (
  data: DeliveryNotificationData
): Promise<NotificationResponse> =>
  postOrderNotification('/api/notifications/delivery-confirmation', data, 'Delivery confirmation');

/**
 * Check notification service health
 */
export const fetchNotificationLogs = async (): Promise<{
  success: boolean;
  logs: Array<{
    id: string;
    timestamp: string;
    channel: string;
    recipient: string;
    status: string;
    subject?: string;
    detail?: string;
  }>;
}> => {
  try {
    const response = await fetch(`${NOTIFICATION_API}/api/notifications/logs`);
    if (!response.ok) throw new Error('Failed to load logs');
    return await response.json();
  } catch {
    return { success: false, logs: [] };
  }
};

export const checkNotificationServiceHealth = async (): Promise<{
  status: string;
  emailConfigured: boolean;
  smsConfigured: boolean;
}> => {
  try {
    const response = await fetch(`${NOTIFICATION_API}/api/health`);
    if (!response.ok) throw new Error('Service not available');
    return await response.json();
  } catch (error) {
    console.warn('Notification service health check failed:', error);
    return {
      status: 'unavailable',
      emailConfigured: false,
      smsConfigured: false,
    };
  }
};

/**
 * Format phone number for SMS (Indian format)
 */
export const formatPhoneForSms = (phone: string): string => {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If already has country code, return as is
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  // If 10-digit Indian number, add +91
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  // If already has +91, return as is
  if (phone.startsWith('+91')) {
    return phone;
  }

  // Default: try to add +91
  return `+91${digits.slice(-10)}`;
};

/**
 * Format price for notification display
 */
export const formatPriceForNotification = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

/**
 * Format date for notification display
 */
export const formatDateForNotification = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indian phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
};
