import './server/env';
import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import commerceRoutes from './server/routes/commerce';
import publicRoutes from './server/routes/public';
import webhooksRoutes from './server/routes/webhooks';
import { createCashfreeOrder, verifyCashfreePayment } from './server/lib/cashfree';
import { persistOrder } from './server/lib/orders';
import { connectDatabase } from './server/lib/db-connect';

const app: Express = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- BASIC CONNECTIVITY TEST ---
app.get('/api/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasDbUrl: !!process.env.DATABASE_URL
  });
});

// --- CASHFREE ROUTES ---

app.post('/api/payments/cashfree/order', async (req, res) => {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;

    if (!orderId || !amount || !customerEmail) {
      return res.status(400).json({ success: false, error: 'Missing required order fields' });
    }

    const { data, error } = await createCashfreeOrder({
      orderId,
      amount,
      name: customerName || 'Customer',
      email: customerEmail,
      phone: customerPhone || '9999999999'
    });

    if (error) return res.status(400).json({ success: false, error });
    res.json({ success: true, paymentSessionId: data.payment_session_id, orderId: data.order_id });
  } catch (err: any) {
    console.error('Order Route Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/payments/cashfree/verify', async (req, res) => {
  try {
    const { orderId, orderPayload } = req.body;
    const isPaid = await verifyCashfreePayment(orderId);

    if (!isPaid) return res.status(400).json({ success: false, error: 'Payment not verified' });

    const order = await persistOrder({
      ...orderPayload,
      status: 'confirmed',
      paymentMethod: 'card',
    });
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Verify Route Error:', err);
    res.status(500).json({ success: false, error: 'Order persistence failed' });
  }
});

// --- CORE ROUTES ---
app.use('/api', commerceRoutes);
app.use('/api', publicRoutes);
app.use('/api', webhooksRoutes);

// --- HEALTH ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'live',
    dbConfigured: !!process.env.DATABASE_URL,
    vercel: !!process.env.VERCEL
  });
});

// --- SERVER START (Local Only) ---
// Note: Vercel does not use app.listen(), it uses the exported app.
if (!process.env.VERCEL) {
  void connectDatabase();
  app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
} else {
  // On Vercel, ensuring DB connection logic is primed
  void connectDatabase();
}

export default app;
