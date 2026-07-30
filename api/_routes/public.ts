import { Router, type Request, type Response } from 'express';
import { isDatabaseConfigured } from '../_lib/orders';
import { getSiteConfig } from '../_lib/site-config';
import { getCatalogProducts } from '../_lib/catalog';
import { PRODUCTS } from '../../src/constants';

const router = Router();

router.get('/site/config', async (_req: Request, res: Response) => {
  if (!(await isDatabaseConfigured())) {
    return res.json({ success: true, config: null, source: 'defaults' });
  }
  try {
    const config = await getSiteConfig();
    res.json({ success: true, config, source: 'database' });
  } catch {
    res.json({ success: true, config: null, source: 'defaults' });
  }
});

router.get('/products', async (_req: Request, res: Response) => {
  try {
    if (!(await isDatabaseConfigured())) {
      return res.json({ success: true, products: PRODUCTS, source: 'static' });
    }
    const products = await getCatalogProducts();
    res.json({ success: true, products, source: 'database' });
  } catch {
    res.json({ success: true, products: PRODUCTS, source: 'static' });
  }
});

export default router;
