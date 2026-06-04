import { Router, type Request, type Response } from 'express';
import prisma from '../lib/database';
import { requireAdmin } from '../lib/admin-auth';
import { isDatabaseConfigured, getOrdersByEmail, getOrderByOrderId } from '../lib/orders';
import {
  listVerificationQueue,
  approvePaymentVerification,
  advanceOrderStage,
} from '../lib/payment-queue';
import { getSiteConfig, saveSiteConfig, type SiteConfigData } from '../lib/site-config';
import { getAdminCatalogProducts, getCatalogProducts, getProductOverrides, upsertProductOverride } from '../lib/catalog';
import { getStoreAnalytics } from '../lib/analytics';
import { PRODUCTS } from '../../src/constants';
import { getOrderTimeline } from '../lib/timeline';
import type { TimelineStage } from '../lib/timeline';

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

const router = Router();

router.use(requireAdmin);

function dbUnavailable(res: Response) {
  return res.status(503).json({
    success: false,
    error: 'Database not configured',
  });
}

router.get('/admin/summary', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    const [orders, pendingVerifications, newsletterSubscribers, customLabRequests] =
      await Promise.all([
        prisma.order.count(),
        prisma.paymentVerificationQueue.count({ where: { status: 'pending' } }),
        prisma.newsletterSubscriber.count(),
        prisma.customLabRequest.count(),
      ]);

    let databaseConnected = false;
    try {
      await prisma.$queryRawUnsafe('SELECT 1');
      databaseConnected = true;
    } catch {
      databaseConnected = false;
    }

    res.json({
      success: true,
      summary: {
        orders,
        pendingVerifications,
        newsletterSubscribers,
        customLabRequests,
        databaseConnected,
        emailConfigured: Boolean(process.env.EMAIL_USER),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Summary failed';
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/admin/orders', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    const rows = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const orders = rows.map((row) => ({
      id: row.orderId,
      items: JSON.parse(row.items),
      subtotal: row.subtotal,
      tax: row.tax,
      shipping: row.shipping,
      discount: row.discount,
      total: row.total,
      status: row.status,
      paymentMethod: row.paymentMethod ?? 'upi',
      paymentId: row.paymentReference ?? undefined,
      couponCode: row.couponCode ?? undefined,
      shippingAddress: JSON.parse(row.shippingAddress),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));

    res.json({ success: true, orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load orders';
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/admin/custom-lab', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const requests = await prisma.customLabRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json({ success: true, requests });
});

router.get('/admin/newsletter', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json({ success: true, subscribers });
});

router.get('/admin/analytics', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);
  try {
    const analytics = await getStoreAnalytics();
    res.json({ success: true, analytics });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analytics failed';
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/admin/site-config', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);
  const config = await getSiteConfig();
  res.json({ success: true, config });
});

router.put('/admin/site-config', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);
  try {
    const config = await saveSiteConfig(req.body as SiteConfigData);
    res.json({ success: true, config });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Save failed';
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/admin/products', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);
  const [products, overrides] = await Promise.all([getAdminCatalogProducts(), getProductOverrides()]);
  res.json({
    success: true,
    baseCount: PRODUCTS.length,
    products,
    overrides,
  });
});

router.put('/admin/products/:productId', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);
  const { productId } = req.params;
  if (!PRODUCTS.some((p) => p.id === productId)) {
    return res.status(404).json({ success: false, error: 'Unknown product id' });
  }
  try {
    const { price, originalPrice, stock, inStock, hidden, badge } = req.body;
    await upsertProductOverride(productId, {
      price: price != null ? Number(price) : undefined,
      originalPrice: originalPrice != null ? Number(originalPrice) : undefined,
      stock: stock != null ? Number(stock) : undefined,
      inStock: inStock != null ? Boolean(inStock) : undefined,
      hidden: hidden != null ? Boolean(hidden) : undefined,
      badge: badge != null ? String(badge) : undefined,
    });
    const products = await getCatalogProducts();
    res.json({ success: true, products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update failed';
    res.status(500).json({ success: false, error: message });
  }
});

router.patch('/admin/custom-lab/:requestId', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);
  const status = String(req.body?.status ?? '').trim();
  if (!status) return res.status(400).json({ success: false, error: 'status required' });
  try {
    const updated = await prisma.customLabRequest.update({
      where: { requestId: req.params.requestId },
      data: { status },
    });
    res.json({ success: true, request: updated });
  } catch {
    res.status(404).json({ success: false, error: 'Request not found' });
  }
});

router.get('/admin/orders-by-email', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const email = String(req.query.email ?? '').trim();
  if (!email) {
    return res.status(400).json({ success: false, error: 'email query required' });
  }

  const orders = await getOrdersByEmail(email);
  res.json({ success: true, orders });
});

router.get('/admin/payments/verify-queue', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);
  const status = String(req.query.status ?? '').trim() || undefined;
  const entries = await listVerificationQueue(status);
  res.json({ success: true, entries });
});

router.post('/admin/payments/verify-queue/:id/approve', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);
  try {
    const { order } = await approvePaymentVerification(req.params.id);
    res.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Approve failed';
    res.status(400).json({ success: false, error: message });
  }
});

router.get('/admin/orders/:orderId/timeline', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);
  try {
    const timeline = await getOrderTimeline(req.params.orderId);
    res.json({ success: true, timeline });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Timeline load failed';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/admin/orders/:orderId/timeline/advance', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const stage = String(req.body?.stage ?? '').trim() as TimelineStage;
  const message = String(req.body?.message ?? '').trim() || undefined;

  if (!stage) {
    return res.status(400).json({ success: false, error: 'stage is required' });
  }

  try {
    const order = await advanceOrderStage(req.params.orderId, stage, message);
    const existing = await getOrderByOrderId(req.params.orderId);

    if (existing && stage === 'shipped') {
      await notifyTimelineEmail('/api/notifications/order-shipped', {
        email: existing.shippingAddress.email,
        phone: existing.shippingAddress.phone,
        customerName: existing.shippingAddress.fullName,
        orderId: req.params.orderId.slice(0, 8).toUpperCase(),
        trackingNumber: `LB-${Date.now().toString(36).toUpperCase()}`,
        carrier: '3D by SD Logistics',
        estimatedDelivery: '3–5 business days',
      });
    }
    if (existing && stage === 'delivered') {
      await notifyTimelineEmail('/api/notifications/delivery-confirmation', {
        email: existing.shippingAddress.email,
        phone: existing.shippingAddress.phone,
        customerName: existing.shippingAddress.fullName,
        orderId: req.params.orderId.slice(0, 8).toUpperCase(),
        trackingNumber: `LB-${req.params.orderId.slice(0, 6).toUpperCase()}`,
        deliveryDate: new Date().toLocaleDateString('en-IN'),
        returnWindow: 30,
      });
    }

    res.json({ success: true, order, timeline: await getOrderTimeline(req.params.orderId) });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Advance failed';
    res.status(400).json({ success: false, error: errMsg });
  }
});

export { listVerificationQueue };
export default router;