/**
 * 🚀 Advanced Notification Engine - All-in-one solution for Email + SMS + OTP
 * Free, Professional, and Easy to Use!
 */

import { toast } from 'react-hot-toast';
import { NOTIFICATION_API, DEV_PANEL_HEADER } from './notifications';
import { isDemoModeActive, setManualDemoMode } from './notificationMode';

// ============================================
// Types & Interfaces
// ============================================
export interface NotificationOptions {
  to: string;
  subject: string;
  content: string;
  type?: 'email' | 'sms' | 'both';
  priority?: 'high' | 'medium' | 'low';
  otp?: string;
  otpExpiry?: number;
  /** Used when SMS fails — server sends email instead */
  fallbackEmail?: string;
}

export interface OTPOptions {
  length?: number;
  expiry?: number; // in minutes
  digits?: boolean;
}

export interface NotificationResult {
  success: boolean;
  channel: 'email' | 'sms' | 'fallback' | 'demo';
  message: string;
  details?: any;
}

// ============================================
// ============================================
// Mock Storage & Config
// ============================================
const otpStorage = new Map<string, { otp: string; expiry: number; attempts: number }>();
const notificationLogs: any[] = [];
const BACKEND_URL = NOTIFICATION_API;

// ============================================
// OTP Generator & Sender
// ============================================
export function generateOTP(options: OTPOptions = {}): string {
  const {
    length = 6,
    digits = true
  } = options;

  const chars = digits ? '0123456789' : 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
}

export async function sendOTP(
  to: string,
  options: OTPOptions & { devPanel?: boolean } = {}
): Promise<{ otp: string; expiry: Date }> {
  const isDemo = isDemoModeActive();
  const expiryMinutes = options.expiry || 10;

  if (isDemo) {
    const otpVal = generateOTP(options);
    const expiry = new Date(Date.now() + expiryMinutes * 60000);
    otpStorage.set(to, { otp: otpVal, expiry: expiry.getTime(), attempts: 0 });
    console.log(`🔐 [DEMO] OTP for ${to} (expires in ${expiryMinutes} mins)`);
    return { otp: otpVal, expiry };
  }

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.devPanel) headers[DEV_PANEL_HEADER] = 'true';

    const response = await fetch(`${BACKEND_URL}/api/otp/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ to, expiryMinutes }),
    });
    if (!response.ok) {
      throw new Error('Failed to generate OTP from backend');
    }
    const data = await response.json();
    return { otp: data.devHint ?? '', expiry: new Date(data.expiry) };
  } catch (err: any) {
    toast.error(`Backend OTP Error: ${err.message}`);
    throw err;
  }
}

export async function verifyOTP(to: string, otpVal: string): Promise<{ success: boolean; message: string }> {
  const isDemo = isDemoModeActive();

  if (isDemo) {
    const record = otpStorage.get(to);
    if (!record) {
      return { success: false, message: 'OTP not found or expired' };
    }
    if (Date.now() > record.expiry) {
      otpStorage.delete(to);
      return { success: false, message: 'OTP has expired' };
    }
    if (record.attempts >= 5) {
      otpStorage.delete(to);
      return { success: false, message: 'Too many attempts. Please request a new OTP' };
    }
    if (record.otp === otpVal) {
      otpStorage.delete(to);
      return { success: true, message: 'OTP verified successfully!' };
    }
    record.attempts++;
    otpStorage.set(to, record);
    return { success: false, message: `Invalid OTP. ${5 - record.attempts} attempts remaining` };
  } else {
    try {
      const response = await fetch(`${BACKEND_URL}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, otp: otpVal }),
      });
      const data = await response.json();
      return {
        success: !!data.success,
        message: data.message || data.error || (response.ok ? 'Verified' : 'Verification failed'),
      };
    } catch (err: any) {
      return { success: false, message: `Verification failed: ${err.message}` };
    }
  }
}

