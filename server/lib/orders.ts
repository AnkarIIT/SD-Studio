import prisma, { auditRepo, deliveryRepo, paymentRepo } from './database';
import { addTimelineEvent, seedInitialTimeline } from './timeline';
import { getCatalogProducts } from './catalog';
import type { Address, CartItem, Order } from '../../src/types';

let dbConnectionHealthy: boolean | null = null;
let lastDbCheck = 0;
const DB_CHECK_TTL = 30_000;

export async function isDatabaseConfigured(): Promise<boolean> {
  if (!process.env.DATABASE_URL?.trim()) return false;
  const now = Date.now();
  if (dbConnectionHealthy !== null && now - lastDbCheck < DB_CHECK_TTL) {
    return dbConnectionHealthy;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnectionHealthy = true;
  } catch {
    dbConnectionHealthy = false;
  }
  lastDbCheck = now;
  return dbConnectionHealthy;
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

async function recalculateOrderTotals(payload: CreateOrderPayload): Promise<{
  subtotal: number;
  total: number;
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  if (!payload.items || payload.items.length === 0) {
    return { subtotal: 0, total: 0, valid: false, errors: ['Order must contain at least one item'] };
  }

  const catalogProducts = await getCatalogProducts();
  const productMap = new Map(catalogProducts.map(p => [p.id, p]));

  let calculatedSubtotal = 0;
  for (const item of payload.items) {
    const catalogProduct = productMap.get(item.id);
    if (!catalogProduct) {
      errors.push(`Invalid product: ${item.name} (${item.id})`);
      continue;
    }
    const catalogPrice = catalogProduct.price;
    if (Math.abs(item.price - catalogPrice) > 0.01) {
      errors.push(`Price mismatch for ${item.name}: client=${item.price}, catalog=${catalogPrice}`);
    }
    calculatedSubtotal += Math.round(catalogPrice * item.quantity * 100) / 100;
  }

  if (errors.length > 0) {
    return { subtotal: calculatedSubtotal, total: 0, valid: false, errors };
  }

  const validatedSubtotal = Math.round(payload.subtotal * 100) / 100;
  const expectedSubtotal = Math.round(payload.items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100;
  if (Math.abs(validatedSubtotal - expectedSubtotal) > 0.01) {
    errors.push(`Subtotal mismatch: declared=${validatedSubtotal}, calculated=${expectedSubtotal}`);
  }

  const validatedTotal = Math.round(payload.total * 100) / 100;
  const expectedTotal = Math.round((validatedSubtotal + (payload.tax || 0) + (payload.shipping || 0) - (payload.discount || 0)) * 100) / 100;
  if (Math.abs(validatedTotal - expectedTotal) > 0.01) {
    errors.push(`Total mismatch: declared=${validatedTotal}, calculated=${expectedTotal}`);
  }

  return {
    subtotal: validatedSubtotal,
    total: validatedTotal,
    valid: errors.length === 0,
    errors,
  };
}

export async function computeServerAmount(
  items: Array<{ id: string; quantity: number }>,
  couponCode?: string
): Promise<{ amount: number; errors: string[] }> {
  const catalogProducts = await getCatalogProducts();
  const productMap = new Map(catalogProducts.map(p => [p.id, p]));

  const errors: string[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.id);
    if (!product) {
      errors.push(`Invalid product: ${item.id}`);
      continue;
    }
    subtotal += Math.round(product.price * item.quantity * 100) / 100;
  }

  if (errors.length > 0) return { amount: 0, errors };

  let total = subtotal;

  if (couponCode) {
    try {
      const { getSiteConfig } = await import('./site-config');
      const config = await getSiteConfig();
      const coupon = config.coupons?.[couponCode];
      if (coupon) {
        const discount = Math.round(subtotal * coupon.percent / 100 * 100) / 100;
        total -= discount;
      }
    } catch { /* ignore coupon lookup errors */ }
  }

  if (subtotal > 0) total += 249;

  return { amount: Math.round(total * 100) / 100, errors: [] };
}

function toNum(v: any): number {
  return typeof v === 'number' ? v : Number(v);
}

function mapRowToOrder(row: {
  orderId: string;
  items: string;
  subtotal: any;
  tax: any;
  shipping: any;
  discount: any;
  total: any;
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
    subtotal: toNum(row.subtotal),
    tax: toNum(row.tax),
    shipping: toNum(row.shipping),
    discount: toNum(row.discount),
    total: toNum(row.total),
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
  // Server-side price validation
  const validation = await recalculateOrderTotals(payload);
  if (!validation.valid) {
    throw new Error(`Order validation failed: ${validation.errors.join('; ')}`);
  }

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
