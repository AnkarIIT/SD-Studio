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
        const receipt = payment?.notes?.layerbound_order_id ?? payment?.notes?.receipt;

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

export default router;