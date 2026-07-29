import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import '../server/env'; // Load env first

const app: Express = express();

const ALLOWED_ORIGINS = (() => {
  const origins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'http://localhost:5001'];
  if (process.env.VERCEL) {
    if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
    if (process.env.VERCEL_BRANCH_URL) origins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return origins;
})();

// Middleware
app.use(cors({
  origin: (origin, cb) => {
    if (ALLOWED_ORIGINS.some(o => origin === o)) cb(null, true);
    else cb(null, false);
  },
  credentials: true,
}));
app.use(bodyParser.json({
  limit: '1mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  },
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://checkout.razorpay.com https://sdk.cashfree.com https://sandbox.cashfree.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.razorpay.com https://api.cashfree.com https://sandbox.cashfree.com; img-src 'self' data: https:; font-src 'self' data:; frame-src https://checkout.razorpay.com https://sandbox.cashfree.com https://api.cashfree.com");
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err) {
    return res.status(err.status || 400).json({
      success: false,
      error: err?.message || 'Invalid request body',
    });
  }
  return next();
});

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many attempts. Try again later.' },
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many payment requests. Try again later.' },
});

// --- CASHFREE ---
app.post('/api/payments/cashfree/order', paymentLimiter, async (req: Request, res: Response) => {
  try {
    const { createCashfreeOrder } = await import('../server/lib/cashfree');
    const { orderId, items, couponCode, customerName, customerEmail, customerPhone } = req.body;
    const origin = req.headers.origin;
    const { data, error, mode } = await createCashfreeOrder({
      orderId,
      items,
      couponCode,
      customerName,
      customerEmail,
      customerPhone,
    }, origin);
    if (error) {
      console.error('Cashfree order error:', { error, payload: { orderId, customerEmail } });
      return res.status(400).json({ success: false, error });
    }
    res.json({ success: true, paymentSessionId: data.payment_session_id, orderId: data.order_id });
  } catch (err: any) {
    console.error('Cashfree order route failed:', err);
    res.status(500).json({ success: false, error: err?.message || 'Payment order route failed' });
  }
});

app.post('/api/payments/cashfree/verify', paymentLimiter, async (req: Request, res: Response) => {
  try {
    const { verifyCashfreePayment } = await import('../server/lib/cashfree');
    const { persistOrder } = await import('../server/lib/orders');
    const { getCatalogProducts, getCouponDiscount } = await import('../server/lib/catalog');
    const { orderId, items, shippingAddress, couponCode, paymentMethod } = req.body;
    const origin = req.headers.origin;
    const isPaid = await verifyCashfreePayment(orderId, origin);
    if (!isPaid) return res.status(400).json({ success: false, error: 'Payment not verified' });

    const catalog = await getCatalogProducts();
    const productMap = new Map(catalog.map(p => [p.id, p]));
    const cartItems: any[] = [];
    let subtotal = 0;
    for (const i of items) {
      const product = productMap.get(i.id);
      if (!product) return res.status(400).json({ success: false, error: `Invalid product: ${i.id}` });
      cartItems.push({ ...product, quantity: i.quantity });
      subtotal += Math.round(product.price * i.quantity * 100) / 100;
    }
    const discount = couponCode ? await getCouponDiscount(subtotal, couponCode) : 0;
    const shipping = subtotal > 0 ? 249 : 0;
    const total = Math.round((subtotal - discount + shipping) * 100) / 100;

    const orderPayload = {
      id: orderId, items: cartItems, subtotal, tax: 0, shipping, discount, total,
      status: 'confirmed' as const,
      paymentMethod: (paymentMethod || 'card') as any,
      shippingAddress, couponCode,
    };

    const order = await persistOrder(orderPayload);
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

// --- RAZORPAY ---
app.post('/api/payments/razorpay/order', paymentLimiter, async (req: Request, res: Response) => {
  try {
    const { createRazorpayOrder, getRazorpayKeyId } = await import('../server/lib/razorpay');
    const { computeServerAmount } = await import('../server/lib/orders');
    const { orderId, items, couponCode } = req.body;
    const { amount, errors } = await computeServerAmount(items, couponCode);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join('; ') });
    }
    const amountPaise = Math.round(amount * 100);
    const order = await createRazorpayOrder(amountPaise, orderId);
    res.json({ success: true, razorpayOrderId: order.id, amount: order.amount, keyId: getRazorpayKeyId() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Razorpay order failed' });
  }
});

app.post('/api/payments/razorpay/verify', paymentLimiter, async (req: Request, res: Response) => {
  try {
    const { verifyRazorpaySignature } = await import('../server/lib/razorpay');
    const { persistOrder } = await import('../server/lib/orders');
    const { getCatalogProducts, getCouponDiscount } = await import('../server/lib/catalog');
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, items, shippingAddress, couponCode } = req.body;

    const valid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) return res.status(400).json({ success: false, error: 'Invalid payment signature' });

    const catalog = await getCatalogProducts();
    const productMap = new Map(catalog.map(p => [p.id, p]));
    const cartItems: any[] = [];
    let subtotal = 0;
    for (const i of items) {
      const product = productMap.get(i.id);
      if (!product) return res.status(400).json({ success: false, error: `Invalid product: ${i.id}` });
      cartItems.push({ ...product, quantity: i.quantity });
      subtotal += Math.round(product.price * i.quantity * 100) / 100;
    }
    const discount = couponCode ? await getCouponDiscount(subtotal, couponCode) : 0;
    const shipping = subtotal > 0 ? 249 : 0;
    const total = Math.round((subtotal - discount + shipping) * 100) / 100;

    const orderPayload = {
      id: orderId, items: cartItems, subtotal, tax: 0, shipping, discount, total,
      status: 'paid' as const,
      paymentMethod: 'razorpay' as any,
      paymentId: razorpayPaymentId,
      shippingAddress, couponCode,
    };

    const order = await persistOrder(orderPayload);
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Razorpay verify failed' });
  }
});

