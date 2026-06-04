import prisma from './database';
import { getOrderByOrderId, persistOrder, type CreateOrderPayload } from './orders';
import { addTimelineEvent, type TimelineStage } from './timeline';

export async function enqueuePaymentVerification(input: {
  orderId: string;
  method: string;
  reference?: string;
  amount: number;
  notes?: string;
}) {
  const existing = await prisma.paymentVerificationQueue.findFirst({
    where: {
      orderId: input.orderId,
      status: 'pending',
    },
  });
  if (existing) return existing;

  return prisma.paymentVerificationQueue.create({
    data: {
      orderId: input.orderId,
      method: input.method,
      reference: input.reference,
      amount: input.amount,
      notes: input.notes,
      status: 'pending',
    },
  });
}

export async function approvePaymentVerification(queueId: string) {
  const entry = await prisma.paymentVerificationQueue.findUnique({ where: { id: queueId } });
  if (!entry) throw new Error('Verification entry not found');
  if (entry.status !== 'pending') throw new Error(`Already ${entry.status}`);

  const order = await getOrderByOrderId(entry.orderId);
  if (!order) throw new Error('Order not found');

  const payload: CreateOrderPayload = {
    ...order,
    status: 'paid',
    paymentMethod: order.paymentMethod,
    paymentId: entry.reference ?? order.paymentId,
  };

  await persistOrder(payload);

  await prisma.paymentVerificationQueue.update({
    where: { id: queueId },
    data: { status: 'verified', processedAt: new Date() },
  });

  await addTimelineEvent(entry.orderId, 'payment_received', 'Payment verified');
  await addTimelineEvent(entry.orderId, 'production_started', 'Your print is queued');

  return { entry, order: payload };
}

export async function listVerificationQueue(status?: string) {
  return prisma.paymentVerificationQueue.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export function shouldAutoVerifyPayments(): boolean {
  if (process.env.AUTO_VERIFY_PAYMENTS === 'false') return false;
  if (process.env.AUTO_VERIFY_PAYMENTS === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

export async function advanceOrderStage(orderId: string, stage: TimelineStage, message?: string) {
  const order = await getOrderByOrderId(orderId);
  if (!order) throw new Error('Order not found');

  await addTimelineEvent(orderId, stage, message);

  const statusMap: Partial<Record<TimelineStage, typeof order.status>> = {
    shipped: 'shipped',
    delivered: 'delivered',
  };
  const nextStatus = statusMap[stage];
  if (nextStatus) {
    await persistOrder({ ...order, status: nextStatus });
  }

  if (stage === 'shipped') {
    await prisma.delivery.updateMany({
      where: { orderId },
      data: { status: 'shipped', shippedAt: new Date() },
    });
  }
  if (stage === 'delivered') {
    await prisma.delivery.updateMany({
      where: { orderId },
      data: { status: 'delivered', deliveredAt: new Date() },
    });
  }

  return getOrderByOrderId(orderId);
}