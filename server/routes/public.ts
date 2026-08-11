import { Router, type Request, type Response } from 'express';
import { isDatabaseConfigured } from '../lib/orders';
import { getSiteConfig } from '../lib/site-config';
import { getCatalogProducts } from '../lib/catalog';
import prisma from '../lib/database';
import { PRODUCTS } from '../../src/constants';

const router = Router();

// Edge-cache these public read endpoints on Vercel's CDN. A short s-maxage keeps
// admin edits visible within ~30s while stale-while-revalidate serves instantly
// to repeat visitors (revalidating in the background).
const PUBLIC_CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=60';

function requestOrigin(req: Request): string {
  const proto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim() || req.protocol || 'http';
  const host = req.headers['host'];
  return host ? `${proto}://${host}` : '';
}

router.get('/site/config', async (_req: Request, res: Response) => {
  res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
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

router.get('/products', async (req: Request, res: Response) => {
  res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
  try {
    if (!(await isDatabaseConfigured())) {
      return res.json({ success: true, products: PRODUCTS, source: 'static' });
    }
    const products = await getCatalogProducts(requestOrigin(req));
    res.json({ success: true, products, source: 'database' });
  } catch {
    res.json({ success: true, products: PRODUCTS, source: 'static' });
  }
});

// Serves product images from the DB (stored as base64 data-URIs) so the catalog
// payload stays small. Cached at the CDN for 10 minutes.
router.get('/products/:id/image', async (req: Request, res: Response) => {
  const IMAGE_CACHE_CONTROL = 'public, s-maxage=600, stale-while-revalidate=86400';
  try {
    const row = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { name: true, slug: true, images: true },
    });
    if (!row) return res.status(404).end();

    const images = Array.isArray(row.images) ? row.images : [];

    const dataUri = images.find((i): i is string => typeof i === 'string' && i.startsWith('data:'));
    if (dataUri) {
      const comma = dataUri.indexOf(',');
      if (comma > 0) {
        const contentType = dataUri.slice(5, comma).split(';')[0] || 'image/png';
        const buf = Buffer.from(dataUri.slice(comma + 1), 'base64');
        res.set('Cache-Control', IMAGE_CACHE_CONTROL);
        res.set('Content-Type', contentType);
        res.set('Content-Length', String(buf.length));
        return res.send(buf);
      }
    }

    const url = images.find((i): i is string => typeof i === 'string' && /^https?:\/\//i.test(i));
    if (url) {
      res.set('Cache-Control', IMAGE_CACHE_CONTROL);
      return res.redirect(302, url);
    }

    res.set('Cache-Control', IMAGE_CACHE_CONTROL);
    return res.redirect(
      302,
      `https://picsum.photos/seed/${encodeURIComponent(row.slug || row.name || req.params.id)}/800/800`,
    );
  } catch {
    res.status(404).end();
  }
});

export default router;