// --- PAYMENT CONFIG ---
app.get('/api/payments/config', async (_req: Request, res: Response) => {
  try {
    const { isRazorpayConfigured, getRazorpayKeyId } = await import('../server/lib/razorpay');
    const configured = isRazorpayConfigured();
    res.json({
      razorpayEnabled: configured,
      keyId: configured ? getRazorpayKeyId() : undefined,
    });
  } catch {
    res.json({ razorpayEnabled: false });
  }
});

// --- PAYMENT VERIFICATION QUEUE ---
app.post('/api/payments/verify-queue', paymentLimiter, async (req: Request, res: Response) => {
  try {
    const { enqueuePaymentVerification } = await import('../server/lib/payment-queue');
    const { orderId, method, reference, amount } = req.body;

    await enqueuePaymentVerification({ orderId, method, reference, amount });

    res.json({ success: true, autoVerified: false, message: 'Queued for manual verification' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Verification queue failed' });
  }
});

// --- ORDER TIMELINE ---
app.get('/api/orders/:orderId/timeline', async (req: Request, res: Response) => {
  try {
    const { getOrderTimeline } = await import('../server/lib/timeline');
    const { getOrderByOrderId } = await import('../server/lib/orders');
    const { getOrderAccessEmailFromRequest } = await import('../server/lib/order-access');

    const tokenEmail = getOrderAccessEmailFromRequest(req);
    if (!tokenEmail) {
      return res.status(401).json({ success: false, error: 'Order access token required' });
    }

    const order = await getOrderByOrderId(req.params.orderId);
    if (!order || order.shippingAddress.email.trim().toLowerCase() !== tokenEmail) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const timeline = await getOrderTimeline(req.params.orderId);
    res.json({ success: true, timeline });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Failed to load timeline' });
  }
});

// --- CUSTOMER AUTH ---
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const DUMMY_BCRYPT_HASH = '$2b$12$LJ3m4ys3Lk0TSwHlgntFou0N4F1k7tCBmGspMOFNYpSZqJk/Mn/pe';

let _jwtSecret: string | null = null;

async function getJwtSecret(): Promise<string> {
  if (_jwtSecret) return _jwtSecret;

  const envSecret = process.env.ORDER_ACCESS_SECRET?.trim();
  if (envSecret) {
    _jwtSecret = envSecret;
    return _jwtSecret;
  }

  try {
    const prisma = (await import('../server/lib/database')).default;
    const row = await prisma.siteConfig.findUnique({ where: { id: 'jwt_secret' } });
    if (row?.data) {
      _jwtSecret = row.data;
      return _jwtSecret;
    }
  } catch { /* DB not available — will generate ephemeral */ }

  const generated = crypto.randomBytes(32).toString('hex');
  try {
    const prisma = (await import('../server/lib/database')).default;
    await prisma.siteConfig.upsert({
      where: { id: 'jwt_secret' },
      create: { id: 'jwt_secret', data: generated },
      update: { data: generated },
    });
  } catch { /* DB not available — secret will not persist across restarts */ }

  _jwtSecret = generated;
  console.error('❌ ORDER_ACCESS_SECRET not set. Generated a stable secret stored in DB. Set ORDER_ACCESS_SECRET in env for full control.');
  return _jwtSecret;
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  try {
    const secret = await getJwtSecret();
    const payload = jwt.verify(auth.slice(7), secret) as { email: string; name: string };
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

app.post('/api/auth/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const prisma = (await import('../server/lib/database')).default;
    const { name, email, password } = req.body;
    if (!name || !email || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false, error: 'Name, valid email, and password (min 8 chars, uppercase, lowercase, digit) required' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ success: false, error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, password: hashed, role: 'customer' },
    });
    const secret = await getJwtSecret();
    const token = jwt.sign({ email: user.email, name: user.name }, secret, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const prisma = (await import('../server/lib/database')).default;
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const hash = user?.password ?? DUMMY_BCRYPT_HASH;
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) return res.status(401).json({ success: false, error: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ success: false, error: 'Account is disabled. Contact support.' });

    const secret = await getJwtSecret();
    const token = jwt.sign({ email: user.email, name: user.name }, secret, { expiresIn: '7d' });
    res.json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Login failed' });
  }
});

app.get('/api/auth/me', authLimiter, authMiddleware, async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ success: true, user: { name: user.name, email: user.email } });
});

// --- MOUNT ROUTES ---
app.use('/api', async (req: Request, res: Response, next) => {
  try {
    const [{ default: commerceRoutes }] = await Promise.all([
      import('../server/routes/commerce'),
    ]);
    // commerceRoutes internally mounts publicRoutes and webhookRoutes
    return commerceRoutes(req, res, next);
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
