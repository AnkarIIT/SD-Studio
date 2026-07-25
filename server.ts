import './server/env';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import commerceRoutes from './server/routes/commerce';
import publicRoutes from './server/routes/public';
import webhooksRoutes from './server/routes/webhooks';
import prisma from './server/lib/database';
import { connectDatabase } from './server/lib/db-connect';
import { isDatabaseConfigured } from './server/lib/orders';
import { createOrderAccessToken } from './server/lib/order-access';
import { createCashfreeOrder, getCashfreeOrder } from './server/lib/cashfree';
import { persistOrder } from './server/lib/orders';

const app: Express = express();
const PORT = process.env.NOTIFICATION_PORT || 5001;

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (isDevelopment) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

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

const generalRateLimit = createRateLimiter(100, 15 * 60 * 1000, 'api');

// ============================================
// API ENDPOINTS
// ============================================

/**
 * Health Check
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: '3D by SD API',
    status: 'ok',
    message: 'Server running',
    docs: {
      health: 'GET /api/health',
      orders: 'POST /api/orders, GET /api/orders?email=',
      payments: 'POST /api/payments/cashfree/order',
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
    databaseConfigured: isDatabaseConfigured(),
    databaseConnected,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/payments/cashfree/order', async (req, res) => {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;
    const cfOrder = await createCashfreeOrder({
      orderId,
      orderAmount: amount,
      customerName,
      customerEmail,
      customerPhone,
    });

    if (!cfOrder) {
      return res.status(500).json({ success: false, error: 'Failed to create Cashfree order' });
    }

    res.json({ success: true, paymentSessionId: cfOrder.payment_session_id, orderId: cfOrder.order_id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/payments/cashfree/verify', async (req, res) => {
  try {
    const { orderId, orderPayload } = req.body;
    const cfOrder = await getCashfreeOrder(orderId);

    if (!cfOrder || cfOrder.order_status !== 'PAID') {
      return res.status(400).json({ success: false, error: 'Payment not verified or order not paid' });
    }

    // Persist order on success
    const finalOrder = await persistOrder({
      ...orderPayload,
      status: 'confirmed',
      paymentMethod: 'card',
      paymentId: cfOrder.cf_order_id.toString(),
    });

    res.json({ success: true, order: finalOrder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api', commerceRoutes);
app.use('/api', publicRoutes);
app.use('/api', webhooksRoutes);

// Start server
void connectDatabase();

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║         3D BY SD SERVER RUNNING        ║
╚════════════════════════════════════════╝

💾 Database: ${process.env.DATABASE_URL ? '✅ Configured' : '⚠️  Not configured'}

Server running on: http://localhost:${PORT}
Health check: GET /api/health

Commerce API:
  POST /api/orders
  GET  /api/orders?email=
  GET  /api/orders/:orderId
  POST /api/newsletter/subscribe
  POST /api/custom-requests (multipart)

Payments (Cashfree):
  POST /api/payments/cashfree/order
  POST /api/payments/cashfree/verify

Public catalog:
  GET  /api/site/config
  GET  /api/products

Webhooks:
  POST /api/webhooks/razorpay (deprecated)
  `);

  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL missing — orders API disabled.');
  }
});

export default app;
