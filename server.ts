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

// --- CASHFREE ROUTES (Integrated directly for reset) ---

app.post('/api/payments/cashfree/order', async (req, res) => {
  const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;

  const { data, error } = await createCashfreeOrder({
    orderId,
    amount,
    name: customerName,
    email: customerEmail,
    phone: customerPhone
  });

  if (error) return res.status(400).json({ success: false, error });
  res.json({ success: true, paymentSessionId: data.payment_session_id, orderId: data.order_id });
});

app.post('/api/payments/cashfree/verify', async (req, res) => {
  const { orderId, orderPayload } = req.body;
  const isPaid = await verifyCashfreePayment(orderId);

  if (!isPaid) return res.status(400).json({ success: false, error: 'Payment not verified' });

  try {
    const order = await persistOrder({
      ...orderPayload,
      status: 'confirmed',
      paymentMethod: 'card',
    });
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Order persistence failed' });
  }
});

// --- CORE ROUTES ---
app.use('/api', commerceRoutes);
app.use('/api', publicRoutes);
app.use('/api', webhooksRoutes);

// --- HEALTH ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'live', env: process.env.NODE_ENV });
});

// --- SERVER START (Local Only) ---
if (!process.env.VERCEL) {
  void connectDatabase();
  app.listen(PORT, () => console.log(`🚀 Server ready on port ${PORT}`));
} else {
  // On Vercel, we just ensure DB connection logic is primed
  void connectDatabase();
}

export default app;
