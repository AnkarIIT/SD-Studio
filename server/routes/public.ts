import { Router, type Request, type Response } from 'express';
import { isDatabaseConfigured } from '../lib/orders';
import { getSiteConfig } from '../lib/site-config';
import { getCatalogProducts } from '../lib/catalog';

const router = Router();

router.get('/site/config', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) {
    return res.json({ success: true, config: null, source: 'defaults' });
  }
  try {
    const config = await getSiteConfig();
    res.json({ success: true, config, source: 'database' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load config';
    res.status(500).json({ success: false, error: message });
  }
});

router.get('/products', async (_req: Request, res: Response) => {
  if (!isDatabaseConfigured()) {
    return res.status(503).json({ success: false, error: 'Database not configured' });
  }
  try {
    const products = await getCatalogProducts();
    res.json({ success: true, products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load products';
    res.status(500).json({ success: false, error: message });
  }
});

export default router;