import './server/env';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import commerceRoutes from './server/routes/commerce';
import prisma from './server/lib/database';
import { connectDatabase } from './server/lib/db-connect';
import { isDatabaseConfigured } from './server/lib/orders';
import { createOrderAccessToken } from './server/lib/order-access';
// NOTE: Database routes and cleanup scheduler are server-side only
// They are not imported here yet - will be added after Prisma is set up
// import databaseRoutes from './server/routes/database';
// import { scheduleCleanupJobs } from './server/lib/cleanup-scheduler';

const app: Express = express();
const PORT = process.env.NOTIFICATION_PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================
// RATE LIMITING (in-memory)
// ============================================
type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function createRateLimiter(maxRequests: number, windowMs: number, keyPrefix: string) {
  return (req: Request, res: Response, next: () => void) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    let bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + windowMs };
      rateBuckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > maxRequests) {
      res.status(429).json({ success: false, error: 'Rate limit exceeded. Try again later.' });
      return;
    }
    next();
  };
}

const otpRateLimit = createRateLimiter(15, 15 * 60 * 1000, 'otp');
const notifyRateLimit = createRateLimiter(40, 15 * 60 * 1000, 'notify');

// ============================================
// DELIVERY LOGS (in-memory)
// ============================================
type DeliveryLog = {
  id: string;
  timestamp: string;
  channel: string;
  recipient: string;
  status: 'success' | 'failed';
  subject?: string;
  detail?: string;
};

const deliveryLogs: DeliveryLog[] = [];

function recordDeliveryLog(entry: Omit<DeliveryLog, 'id' | 'timestamp'>) {
  deliveryLogs.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });
  if (deliveryLogs.length > 200) deliveryLogs.length = 200;
}

// ============================================
// EMAIL SERVICE SETUP
// ============================================

const emailPassword = (process.env.EMAIL_PASSWORD ?? '').replace(/\s/g, '');

const emailTransporter = nodemailer.createTransport(
  process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.EMAIL_USER, pass: emailPassword },
      }
    : {
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: emailPassword },
      }
);

async function sendEmailFallback(
  fallbackEmail: string | undefined,
  subject: string,
  text: string,
  results: string[]
): Promise<boolean> {
  if (!fallbackEmail || !process.env.EMAIL_USER) return false;
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: fallbackEmail,
      subject,
      text,
    });
    results.push(`✅ SMS unavailable — notification sent via email to ${fallbackEmail}`);
    return true;
  } catch (error: any) {
    results.push(`❌ Email fallback failed: ${error.message}`);
    return false;
  }
}

// Verify email connection
emailTransporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️  Email service not configured:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// ============================================
// SMS SERVICE SETUP (MULTIPLE PROVIDERS)
// ============================================

