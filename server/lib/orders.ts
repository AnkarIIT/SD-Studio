import prisma, { auditRepo, deliveryRepo, paymentRepo } from './database';
import { addTimelineEvent, seedInitialTimeline } from './timeline';
import type { Address, CartItem, Order } from '../../src/types';

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export type CreateOrderPayload = {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: Order['status'];
  paymentMethod: Order['paymentMethod'];
  paymentId?: string;
  couponCode?: string;
  shippingAddress: Address;
};

function mapRowToOrder(row: {
  orderId: string;
  items: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  couponCode: string | null;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}): Order {
  return {
    id: row.orderId,
    items: JSON.parse(row.items) as CartItem[],
    subtotal: row.subtotal,
    tax: row.tax,
    shipping: row.shipping,
    discount: row.discount,
    total: row.total,
    status: row.status as Order['status'],
    paymentMethod: (row.paymentMethod ?? 'upi') as Order['paymentMethod'],
    paymentId: row.paymentReference ?? undefined,
    couponCode: row.couponCode ?? undefined,
    shippingAddress: JSON.parse(row.shippingAddress) as Address,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function persistOrder(payload: CreateOrderPayload): Promise<Order> {
  const email = payload.shippingAddress.email.trim().toLowerCase();
  const customerId = email;
  const addressJson = JSON.stringify(payload.shippingAddress);
  const itemsJson = JSON.stringify(payload.items);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const paymentStatus =
    payload.status === 'paid' || payload.status === 'confirmed' ? 'success' : 'pending';

  await prisma.$transaction(async (tx) => {
    await tx.order.upsert({
      where: { orderId: payload.id },
      create: {
        orderId: payload.id,
        customerId,
        customerName: payload.shippingAddress.fullName,
        customerEmail: email,
        customerPhone: payload.shippingAddress.phone,
        items: itemsJson,
        subtotal: payload.subtotal,
        tax: payload.tax,
        shipping: payload.shipping,
        discount: payload.discount,
        total: payload.total,
        status: payload.status,
        paymentMethod: payload.paymentMethod,
        paymentReference: payload.paymentId,
        couponCode: payload.couponCode,
        shippingAddress: addressJson,
        expiresAt,
      },
      update: {
        status: payload.status,
        paymentMethod: payload.paymentMethod,
        paymentReference: payload.paymentId,
        updatedAt: new Date(),
      },
    });

    await tx.payment.upsert({
      where: { orderId: payload.id },
      create: {
        orderId: payload.id,
        customerId,
        customerName: payload.shippingAddress.fullName,
        customerEmail: email,
        customerPhone: payload.shippingAddress.phone,
        amount: payload.total,
        paymentMethod: payload.paymentMethod,
        paymentReference: payload.paymentId,
        paymentStatus,
        itemCount: payload.items.reduce((s, i) => s + i.quantity, 0),
        completedAt: paymentStatus === 'success' ? new Date() : undefined,
        expiresAt,
      },
      update: {
        paymentStatus,
        paymentReference: payload.paymentId,
        completedAt: paymentStatus === 'success' ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });

    const payment = await tx.payment.findUnique({ where: { orderId: payload.id } });
    if (!payment) throw new Error('Payment record missing after upsert');

    await tx.delivery.upsert({
      where: { orderId: payload.id },
      create: {
        orderId: payload.id,
        paymentId: payment.id,
        customerName: payload.shippingAddress.fullName,
        customerPhone: payload.shippingAddress.phone,
        street: payload.shippingAddress.street,
        city: payload.shippingAddress.city,
        state: payload.shippingAddress.state,
        pincode: payload.shippingAddress.pincode,
        status: 'pending',
        expiresAt,
      },
      update: {
        customerName: payload.shippingAddress.fullName,
        customerPhone: payload.shippingAddress.phone,
        street: payload.shippingAddress.street,
        city: payload.shippingAddress.city,
        state: payload.shippingAddress.state,
        pincode: payload.shippingAddress.pincode,
        updatedAt: new Date(),
      },
    });
  });

  await auditRepo.log('order', payload.id, 'created', { total: payload.total, status: payload.status });

  const isNew = !(await prisma.orderTimelineEvent.findFirst({
    where: { orderId: payload.id, stage: 'order_placed' },
  }));
  if (isNew) await seedInitialTimeline(payload.id);
  if (payload.status === 'paid' || payload.status === 'confirmed') {
    await addTimelineEvent(payload.id, 'payment_received', 'Payment recorded');
  }

  const row = await prisma.order.findUniqueOrThrow({ where: { orderId: payload.id } });
  return mapRowToOrder(row);
}

export async function getOrderByOrderId(orderId: string): Promise<Order | null> {
  const row = await prisma.order.findUnique({ where: { orderId } });
  return row ? mapRowToOrder(row) : null;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const normalized = email.trim().toLowerCase();
  const rows = await prisma.order.findMany({
    where: { customerEmail: normalized },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return rows.map(mapRowToOrder);
}

export { paymentRepo, deliveryRepo };