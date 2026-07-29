import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';
import prisma from '../lib/database';
import { getOrderByOrderId, persistOrder } from '../lib/orders';
import { addTimelineEvent } from '../lib/timeline';

const router = Router();

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== 'production';
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

router.post(
  '/webhooks/razorpay',
  async (req: Request, res: Response) => {
    const signature = String(req.headers['x-razorpay-signature'] ?? '');
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (!verifyWebhookSignature(rawBody, signature)) {
      return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
    }

    try {
      const payload = typeof req.body === 'object' ? req.body : JSON.parse(rawBody);
      const event = payload?.event as string | undefined;

      if (event === 'payment.captured') {
        const payment = payload?.payload?.payment?.entity;
        const razorpayPaymentId = payment?.id as string | undefined;
        const razorpayOrderId = payment?.order_id as string | undefined;
        const receipt = payment?.notes?.sd_order_id ?? payment?.notes?.receipt;

        if (receipt && razorpayPaymentId) {
          const order = await getOrderByOrderId(String(receipt));
          if (order) {
            await persistOrder({
              ...order,
              status: 'paid',
              paymentMethod: 'razorpay',
              paymentId: razorpayPaymentId,
            });
            await prisma.payment.updateMany({
              where: { orderId: String(receipt) },
              data: {
                razorpayOrderId,
                razorpayPaymentId,
                paymentStatus: 'success',
                paymentReference: razorpayPaymentId,
              },
            });
            await addTimelineEvent(String(receipt), 'payment_received', 'Razorpay webhook');
          }
        }
      }

      res.json({ success: true, received: event });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Webhook error';
      res.status(500).json({ success: false, error: message });
    }
  }
);

router.post('/webhooks/cashfree', async (req: Request, res: Response) => {
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const type = payload?.type;
    const orderId = payload?.data?.order?.order_id;

    if ((type === 'PAYMENT_SUCCESS_WEBHOOK' || type === 'payment.success') && orderId) {
      const order = await getOrderByOrderId(orderId);
      if (order && order.status !== 'paid' && order.status !== 'confirmed') {
        await persistOrder({
          ...order,
          status: 'paid',
          paymentMethod: 'card',
          paymentId: payload?.data?.payment?.cf_payment_id || `cf_${Date.now()}`,
        });
        await addTimelineEvent(orderId, 'payment_received', 'Cashfree webhook');
      }
    }

    res.json({ success: true, received: type });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cashfree webhook error';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;