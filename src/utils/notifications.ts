/**
 * Notification Service - Frontend utilities to call backend notification APIs
 */

const NOTIFICATION_API = process.env.VITE_NOTIFICATION_API_URL || 'http://localhost:5001';

export interface PaymentNotificationData {
  email: string;
  phone?: string;
  customerName: string;
  orderId: string;
  amount: string;
  paymentMethod: string;
  orderDate?: string;
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
): Promise<NotificationResponse> => {
  try {
    const response = await fetch(
      `${NOTIFICATION_API}/api/notifications/payment-success`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send payment notification');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Payment notification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send payment notification',
    };
  }
};

/**
 * Send delivery confirmation notification (email + SMS)
 */
export const sendDeliveryNotification = async (
  data: DeliveryNotificationData
): Promise<NotificationResponse> => {
  try {
    const response = await fetch(
      `${NOTIFICATION_API}/api/notifications/delivery-confirmation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send delivery notification');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Delivery notification error:', error);
    return {
      success: false,
      error: error.message || 'Failed to send delivery notification',
    };
  }
};

/**
 * Check notification service health
 */
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
