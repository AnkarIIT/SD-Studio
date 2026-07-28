import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import '../server/env'; // Load env first

// Import Logic
import commerceRoutes from '../server/routes/commerce';
import publicRoutes from '../server/routes/public';
import webhooksRoutes from '../server/routes/webhooks';
import { createCashfreeOrder, verifyCashfreePayment } from '../server/lib/cashfree';
import { persistOrder } from '../server/lib/orders';
import { connectDatabase } from '../server/lib/db-connect';

const app: Express = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- CASHFREE ---
app.post('/api/payments/cashfree/order', async (req: Request, res: Response) => {
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

app.post('/api/payments/cashfree/verify', async (req: Request, res: Response) => {
  const { orderId, orderPayload } = req.body;
  const isPaid = await verifyCashfreePayment(orderId);
  if (!isPaid) return res.status(400).json({ success: false, error: 'Payment not verified' });

  try {
    const order = await persistOrder({ ...orderPayload, status: 'confirmed', paymentMethod: 'card' });
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Order persistence failed' });
  }
});

// --- PING ---
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong', timestamp: new Date().toISOString() });
});

// --- HEALTH ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', vercel: !!process.env.VERCEL });
});

// --- MOUNT ROUTES ---
app.use('/api', commerceRoutes);
app.use('/api', publicRoutes);
app.use('/api', webhooksRoutes);

// Database init for serverless
void connectDatabase();

export default app;
