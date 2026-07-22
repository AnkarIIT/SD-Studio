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

router.get('/admin/users', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        totpEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ success: true, users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load users';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/admin/users', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const { name, email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  try {
    const { hashPassword } = await import('../lib/user-auth');
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: String(email).trim().toLowerCase(),
        password: hashedPassword,
        role: role || 'customer',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    res.status(400).json({ success: false, error: message });
  }
});

router.put('/admin/users/:id', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const { name, role, isActive } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    res.status(400).json({ success: false, error: message });
  }
});

router.delete('/admin/users/:id', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true, message: 'User deactivated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to deactivate user';
    res.status(400).json({ success: false, error: message });
  }
});

router.get('/admin/activity-logs', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, logs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load activity logs';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/admin/users/:id/totp/enable', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    const { enableTotpForUser } = await import('../lib/user-auth');
    const result = await enableTotpForUser(req.params.id);
    if (!result) {
      return res.status(400).json({ success: false, error: 'Failed to enable TOTP' });
    }
    res.json({ success: true, secret: result.secret, qrCodeUrl: result.qrCodeUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to enable TOTP';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/admin/users/:id/totp/confirm', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, error: 'TOTP token is required' });
  }

  try {
    const { confirmTotpSetup } = await import('../lib/user-auth');
    const isValid = await confirmTotpSetup(req.params.id, token);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid TOTP token' });
    }
    res.json({ success: true, message: 'TOTP enabled successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to confirm TOTP';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/admin/users/:id/totp/disable', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    const { disableTotpForUser } = await import('../lib/user-auth');
    const success = await disableTotpForUser(req.params.id);
    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to disable TOTP' });
    }
    res.json({ success: true, message: 'TOTP disabled successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to disable TOTP';
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/admin/users/:id/sessions', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    const sessions = await prisma.userSession.findMany({
      where: { userId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, sessions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load sessions';
    res.status(500).json({ success: false, error: message });
  }
});

router.delete('/admin/sessions/:id', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    await prisma.userSession.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Session terminated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to terminate session';
    res.status(400).json({ success: false, error: message });
  }
});

router.delete('/admin/users/:id/sessions', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    await prisma.userSession.deleteMany({ where: { userId: req.params.id } });
    res.json({ success: true, message: 'All user sessions terminated' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to terminate sessions';
    res.status(400).json({ success: false, error: message });
  }
});

export { listVerificationQueue };
export default router;