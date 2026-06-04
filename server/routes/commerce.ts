import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

type MulterRequest = Request & { file?: Express.Multer.File };
import nodemailer from 'nodemailer';
import prisma from '../lib/database';
import {
  getOrderByOrderId,
  getOrdersByEmail,
  isDatabaseConfigured,
  persistOrder,
  type CreateOrderPayload,
} from '../lib/orders';
import paymentsRoutes from './payments';
import adminRoutes from './admin';
import publicRoutes from './public';
import webhookRoutes from './webhooks';
import { requireOrderEmailMatch, type RequestWithOrderAccess } from '../lib/order-access';

const router = Router();

router.use(publicRoutes);
router.use(webhookRoutes);
router.use(paymentsRoutes);
router.use(adminRoutes);

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'custom-lab');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.stl', '.obj', '.step', '.stp'].includes(ext)) cb(null, true);
    else cb(new Error('Only .stl, .obj, .step files are allowed'));
  },
});

function dbUnavailable(res: Response) {
  return res.status(503).json({
    success: false,
    error: 'Database not configured. Set DATABASE_URL in .env.local and run: npx prisma db push',
  });
}

router.post('/orders', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    const body = req.body as CreateOrderPayload;
    if (!body?.id || !body.items?.length || !body.shippingAddress?.email) {
      return res.status(400).json({ success: false, error: 'Invalid order payload' });
    }

    const order = await persistOrder(body);
    res.status(201).json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save order';
    console.error('POST /api/orders:', error);
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/orders', requireOrderEmailMatch, async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const email =
    (req as RequestWithOrderAccess).orderAccessEmail ||
    String(req.query.email ?? '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ success: false, error: 'Query parameter email is required' });
  }

  try {
    const orders = await getOrdersByEmail(email);
    res.json({ success: true, orders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load orders';
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/orders/:orderId', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  try {
    const order = await getOrderByOrderId(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load order';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/newsletter/subscribe', async (req: Request, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const email = String(req.body?.email ?? '')
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Valid email is required' });
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email },
      update: {},
    });
    res.json({
      success: true,
      message: 'Subscribed! Use coupon NEWSLETTER15 on your first order.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Subscribe failed';
    res.status(500).json({ success: false, error: message });
  }
});

router.post('/custom-requests', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();
  });
}, async (req: MulterRequest, res: Response) => {
  if (!isDatabaseConfigured()) return dbUnavailable(res);

  const name = String(req.body?.name ?? '').trim();
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const details = String(req.body?.details ?? '').trim();

  if (!name || !email || !details) {
    return res.status(400).json({ success: false, error: 'name, email, and details are required' });
  }

  const requestId = `LB-CUSTOM-${Date.now().toString(36).toUpperCase()}`;
  const file = req.file;

  try {
    const record = await prisma.customLabRequest.create({
      data: {
        requestId,
        name,
        email,
        details,
        fileName: file?.originalname,
        filePath: file?.path,
      },
    });

    const ownerEmail = process.env.STORE_OWNER_EMAIL || process.env.EMAIL_USER;
    if (ownerEmail && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_HOST ? undefined : 'gmail',
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
        auth: {
          user: process.env.EMAIL_USER,
          pass: (process.env.EMAIL_PASSWORD ?? '').replace(/\s/g, ''),
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: ownerEmail,
        replyTo: email,
        subject: `[3D by SD Custom Lab] ${requestId}`,
        text: `New custom request from ${name} (${email})\n\n${details}\n\nFile: ${file?.originalname ?? 'none'}`,
        attachments: file
          ? [{ filename: file.originalname, path: file.path }]
          : undefined,
      });
    }

    res.status(201).json({
      success: true,
      requestId: record.requestId,
      message: `Request ${requestId} received. We will email you within 1–2 business days.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit request';
    console.error('POST /api/custom-requests:', error);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;