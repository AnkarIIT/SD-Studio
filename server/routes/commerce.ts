import { Router, type Request, type Response } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import multer from 'multer';

type MulterRequest = Request & { file?: Express.Multer.File };
import prisma from '../lib/database';
import {
  getOrderByOrderId,
  getOrdersByEmail,
  isDatabaseConfigured,
  persistOrder,
  type CreateOrderPayload,
} from '../lib/orders';
import publicRoutes from './public';
import webhookRoutes from './webhooks';
import { requireOrderEmailMatch, type RequestWithOrderAccess } from '../lib/order-access';

const router = Router();

router.use(publicRoutes);
router.use(webhookRoutes);

const UPLOAD_ROOT = process.env.VERCEL ? os.tmpdir() : process.cwd();
const UPLOAD_DIR = path.join(UPLOAD_ROOT, 'uploads', 'custom-lab');
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
    error: 'Database not configured.',
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
      message: 'Subscribed!',
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
    await prisma.customLabRequest.create({
      data: {
        requestId,
        name,
        email,
        details,
        fileName: file?.originalname,
        filePath: file?.path,
      },
    });

    res.status(201).json({
      success: true,
      requestId,
      message: `Request ${requestId} received.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit request';
    console.error('POST /api/custom-requests:', error);
    res.status(500).json({ success: false, error: message });
  }
});

export default router;
