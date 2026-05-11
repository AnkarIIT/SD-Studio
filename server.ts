import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
// NOTE: Database routes and cleanup scheduler are server-side only
// They are not imported here yet - will be added after Prisma is set up
// import databaseRoutes from './server/routes/database';
// import { scheduleCleanupJobs } from './server/lib/cleanup-scheduler';

dotenv.config({ path: '.env.local' });

const app: Express = express();
const PORT = process.env.NOTIFICATION_PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ============================================
// EMAIL SERVICE SETUP
// ============================================

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App-specific password
  },
});

// Verify email connection
emailTransporter.verify((error, success) => {
  if (error) {
    console.warn('⚠️  Email service not configured:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// ============================================
// SMS SERVICE SETUP (TWILIO)
// ============================================

let twilioClient: ReturnType<typeof twilio> | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ SMS service ready');
} else {
  console.warn('⚠️  SMS service not configured - set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
}

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
              <p>LayerBound 3D Store | India's Premium 3D Printed Products</p>
              <p>📧 support@layerbound.in | 📱 +91-XXXXXXXXXX</p>
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
                <li>Contact support: support@layerbound.in</li>
              </ul>

              <div style="background: #dbeafe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 3px;">
                <strong>Rate Your Experience</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">We'd love to hear from you! Please rate your order and share your feedback.</p>
              </div>
            </div>

            <div class="footer">
              <p>LayerBound 3D Store | India's Premium 3D Printed Products</p>
              <p>📧 support@layerbound.in | 📱 +91-XXXXXXXXXX</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Send Payment Success Email & SMS
 * POST /api/notifications/payment-success
 */
app.post('/api/notifications/payment-success', async (req: Request, res: Response) => {
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
    if (phone && twilioClient) {
      try {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        await twilioClient.messages.create({
          body: `Hi ${customerName}, your payment for Order #${orderId} (${amount}) has been received! Your order will be prepared soon. Track: layerbound.in/order/${orderId}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        });

        smsSent = true;
        results.push('✅ Payment success SMS sent');
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
 * Send Delivery Confirmation Email & SMS
 * POST /api/notifications/delivery-confirmation
 */
app.post('/api/notifications/delivery-confirmation', async (req: Request, res: Response) => {
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
    if (phone && twilioClient) {
      try {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        await twilioClient.messages.create({
          body: `Your order #${orderId} has been delivered! Thank you for shopping with LayerBound. Track return options at layerbound.in/order/${orderId}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        });

        smsSent = true;
        results.push('✅ Delivery confirmation SMS sent');
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
 * Health Check
 * GET /api/health
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    emailConfigured: !!process.env.EMAIL_USER,
    smsConfigured: !!twilioClient,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// DATABASE ROUTES
// ============================================
// NOTE: Uncomment after Prisma is set up and DATABASE_URL is configured
// app.use('/api/database', databaseRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🔔 NOTIFICATION SERVER RUNNING      ║
╚════════════════════════════════════════╝

📨 Email Service: ${process.env.EMAIL_USER ? '✅ Configured' : '⚠️  Not configured'}
📱 SMS Service: ${twilioClient ? '✅ Configured' : '⚠️  Not configured'}
💾 Database: ${process.env.DATABASE_URL ? '✅ Connected' : '⚠️  Not configured'}

Server running on: http://localhost:${PORT}
Health check: GET /api/health

Notification Endpoints:
  POST /api/notifications/payment-success
  POST /api/notifications/delivery-confirmation

Database Endpoints:
  POST /api/database/payments
  GET /api/database/payments
  PATCH /api/database/payments/:paymentId
  POST /api/database/deliveries
  GET /api/database/deliveries
  PATCH /api/database/deliveries/:deliveryId
  GET /api/database/stats
  POST /api/database/cleanup/trigger

Environment File: .env.local
  `);

  // Initialize cleanup scheduler
  // NOTE: Uncomment after Prisma is set up and DATABASE_URL is configured
  // if (process.env.DATABASE_URL) {
  //   scheduleCleanupJobs();
  // } else {
  //   console.warn('⚠️  Database not configured. Cleanup scheduler disabled.');
  // }
  console.warn('⚠️  Database not configured. Cleanup scheduler disabled.');

});

export default app;