// ============================================
// Message Templates (AI-Style)
// ============================================
export const templates = {
  orderConfirmed: (data: { orderId: string; customerName: string; amount: string }) => ({
    emailSubject: `🎉 Order Confirmed! Your Order #${data.orderId}`,
    emailContent: `
      <h1>Hi ${data.customerName},</h1>
      <p>Great news! Your order has been confirmed and is being processed.</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Amount:</strong> ${data.amount}</p>
      <p>We'll notify you when your order ships!</p>
      <p>Best regards,<br>3D by SD Team</p>
    `,
    smsContent: `Hi ${data.customerName}! Your Order #${data.orderId} (${data.amount}) has been confirmed! - 3D by SD`
  }),

  paymentSuccess: (data: { orderId: string; customerName: string; amount: string; paymentMethod: string }) => ({
    emailSubject: `✅ Payment Received - Order #${data.orderId}`,
    emailContent: `
      <h1>Hi ${data.customerName},</h1>
      <p>Your payment of ${data.amount} has been received successfully!</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
      <p>Thank you for shopping with us!</p>
      <p>Best regards,<br>3D by SD Team</p>
    `,
    smsContent: `Payment received! Order #${data.orderId} (${data.amount}) confirmed. Thank you ${data.customerName}! - 3D by SD`
  }),

  orderShipped: (data: { orderId: string; customerName: string; trackingNumber?: string; carrier?: string }) => ({
    emailSubject: `🚚 Your Order is on the Way!`,
    emailContent: `
      <h1>Hi ${data.customerName},</h1>
      <p>Great news! Your order has been shipped!</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
      ${data.carrier ? `<p><strong>Carrier:</strong> ${data.carrier}</p>` : ''}
      <p>Expected delivery in 3-5 business days!</p>
      <p>Best regards,<br>3D by SD Team</p>
    `,
    smsContent: `Order #${data.orderId} shipped! ${data.trackingNumber ? `Track: ${data.trackingNumber}` : ''} - 3D by SD`
  }),

  orderDelivered: (data: { orderId: string; customerName: string }) => ({
    emailSubject: `📦 Your Order has been Delivered!`,
    emailContent: `
      <h1>Hi ${data.customerName},</h1>
      <p>Great news! Your order has been delivered!</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p>We hope you love your product! If you have any issues, please contact us.</p>
      <p>Best regards,<br>3D by SD Team</p>
    `,
    smsContent: `Order #${data.orderId} delivered! Enjoy your 3D printed product! - 3D by SD`
  }),

  otpMessage: (data: { otp: string; purpose: string; expiry: string }) => ({
    emailSubject: `🔐 Your OTP for ${data.purpose}`,
    emailContent: `
      <h1>Your Verification Code</h1>
      <p>Hi there,</p>
      <p>Your OTP for ${data.purpose} is:</p>
      <h2 style="font-size: 32px; letter-spacing: 8px; color: #3B82F6;">${data.otp}</h2>
      <p>This OTP will expire in ${data.expiry}.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>3D by SD Team</p>
    `,
    smsContent: `Your OTP for ${data.purpose} is ${data.otp}. Expires in ${data.expiry}. - 3D by SD`
  }),

  welcome: (data: { name: string; email: string }) => ({
    emailSubject: `👋 Welcome to 3D by SD, ${data.name}!`,
    emailContent: `
      <h1>Welcome ${data.name}!</h1>
      <p>Thank you for joining 3D by SD - your destination for premium 3D printed products!</p>
      <p>We're excited to have you with us.</p>
      <p>Get started by exploring our amazing collection!</p>
      <p>Best regards,<br>3D by SD Team</p>
    `,
    smsContent: `Welcome to 3D by SD, ${data.name}! Explore amazing 3D printed products. - 3D by SD`
  })
};

// ============================================
// Main Notification Engine
// ============================================
export class NotificationEngine {
  private static instance: NotificationEngine;
  private config: {
    email: { enabled: boolean; from: string };
    sms: { enabled: boolean; fallbackToEmail: boolean };
    demoMode: boolean;
  };

  private constructor() {
    this.config = {
      email: { enabled: true, from: 'notifications@3dbysd.in' },
      sms: { enabled: true, fallbackToEmail: true },
      demoMode: isDemoModeActive(),
    };
  }

  static getInstance(): NotificationEngine {
    if (!NotificationEngine.instance) {
      NotificationEngine.instance = new NotificationEngine();
    }
    return NotificationEngine.instance;
  }

  getDemoMode(): boolean {
    return isDemoModeActive();
  }

  setDemoMode(val: boolean) {
    this.config.demoMode = val;
    setManualDemoMode(val);
    toast.success(val ? 'Demo mode ON (no real email/SMS)' : 'Real mode ON (backend will send mail)');
  }

  refreshDemoMode() {
    this.config.demoMode = isDemoModeActive();
  }

