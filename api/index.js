import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import './_lib/env.js';

import prisma from './_lib/database.js';
import { createCashfreeOrder, verifyCashfreePayment } from './_lib/cashfree.js';
import { persistOrder, computeServerAmount, getOrderByOrderId, isDatabaseConfigured } from './_lib/orders.js';
import { getCatalogProducts, getCouponDiscount } from './_lib/catalog.js';
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayConfigured, verifyRazorpaySignature } from './_lib/razorpay.js';
import { enqueuePaymentVerification } from './_lib/payment-queue.js';
import { getOrderTimeline } from './_lib/timeline.js';
import { getOrderAccessEmailFromRequest } from './_lib/order-access.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import commerceRoutes from './_lib/commerce.js';

const app = express();

const ALLOWED_ORIGINS = (() => {
  const origins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'http://localhost:5001', 'https://sd-studio-two.vercel.app'];
  if (process.env.VERCEL) {
    if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
  }
  return origins;
})();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true);
    else cb(null, false);
  },
  credentials: true,
}));

app.use(bodyParser.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  },
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

app.use((err, _req, res, next) => {
  if (err) {
    console.error('SERVER ERROR:', err);
    return res.status(err.status || 500).json({
      success: false,
      error: 'Server Error',
      message: err?.message || 'Something went wrong',
    });
  }
  return next();
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
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

app.get('/api/debug/env', (req, res) => {
  res.json({
    vercel: !!process.env.VERCEL,
    dbSet: !!process.env.DATABASE_URL,
    cfAppIdSet: !!process.env.CASHFREE_APP_ID,
    cfSecretSet: !!process.env.CASHFREE_SECRET_KEY,
    nodeEnv: process.env.NODE_ENV,
  });
});

app.post('/api/payments/cashfree/order', paymentLimiter, async (req, res) => {
  try {
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
    if (error) return res.status(400).json({ success: false, error });
    res.json({ success: true, paymentSessionId: data.payment_session_id, orderId: data.order_id, cashfreeMode: mode });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || 'Payment order route failed' });
  }
});

app.post('/api/payments/cashfree/verify', paymentLimiter, async (req, res) => {
  try {
    const { orderId, items, shippingAddress, couponCode, paymentMethod } = req.body;
    const origin = req.headers.origin;
    const isPaid = await verifyCashfreePayment(orderId, origin);
    if (!isPaid) return res.status(400).json({ success: false, error: 'Payment not verified' });

    const catalog = await getCatalogProducts();
    const productMap = new Map(catalog.map(p => [p.id, p]));
    const cartItems = [];
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
      status: 'confirmed',
      paymentMethod: (paymentMethod || 'card'),
      shippingAddress, couponCode,
    };

    const order = await persistOrder(orderPayload);
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || 'Order persistence failed' });
  }
});

app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: 'pong', timestamp: new Date().toISOString() });
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const DUMMY_BCRYPT_HASH = '$2b$12$LJ3m4ys3Lk0TSwHlgntFou0N4F1k7tCBmGspMOFNYpSZqJk/Mn/pe';

let _jwtSecret = null;

async function getJwtSecret() {
  if (_jwtSecret) return _jwtSecret;
  const envSecret = process.env.ORDER_ACCESS_SECRET?.trim();
  if (envSecret) return (_jwtSecret = envSecret);

  try {
    const row = await prisma.siteConfig.findUnique({ where: { id: 'jwt_secret' } });
    if (row?.data) return (_jwtSecret = row.data);
  } catch { /* ignore */ }

  const generated = crypto.randomBytes(32).toString('hex');
  try {
    await prisma.siteConfig.upsert({
      where: { id: 'jwt_secret' },
      create: { id: 'jwt_secret', data: generated },
      update: { data: generated },
    });
  } catch { /* ignore */ }
  return (_jwtSecret = generated);
}

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false, error: 'Registration requirements not met' });
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
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const hash = user?.password ?? DUMMY_BCRYPT_HASH;
    const valid = await bcrypt.compare(password, hash);
    if (!user || !valid) return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const secret = await getJwtSecret();
    const token = jwt.sign({ email: user.email, name: user.name }, secret, { expiresIn: '7d' });
    res.json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || 'Login failed' });
  }
});

app.use('/api', commerceRoutes);

if (!process.env.VERCEL) {
  const port = Number(process.env.NOTIFICATION_PORT || 5001);
  app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}

export default app;
