import { Router, type Request, type Response } from 'express';
import prisma from '../lib/database';
import { isDatabaseConfigured, getOrderByOrderId, persistOrder } from '../lib/orders';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  isRazorpayConfigured,
  getRazorpayKeyId,
} from '../lib/razorpay';
import {
  enqueuePaymentVerification,
  approvePaymentVerification,
  shouldAutoVerifyPayments,
} from '../lib/payment-queue';
import { getOrderTimeline, addTimelineEvent } from '../lib/timeline';
import { getOrderAccessEmailFromRequest } from '../lib/order-access';

const router = Router();

function dbUnavailable(res: Response) {
  return res.status(503).json({
    success: false,
    error: 'Database not configured. Set DATABASE_URL in .env.local and run: npm run db:push',
  });
}

async function notifyTimelineEmail(
  path: string,
  body: Record<string, unknown>
): Promise<void> {
  const port = process.env.NOTIFICATION_PORT || 5001;
  try {
    await fetch(`http://127.0.0.1:${port}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    /* notifications optional */
  }
}

router.get('/payments/config', (_req: Request, res: Response) => {
  const configured = isRazorpayConfigured();
  res.json({
    success: true,
    razorpayEnabled: true,
    keyId: getRazorpayKeyId() ?? process.env.VITE_RAZORPAY_KEY_ID ?? 'rzp_demo_layerbound',
    demoMode: !configured,
    autoVerify: shouldAutoVerifyPayments(),
  });
});

router.post('/payments/razorpay/order', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const { orderId, amount } = req.body as { orderId?: string; amount?: number };
  if (!orderId || typeof amount !== 'number') {
    return res.status(400).json({ success: false, error: 'orderId and amount are required' });
  }

  try {
    const { order, demo } = await createRazorpayOrder(amount, orderId);

    await prisma.payment.updateMany({
      where: { orderId },
      data: { razorpayOrderId: order.id },
    });

    res.json({
      success: true,
      demo,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Razorpay order failed';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/payments/razorpay/verify', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const {
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body as {
    orderId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({ success: false, error: 'Missing Razorpay verification fields' });
  }

  const valid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!valid) {
    return res.status(400).json({ success: false, error: 'Invalid payment signature' });
  }

  try {
    const existing = await getOrderByOrderId(orderId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = await persistOrder({
      ...existing,
      status: 'paid',
      paymentMethod: 'card',
      paymentId: razorpayPaymentId,
    });

    await prisma.payment.updateMany({
      where: { orderId },
      data: { razorpayOrderId, razorpayPaymentId, paymentStatus: 'success' },
    });

    await addTimelineEvent(orderId, 'payment_received', 'Razorpay payment verified', true);
    await addTimelineEvent(orderId, 'production_started', 'Print queued in lab');

    const formattedId = orderId.slice(0, 8).toUpperCase();
    await notifyTimelineEmail('/api/notifications/payment-success', {
      email: existing.shippingAddress.email,
      phone: existing.shippingAddress.phone,
      customerName: existing.shippingAddress.fullName,
      orderId: formattedId,
      amount: `₹${existing.total.toFixed(2)}`,
      paymentMethod: 'Razorpay',
    });
    await notifyTimelineEmail('/api/notifications/order-confirmed', {
      email: existing.shippingAddress.email,
      phone: existing.shippingAddress.phone,
      customerName: existing.shippingAddress.fullName,
      orderId: formattedId,
      estimatedProduction: '2–5 business days',
    });

    res.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/payments/verify-queue', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const { orderId, method, reference, amount, notes } = req.body as {
    orderId?: string;
    method?: string;
    reference?: string;
    amount?: number;
    notes?: string;
  };

  if (!orderId || !method || typeof amount !== 'number') {
    return res.status(400).json({ success: false, error: 'orderId, method, and amount are required' });
  }

  try {
    const entry = await enqueuePaymentVerification({
      orderId,
      method,
      reference,
      amount,
      notes,
    });

    if (shouldAutoVerifyPayments()) {
      const { order } = await approvePaymentVerification(entry.id);
      const existing = await getOrderByOrderId(orderId);
      if (existing) {
        const formattedId = orderId.slice(0, 8).toUpperCase();
        await notifyTimelineEmail('/api/notifications/order-confirmed', {
          email: existing.shippingAddress.email,
          phone: existing.shippingAddress.phone,
          customerName: existing.shippingAddress.fullName,
          orderId: formattedId,
          estimatedProduction: '2–5 business days',
        });
      }
      return res.json({
        success: true,
        autoVerified: true,
        entry: { ...entry, status: 'verified' },
        order,
      });
    }

    res.status(201).json({ success: true, autoVerified: false, entry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Queue failed';
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/orders/:orderId/timeline', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const accessEmail = getOrderAccessEmailFromRequest(req);
  if (!accessEmail) {
    return res.status(401).json({
      success: false,
      error: 'Order access token required — verify OTP first',
    });
  }

  try {
    const order = await getOrderByOrderId(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    if (order.shippingAddress.email.trim().toLowerCase() !== accessEmail) {
      return res.status(403).json({ success: false, error: 'Access denied for this order' });
    }

    const timeline = await getOrderTimeline(req.params.orderId);
    res.json({ success: true, timeline });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Timeline load failed';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;