let twilioClient: ReturnType<typeof twilio> | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ SMS service (Twilio) ready');
} else {
  console.warn('⚠️  Twilio SMS service not configured - check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
}

// Free SMS providers fallback (email-to-SMS gateways for Indian carriers)
const carrierEmailGateways: Record<string, string> = {
  'airtel': '{phone}@airtelap.com',
  'jio': '{phone}@jio.com',
  'vi': '{phone}@vodafoneidea.com',
  'bsnl': '{phone}@bsnl.in',
};

// OTP Store for secure code management and rate-limiting
const otpStore = new Map<string, { otp: string; expiry: number; attempts: number; blockedUntil?: number }>();

// ============================================
// EMAIL TEMPLATES
// ============================================

const emailTemplates = {
  paymentSuccess: (data: {
    customerName: string;
    orderId: string;
    amount: string;
    paymentMethod: string;
    orderDate: string;
  }) => ({
    subject: `✅ Payment Successful - Order #${data.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #991b1b); color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { background: #f9fafb; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .details { margin: 15px 0; }
            .label { font-weight: bold; color: #666; }
            .value { color: #1f2937; margin-left: 10px; }
            .footer { text-align: center; color: #999; font-size: 12px; }
            .success-badge { color: #16a34a; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2><span class="success-badge">✓</span> Payment Received!</h2>
              <p>Hi ${data.customerName},</p>
            </div>

            <div class="content">
              <h3>Order Confirmation</h3>
              <div class="details">
                <span class="label">Order ID:</span>
                <span class="value">#${data.orderId}</span>
              </div>
              <div class="details">
                <span class="label">Amount Paid:</span>
                <span class="value">${data.amount}</span>
              </div>
              <div class="details">
                <span class="label">Payment Method:</span>
                <span class="value">${data.paymentMethod}</span>
              </div>
              <div class="details">
                <span class="label">Order Date:</span>
                <span class="value">${data.orderDate}</span>
              </div>

              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

              <h4 style="color: #dc2626;">What's Next?</h4>
              <ul>
                <li>Your order will be prepared within 24 hours</li>
                <li>You'll receive a shipping confirmation with tracking details</li>
                <li>Expected delivery: 5-7 business days</li>
                <li>You can check order status in your account</li>
              </ul>

              <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0; border-radius: 3px;">
                <strong>Thank you for your purchase!</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">We appreciate your business and will ensure your order arrives in perfect condition.</p>
              </div>
            </div>

            <div class="footer">
              <p>3D by SD 3D Store | India's Premium 3D Printed Products</p>
              <p>📧 support@3dbysd.in | 📱 +91-XXXXXXXXXX</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  deliveryConfirmation: (data: {
    customerName: string;
    orderId: string;
    trackingNumber: string;
    deliveryDate: string;
    returnWindow: number;
  }) => ({
    subject: `📦 Your Order Delivered - Order #${data.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { background: #f9fafb; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .details { margin: 15px 0; }
            .label { font-weight: bold; color: #666; }
            .value { color: #1f2937; margin-left: 10px; }
            .footer { text-align: center; color: #999; font-size: 12px; }
            .delivered-badge { color: #16a34a; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2><span class="delivered-badge">✓</span> Package Delivered!</h2>
              <p>Hi ${data.customerName},</p>
            </div>

            <div class="content">
              <h3>Delivery Confirmation</h3>
              <p>Your order has been successfully delivered!</p>

              <div class="details">
                <span class="label">Order ID:</span>
                <span class="value">#${data.orderId}</span>
              </div>
              <div class="details">
                <span class="label">Tracking Number:</span>
                <span class="value">${data.trackingNumber}</span>
              </div>
              <div class="details">
                <span class="label">Delivered On:</span>
                <span class="value">${data.deliveryDate}</span>
              </div>

              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

              <h4 style="color: #dc2626;">Return & Support</h4>
              <ul>
                <li>30-day return window from delivery date</li>
                <li>If there are any issues, please contact us within ${data.returnWindow} days</li>
                <li>Free returns for defective items</li>
                <li>Contact support: support@3dbysd.in</li>
              </ul>

              <div style="background: #dbeafe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 3px;">
                <strong>Rate Your Experience</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">We'd love to hear from you! Please rate your order and share your feedback.</p>
              </div>
            </div>

            <div class="footer">
              <p>3D by SD 3D Store | India's Premium 3D Printed Products</p>
              <p>📧 support@3dbysd.in | 📱 +91-XXXXXXXXXX</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
  orderShipped: (data: {
    customerName: string;
    orderId: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: string;
  }) => ({
    subject: `🚚 Order Shipped - Order #${data.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316, #dc2626); color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { background: #f9fafb; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .details { margin: 15px 0; }
            .label { font-weight: bold; color: #666; }
            .value { color: #1f2937; margin-left: 10px; }
            .footer { text-align: center; color: #999; font-size: 12px; }
            .shipped-badge { color: #f97316; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2><span class="shipped-badge">🚚</span> Your order is on the way!</h2>
              <p>Hi ${data.customerName},</p>
            </div>

            <div class="content">
              <h3>Shipment Details</h3>
              <div class="details">
                <span class="label">Order ID:</span>
                <span class="value">#${data.orderId}</span>
              </div>
              <div class="details">
                <span class="label">Carrier:</span>
                <span class="value">${data.carrier || 'TBD'}</span>
              </div>
              <div class="details">
                <span class="label">Tracking Number:</span>
                <span class="value">${data.trackingNumber || 'N/A'}</span>
              </div>
              <div class="details">
                <span class="label">Estimated Delivery:</span>
                <span class="value">${data.estimatedDelivery || 'N/A'}</span>
              </div>

              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">

              <p>If you have any questions or need help tracking your package, reply to this email and we'll assist you.</p>

            </div>

            <div class="footer">
              <p>3D by SD 3D Store | India's Premium 3D Printed Products</p>
              <p>📧 support@3dbysd.in | 📱 +91-XXXXXXXXXX</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  orderConfirmed: (data: { customerName: string; orderId: string; estimatedProduction?: string; }) => ({
    subject: `✅ Order Confirmed - Order #${data.orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { background: #f9fafb; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .details { margin: 15px 0; }
            .label { font-weight: bold; color: #666; }
            .value { color: #1f2937; margin-left: 10px; }
            .footer { text-align: center; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Order Confirmed</h2>
              <p>Hi ${data.customerName},</p>
            </div>

            <div class="content">
              <h3>Order #${data.orderId} has been confirmed</h3>
              <p>We received your order and it's queued for production.</p>
              <div class="details">
                <span class="label">Estimated Production Time:</span>
                <span class="value">${data.estimatedProduction || 'Typically 2-5 days'}</span>
              </div>
            </div>

            <div class="footer">
              <p>3D by SD 3D Store | India's Premium 3D Printed Products</p>
              <p>📧 support@3dbysd.in | 📱 +91-XXXXXXXXXX</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// ============================================
// SMS SENDING FUNCTION (MULTIPLE METHODS)
// ============================================

async function sendTelegramAlert(phone: string, message: string): Promise<{ sent: boolean; method: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { sent: false, method: '' };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `[3D by SD — SMS relay]\nTo: ${phone}\n\n${message}`,
      }),
    });
    const data = (await response.json()) as { ok?: boolean };
    if (data.ok) return { sent: true, method: 'Telegram' };
  } catch (error) {
    console.warn('Telegram fallback failed:', error);
  }
  return { sent: false, method: '' };
}

const sendSms = async (phone: string, message: string) => {
  let sent = false;
  let method = '';

  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });
      sent = true;
      method = 'Twilio';
    } catch (error) {
      console.warn('Twilio failed, trying fallback methods...');
    }
  }

  if (!sent && process.env.EMAIL_USER) {
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      for (const [carrier, gateway] of Object.entries(carrierEmailGateways)) {
        try {
          const smsEmail = gateway.replace('{phone}', cleanPhone);
          await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: smsEmail,
            subject: '',
            text: message,
          });
          sent = true;
          method = `Email-to-SMS (${carrier})`;
          break;
        } catch {
          // try next carrier
        }
      }
    } catch (error) {
      console.warn('Email-to-SMS gateways failed');
    }
  }

  if (!sent) {
    const tg = await sendTelegramAlert(phone, message);
    if (tg.sent) {
      sent = true;
      method = tg.method;
    }
  }

  return { sent, method };
};

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Send Payment Success Email & SMS
 * POST /api/notifications/payment-success
 */
app.post('/api/notifications/payment-success', notifyRateLimit, async (req: Request, res: Response) => {
  try {
    const {
      email,
      phone,
      customerName,
      orderId,
      amount,
      paymentMethod,
      orderDate,
    } = req.body;

    // Validate required fields
    if (!email || !customerName || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, customerName, orderId, amount',
      });
    }

    let emailSent = false;
    let smsSent = false;
    const results = [];

    // Send Email
    if (email) {
      try {
        const template = emailTemplates.paymentSuccess({
          customerName,
          orderId,
          amount,
          paymentMethod: paymentMethod || 'Online',
          orderDate: orderDate || new Date().toLocaleDateString('en-IN'),
        });

        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: template.subject,
          html: template.html,
        });

        emailSent = true;
        results.push('✅ Payment success email sent');
      } catch (error: any) {
        results.push(`❌ Email failed: ${error.message}`);
      }
    }

    // Send SMS
    if (phone) {
      try {
        const smsResult = await sendSms(phone, `Hi ${customerName}, your payment for Order #${orderId} (${amount}) has been received! Your order will be prepared soon.`);
        if (smsResult.sent) {
          smsSent = true;
          results.push(`✅ Payment success SMS sent (${smsResult.method})`);
        } else if (await sendEmailFallback(
          email,
          `3D by SD — Payment received (Order #${orderId})`,
          `Hi ${customerName}, your payment for Order #${orderId} (${amount}) has been received.`,
          results
        )) {
          smsSent = false;
          emailSent = emailSent || true;
        } else {
          results.push('⚠️ SMS not sent (no provider configured)');
        }
      } catch (error: any) {
        results.push(`❌ SMS failed: ${error.message}`);
      }
    }

    res.json({
      success: emailSent || smsSent,
      emailSent,
      smsSent,
      results,
      message: 'Payment notification sent',
    });
  } catch (error: any) {
    console.error('Error sending payment notification:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Send Order Confirmed Email & SMS
 * POST /api/notifications/order-confirmed
 */
app.post('/api/notifications/order-confirmed', notifyRateLimit, async (req: Request, res: Response) => {
  try {
    const { email, phone, customerName, orderId, estimatedProduction } = req.body;

    if (!email || !customerName || !orderId) {
      return res.status(400).json({ success: false, error: 'Missing required fields: email, customerName, orderId' });
    }

    let emailSent = false;
    let smsSent = false;
    const results: string[] = [];

    if (email) {
      try {
        const template = emailTemplates.orderConfirmed({ customerName, orderId, estimatedProduction });

        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: template.subject,
          html: template.html,
        });

        emailSent = true;
        results.push('✅ Order confirmed email sent');
      } catch (error: any) {
        results.push(`❌ Email failed: ${error.message}`);
      }
    }

    if (phone) {
      try {
        const smsResult = await sendSms(phone, `Hi ${customerName}, your order #${orderId} has been confirmed and queued for production.`);
        if (smsResult.sent) {
          smsSent = true;
          results.push(`✅ Order confirmed SMS sent (${smsResult.method})`);
        } else if (await sendEmailFallback(
          email,
          `3D by SD — Order confirmed (#${orderId})`,
          `Hi ${customerName}, your order #${orderId} has been confirmed and queued for production.`,
          results
        )) {
          emailSent = emailSent || true;
        } else {
          results.push('⚠️ SMS not sent (no provider configured)');
        }
      } catch (error: any) {
        results.push(`❌ SMS failed: ${error.message}`);
      }
    }

    res.json({ success: emailSent || smsSent, emailSent, smsSent, results, message: 'Order confirmed notification sent' });
  } catch (error: any) {
    console.error('Error sending order confirmed notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Send Delivery Confirmation Email & SMS
 * POST /api/notifications/delivery-confirmation
 */
app.post('/api/notifications/delivery-confirmation', notifyRateLimit, async (req: Request, res: Response) => {
  try {
    const {
      email,
      phone,
      customerName,
      orderId,
      trackingNumber,
      deliveryDate,
      returnWindow = 30,
    } = req.body;

    // Validate required fields
    if (!email || !customerName || !orderId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, customerName, orderId',
      });
    }

    let emailSent = false;
    let smsSent = false;
    const results = [];

    // Send Email
    if (email) {
      try {
        const template = emailTemplates.deliveryConfirmation({
          customerName,
          orderId,
          trackingNumber: trackingNumber || 'N/A',
          deliveryDate: deliveryDate || new Date().toLocaleDateString('en-IN'),
          returnWindow,
        });

        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: template.subject,
          html: template.html,
        });

        emailSent = true;
        results.push('✅ Delivery confirmation email sent');
      } catch (error: any) {
        results.push(`❌ Email failed: ${error.message}`);
      }
    }

    // Send SMS
    if (phone) {
      try {
        const smsResult = await sendSms(phone, `Your order #${orderId} has been delivered! Thank you for shopping with 3D by SD.`);
        if (smsResult.sent) {
          smsSent = true;
          results.push(`✅ Delivery confirmation SMS sent (${smsResult.method})`);
        } else {
          results.push('⚠️ SMS not sent (no provider configured)');
        }
      } catch (error: any) {
        results.push(`❌ SMS failed: ${error.message}`);
      }
    }

    res.json({
      success: emailSent || smsSent,
      emailSent,
      smsSent,
      results,
      message: 'Delivery notification sent',
    });
  } catch (error: any) {
    console.error('Error sending delivery notification:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Send Order Shipped Email & SMS
 * POST /api/notifications/order-shipped
 */
app.post('/api/notifications/order-shipped', notifyRateLimit, async (req: Request, res: Response) => {
  try {
    const { email, phone, customerName, orderId, trackingNumber, carrier, estimatedDelivery } = req.body;

    if (!email || !customerName || !orderId) {
      return res.status(400).json({ success: false, error: 'Missing required fields: email, customerName, orderId' });
    }

    let emailSent = false;
    let smsSent = false;
    const results: string[] = [];

    if (email) {
      try {
        const template = emailTemplates.orderShipped({ customerName, orderId, trackingNumber, carrier, estimatedDelivery });

        await emailTransporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: template.subject,
          html: template.html,
        });

        emailSent = true;
        results.push('✅ Order shipped email sent');
      } catch (error: any) {
        results.push(`❌ Email failed: ${error.message}`);
      }
    }

    if (phone) {
      try {
        const smsResult = await sendSms(phone, `Good news! Your order #${orderId} has shipped. Tracking: ${trackingNumber || 'N/A'}`);
        if (smsResult.sent) {
          smsSent = true;
          results.push(`✅ Order shipped SMS sent (${smsResult.method})`);
        } else {
          results.push('⚠️ SMS not sent (no provider configured)');
        }
      } catch (error: any) {
        results.push(`❌ SMS failed: ${error.message}`);
      }
    }

    res.json({ success: emailSent || smsSent, emailSent, smsSent, results, message: 'Order shipped notification sent' });
  } catch (error: any) {
    console.error('Error sending order shipped notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Health Check
 * GET /api/health
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: '3D by SD API',
    status: 'ok',
    message: 'Use /api/health or open the shop at http://localhost:3000',
    docs: {
      health: 'GET /api/health',
      orders: 'POST /api/orders, GET /api/orders?email=',
      payments: 'GET /api/payments/config, POST /api/payments/razorpay/order',
      timeline: 'GET /api/orders/:orderId/timeline',
      notifications: 'POST /api/notifications/payment-success',
    },
  });
});

app.get('/api', (_req: Request, res: Response) => {
  res.redirect(302, '/api/health');
});

app.get('/api/health', async (_req: Request, res: Response) => {
  let databaseConnected = false;
  if (isDatabaseConfigured()) {
    try {
      await prisma.$queryRawUnsafe('SELECT 1');
      databaseConnected = true;
    } catch {
      databaseConnected = false;
    }
  }

  res.json({
    status: 'ok',
    emailConfigured: !!process.env.EMAIL_USER,
    smsConfigured: !!(twilioClient || process.env.EMAIL_USER),
    databaseConfigured: isDatabaseConfigured(),
    databaseConnected,
    smsMethods: {
      twilio: !!twilioClient,
      emailToSms: !!process.env.EMAIL_USER,
      telegram: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', commerceRoutes);

app.get('/api/notifications/logs', notifyRateLimit, (_req: Request, res: Response) => {
  res.json({ success: true, logs: deliveryLogs });
});

/**
 * Send custom notification (arbitrary text)
 * POST /api/notifications/send
 */
app.post('/api/notifications/send', notifyRateLimit, async (req: Request, res: Response) => {
  try {
    const { to, subject, content, type = 'both', fallbackEmail } = req.body;
    if (!to || !content) {
      return res.status(400).json({ success: false, error: 'Missing required fields: to, content' });
    }

    let emailSent = false;
    let smsSent = false;
    const results: string[] = [];

    // Send Email
    if ((type === 'email' || type === 'both') && to.includes('@')) {
      if (process.env.EMAIL_USER) {
        try {
          await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: subject || 'New Notification',
            html: `<div style="font-family: sans-serif; padding: 20px;">${content}</div>`,
          });
          emailSent = true;
          results.push('✅ Email sent successfully');
        } catch (error: any) {
          results.push(`❌ Email failed: ${error.message}`);
        }
      } else {
        results.push('⚠️ Email not configured in environment');
      }
    }

    // Send SMS / Fallback
    if ((type === 'sms' || type === 'both') && !to.includes('@')) {
      try {
        const smsResult = await sendSms(to, content);
        if (smsResult.sent) {
          smsSent = true;
          results.push(`✅ SMS sent successfully via ${smsResult.method}`);
        } else if (await sendEmailFallback(
          fallbackEmail,
          subject || '3D by SD notification',
          content,
          results
        )) {
          emailSent = true;
        } else {
          results.push('❌ SMS failed and no fallback email provided');
        }
      } catch (error: any) {
        results.push(`❌ SMS send failed: ${error.message}`);
      }
    }

    const ok = emailSent || smsSent;
    recordDeliveryLog({
      channel: type,
      recipient: to,
      status: ok ? 'success' : 'failed',
      subject,
      detail: results.join('; '),
    });

    res.json({
      success: ok,
      emailSent,
      smsSent,
      results,
      message: 'Notification processing completed'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Generate Secure OTP
 * POST /api/otp/generate
 */
app.post('/api/otp/generate', otpRateLimit, async (req: Request, res: Response) => {
  try {
    const { to, expiryMinutes = 10 } = req.body;
    if (!to) {
      return res.status(400).json({ success: false, error: 'Recipient phone or email is required' });
    }

    // Check block list
    const record = otpStore.get(to);
    if (record && record.blockedUntil && Date.now() < record.blockedUntil) {
      const remainingSeconds = Math.ceil((record.blockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        error: `Too many failed attempts. You are temporarily blocked. Try again in ${remainingSeconds} seconds.`
      });
    }

    // Generate random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + expiryMinutes * 60 * 1000;

    otpStore.set(to, { otp: generatedOtp, expiry, attempts: 0 });

    const message = `Your OTP for 3D by SD verification is ${generatedOtp}. Valid for ${expiryMinutes} minutes.`;

    let notificationSent = false;
    let method = 'Log (Demo)';

    if (to.includes('@')) {
      if (process.env.EMAIL_USER) {
        try {
          await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: '🔐 Your OTP Code',
            text: message,
          });
          notificationSent = true;
          method = 'Email';
        } catch (err) {
          console.error('Failed to send OTP email:', err);
        }
      }
    } else {
      const smsResult = await sendSms(to, message);
      if (smsResult.sent) {
        notificationSent = true;
        method = smsResult.method;
      }
    }

    console.log(`🔐 OTP generated for ${to} (Sent via: ${method})`);

    const isDevPanel =
      req.headers['x-dev-panel'] === 'true' && process.env.NODE_ENV !== 'production';

    const body: Record<string, unknown> = {
      success: notificationSent,
      expiry,
      message: notificationSent
        ? `OTP sent successfully via ${method}`
        : 'OTP generated but delivery failed — check EMAIL_USER / SMTP settings',
    };

    if (isDevPanel) {
      body.devHint = generatedOtp;
    }

    res.json(body);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Verify OTP with fraud prevention (attempts counter)
 * POST /api/otp/verify
 */
app.post('/api/otp/verify', otpRateLimit, async (req: Request, res: Response) => {
  try {
    const { to, otp } = req.body;
    if (!to || !otp) {
      return res.status(400).json({ success: false, error: 'Recipient and OTP are required' });
    }

    const record = otpStore.get(to);
    if (!record) {
      return res.status(400).json({ success: false, message: 'OTP not requested or expired' });
    }

    // Check if blocked
    if (record.blockedUntil && Date.now() < record.blockedUntil) {
      const remainingSeconds = Math.ceil((record.blockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Attempts blocked. Try again in ${remainingSeconds} seconds.`
      });
    }

    // Expiry check
    if (Date.now() > record.expiry) {
      otpStore.delete(to);
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Match OTP
    if (record.otp === otp) {
      otpStore.delete(to);
      const orderAccessToken = createOrderAccessToken(String(to));
      return res.json({
        success: true,
        message: 'OTP verified successfully!',
        orderAccessToken,
      });
    }

    // Increment failed attempts (Rate limit/fraud prevention)
    record.attempts++;
    if (record.attempts >= 5) {
      record.blockedUntil = Date.now() + 5 * 60 * 1000; // block for 5 mins
      otpStore.set(to, record);
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Blocked for 5 minutes.'
      });
    }

    otpStore.set(to, record);
    return res.status(400).json({
      success: false,
      message: `Incorrect OTP. ${5 - record.attempts} attempts remaining.`
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// DATABASE ROUTES
// ============================================
// NOTE: Uncomment after Prisma is set up and DATABASE_URL is configured
// app.use('/api/database', databaseRoutes);

// Start server
void connectDatabase();

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🔔 NOTIFICATION SERVER RUNNING      ║
╚════════════════════════════════════════╝

📨 Email Service: ${process.env.EMAIL_USER ? '✅ Configured' : '⚠️  Not configured'}
📱 SMS Service: ${(twilioClient || process.env.EMAIL_USER) ? '✅ Configured' : '⚠️  Not configured'}
   - Twilio: ${twilioClient ? '✅' : '❌'}
   - Email-to-SMS (Free): ${process.env.EMAIL_USER ? '✅' : '❌'}
💾 Database: ${process.env.DATABASE_URL ? '✅ Configured (run prisma db push)' : '⚠️  Not configured'}

Server running on: http://localhost:${PORT}
Health check: GET /api/health

Commerce API:
  POST /api/orders
  GET  /api/orders?email=
  GET  /api/orders/:orderId
  GET  /api/orders/:orderId/timeline
  POST /api/newsletter/subscribe
  POST /api/custom-requests (multipart)

Payments (Phase 3):
  GET  /api/payments/config
  POST /api/payments/razorpay/order
  POST /api/payments/razorpay/verify
  POST /api/payments/verify-queue
  POST /api/payments/verify-queue/:id/approve

Public catalog:
  GET  /api/site/config
  GET  /api/products

Admin (X-Admin-Key header):
  GET  /api/admin/summary
  GET  /api/admin/analytics
  GET  /api/admin/site-config
  PUT  /api/admin/site-config
  GET  /api/admin/products
  PUT  /api/admin/products/:productId
  GET  /api/admin/orders
  GET  /api/admin/custom-lab
  GET  /api/admin/newsletter

Webhooks:
  POST /api/webhooks/razorpay

Notification Endpoints:
  POST /api/notifications/payment-success
  POST /api/notifications/order-confirmed
  POST /api/notifications/order-shipped
  POST /api/notifications/delivery-confirmation

Environment File: .env.local
  `);

  // Initialize cleanup scheduler
  // NOTE: Uncomment after Prisma is set up and DATABASE_URL is configured
  // if (process.env.DATABASE_URL) {
  //   scheduleCleanupJobs();
  // } else {
  //   console.warn('⚠️  Database not configured. Cleanup scheduler disabled.');
  // }
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL missing — orders API disabled. See .env.local.example');
  }

});

export default app;
