import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import '../server/env'; // Load env first

const app: Express = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err) {
    return res.status(err.status || 400).json({
      success: false,
      error: err?.message || 'Invalid request body',
    });
  }
  return next();
});

// --- CASHFREE ---
app.post('/api/payments/cashfree/order', async (req: Request, res: Response) => {
  try {
    const { createCashfreeOrder } = await import('../server/lib/cashfree');
    const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;
    const origin = req.headers.origin;
    const { data, error, mode } = await createCashfreeOrder({
      orderId,
      amount,
      name: customerName,
      email: customerEmail,
      phone: customerPhone
    }, origin);
    if (error) return res.status(400).json({ success: false, error });
    res.json({ success: true, paymentSessionId: data.payment_session_id, orderId: data.order_id, cashfreeMode: mode });
  } catch (err: any) {
    console.error('Cashfree order route failed:', err);
    res.status(500).json({ success: false, error: err?.message || 'Payment order route failed' });
  }
});

app.post('/api/payments/cashfree/verify', async (req: Request, res: Response) => {
  try {
    const { verifyCashfreePayment } = await import('../server/lib/cashfree');
    const { persistOrder } = await import('../server/lib/orders');
    const { orderId, orderPayload } = req.body;
    const origin = req.headers.origin;
    const isPaid = await verifyCashfreePayment(orderId, origin);
    if (!isPaid) return res.status(400).json({ success: false, error: 'Payment not verified' });

    const order = await persistOrder({ ...orderPayload, status: 'confirmed', paymentMethod: 'card' });
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Cashfree verify route failed:', err);
    res.status(500).json({ success: false, error: err?.message || 'Order persistence failed' });
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
app.use('/api', async (req: Request, res: Response, next) => {
  try {
    const [{ default: commerceRoutes }, { default: publicRoutes }, { default: webhooksRoutes }] = await Promise.all([
      import('../server/routes/commerce'),
      import('../server/routes/public'),
      import('../server/routes/webhooks'),
    ]);

    return express.Router()
      .use(commerceRoutes)
      .use(publicRoutes)
      .use(webhooksRoutes)(req, res, next);
  } catch (err: any) {
    console.error('API route mount failed:', err);
    return res.status(500).json({ success: false, error: err?.message || 'API route failed' });
  }
});

if (!process.env.VERCEL) {
  const port = Number(process.env.NOTIFICATION_PORT || 5001);
  app.listen(port, () => {
    console.log(`✅ API server listening on http://localhost:${port}`);
  });
}

export default app;