  async send(options: NotificationOptions): Promise<NotificationResult> {
    const { to, subject, content, type = 'both', fallbackEmail } = options;

    const logEntry = {
      timestamp: new Date().toISOString(),
      to,
      type,
      subject,
      status: 'pending'
    };
    notificationLogs.push(logEntry);

    try {
      if (isDemoModeActive()) {
        const result = await this.sendDemo(to, subject, content, type);
        logEntry.status = 'success';
        return result;
      }

      // Real integration via backend
      const response = await fetch(`${BACKEND_URL}/api/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, content, type, fallbackEmail })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error');
      }

      const data = await response.json();
      logEntry.status = data.success ? 'success' : 'failed';
      return {
        success: data.success,
        channel: to.includes('@') ? 'email' : 'sms',
        message: data.message || 'Notification sent via backend',
        details: data
      };
    } catch (error: any) {
      console.error('Notification error:', error);
      logEntry.status = 'failed';
      toast.error(`Backend failed: ${error.message}. Logging locally.`);
      return {
        success: false,
        channel: 'demo',
        message: `Notification failed: ${error.message}`
      };
    }
  }

  private async sendDemo(to: string, subject: string, content: string, type: 'email' | 'sms' | 'both'): Promise<NotificationResult> {
    if (type === 'email' || type === 'both') {
      toast.success(`📧 Email queued to: ${to.substring(0, 30)}...`);
      console.log(`📧 [DEMO] Email sent to ${to} | Subject: ${subject}`);
    }
    if (type === 'sms' || type === 'both') {
      toast.success(`📱 SMS queued to: ${to.substring(0, 15)}...`);
      console.log(`📱 [DEMO] SMS sent to ${to} | Content: ${content.substring(0, 100)}...`);
    }

    if (subject.includes('Order') || subject.includes('Payment') || subject.includes('OTP')) {
      toast.success(subject, { duration: 4000 });
    }

    return {
      success: true,
      channel: 'demo',
      message: 'Notification sent successfully (Demo Mode)',
      details: { to, subject, mode: 'demo' }
    };
  }

  // Convenience methods for common notifications
  async sendOrderConfirmed(data: { email: string; phone?: string; orderId: string; customerName: string; amount: string }) {
    const template = templates.orderConfirmed(data);
    if (data.email) {
      await this.send({ to: data.email, subject: template.emailSubject, content: template.emailContent, type: 'email' });
    }
    if (data.phone) {
      await this.send({ to: data.phone, subject: '', content: template.smsContent, type: 'sms' });
    }
  }

  async sendPaymentSuccess(data: { email: string; phone?: string; orderId: string; customerName: string; amount: string; paymentMethod: string }) {
    const template = templates.paymentSuccess(data);
    if (data.email) {
      await this.send({ to: data.email, subject: template.emailSubject, content: template.emailContent, type: 'email' });
    }
    if (data.phone) {
      await this.send({ to: data.phone, subject: '', content: template.smsContent, type: 'sms' });
    }
  }

  async sendOrderShipped(data: { email: string; phone?: string; orderId: string; customerName: string; trackingNumber?: string; carrier?: string }) {
    const template = templates.orderShipped(data);
    if (data.email) {
      await this.send({ to: data.email, subject: template.emailSubject, content: template.emailContent, type: 'email' });
    }
    if (data.phone) {
      await this.send({ to: data.phone, subject: '', content: template.smsContent, type: 'sms' });
    }
  }

  async sendOrderDelivered(data: { email: string; phone?: string; orderId: string; customerName: string }) {
    const template = templates.orderDelivered(data);
    if (data.email) {
      await this.send({ to: data.email, subject: template.emailSubject, content: template.emailContent, type: 'email' });
    }
    if (data.phone) {
      await this.send({ to: data.phone, subject: '', content: template.smsContent, type: 'sms' });
    }
  }

  async sendWelcome(data: { name: string; email: string; phone?: string }) {
    const template = templates.welcome(data);
    if (data.email) {
      await this.send({ to: data.email, subject: template.emailSubject, content: template.emailContent, type: 'email' });
    }
    if (data.phone) {
      await this.send({ to: data.phone, subject: '', content: template.smsContent, type: 'sms' });
    }
  }

  async sendOTPNotification(data: { to: string; otp: string; purpose: string; expiryMinutes?: number }) {
    const template = templates.otpMessage({
      otp: data.otp,
      purpose: data.purpose,
      expiry: `${data.expiryMinutes || 10} minutes`
    });

    if (data.to.includes('@')) {
      await this.send({ to: data.to, subject: template.emailSubject, content: template.emailContent, type: 'email' });
    } else {
      try {
        await this.send({ to: data.to, subject: '', content: template.smsContent, type: 'sms' });
      } catch {
        console.log('SMS failed, fallback ignored in this demo mode integration');
      }
    }
  }

  // Admin functions
  getLogs() {
    return [...notificationLogs].reverse();
  }

  getStats() {
    const total = notificationLogs.length;
    const last24h = notificationLogs.filter(log =>
      new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;
    return { total, last24h };
  }
}

// Singleton instance
export const notificationEngine = NotificationEngine.getInstance();

// Export OTP functions for convenience
export const otp = {
  generate: sendOTP,
  verify: verifyOTP
};
