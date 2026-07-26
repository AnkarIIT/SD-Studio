import './server/env';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import commerceRoutes from './server/routes/commerce';
import publicRoutes from './server/routes/public';
import webhooksRoutes from './server/routes/webhooks';
import { connectDatabase } from './server/lib/db-connect';
import { isDatabaseConfigured } from './server/lib/orders';
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
// API ENDPOINTS
// ============================================

app.post('/api/payments/cashfree/order', async (req, res) => {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;
    const { data, error } = await createCashfreeOrder({
      orderId,
      orderAmount: amount,
      customerName,
      customerEmail,
      customerPhone,
    });

    if (error || !data) {
      return res.status(400).json({ success: false, error: error || 'Failed to create Cashfree order' });
    }

    res.json({ success: true, paymentSessionId: data.payment_session_id, orderId: data.order_id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/payments/cashfree/verify', async (req, res) => {
  try {
    const { orderId, orderPayload } = req.body;
    const cfOrder = await getCashfreeOrder(orderId);

    if (!cfOrder || cfOrder.order_status !== 'PAID') {
      return res.status(400).json({ success: false, error: 'Payment not verified' });
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

app.get('/api/health', async (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    databaseConfigured: isDatabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// Start server only if not running in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  void connectDatabase();
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║         3D BY SD SERVER RUNNING        ║
╚════════════════════════════════════════╝
PORT: ${PORT}
`);
  });
} else {
  // In serverless, we just need to ensure the DB connection is ready
  void connectDatabase();
}

export default app;
