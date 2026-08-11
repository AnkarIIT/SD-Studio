import { PRODUCTS } from '../../src/constants';
import type { Product } from '../../src/types';
import prisma from './database';

export type ProductOverrideInput = {
  price?: number;
  originalPrice?: number;
  stock?: number;
  inStock?: boolean;
  hidden?: boolean;
  badge?: string;
};

function applyOverride(product: Product, o?: { price: any; originalPrice: any; stock: number | null; inStock: boolean | null; hidden: boolean; badge: string | null }) {
  if (!o) return product;
  return {
    ...product,
    ...(o.price != null && { price: Number(o.price) }),
    ...(o.originalPrice != null && { originalPrice: Number(o.originalPrice) }),
    ...(o.stock != null && { stock: o.stock }),
    ...(o.inStock != null && { inStock: o.inStock }),
    ...(o.badge != null && { badge: o.badge }),
  };
}

const CATEGORY_MAP: Record<string, Product['category']> = {
  TOYS: 'Toys',
  ACCESSORIES: 'Accessories',
  HOME_DECOR: 'Home Decor',
  HOME_DECORATION: 'Home Decor',
  COSTUMES: 'Costumes',
  WALL_ART: 'Art',
  ART: 'Art',
  LIGHTING: 'Lighting',
  TECH: 'Tech',
};

function mapCategory(category: string): Product['category'] {
  return CATEGORY_MAP[category.trim().toUpperCase()] || 'Home Decor';
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\u2122/g, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function resolveDbPrice(row: { base_price: any; discounted_price: any }) {
  const base = Number(row.base_price);
  const disc = row.discounted_price != null ? Number(row.discounted_price) : null;
  if (disc == null || disc <= 0) return { price: base, originalPrice: null as number | null };
  return {
    price: Math.min(base, disc),
    originalPrice: Math.max(base, disc),
  };
}

function imageProxyUrl(id: string, origin?: string): string {
  const base = origin ? origin.replace(/\/+$/, '') : '';
  return `${base}/api/products/${id}/image`;
}

function dbVideoUrl(row: { video_url: string | null | undefined }): string | undefined {
  if (typeof row.video_url !== 'string' || !row.video_url.trim()) return undefined;
  return row.video_url.trim();
}

const HIDDEN_STATUSES = new Set(['inactive', 'draft', 'archived', 'hidden', 'unlisted', 'deleted', 'disabled', 'out of stock']);

function isHiddenStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return HIDDEN_STATUSES.has(status.trim().toLowerCase());
}

function dbStock(row: { stock: number | null }): number | null {
  const s = row.stock != null ? Number(row.stock) : null;
  return s != null && s > 0 ? s : null;
}

type DbSpecsResult = {
  specs?: Product['specs'];
  productionTime?: string;
  durabilityRating?: Product['durabilityRating'];
  madeToOrder?: boolean;
};

function specsFromDb(row: { specifications: any }): DbSpecsResult | null {
  if (!row.specifications || typeof row.specifications !== 'object') return null;
  const s = row.specifications as Record<string, unknown>;
  const getStr = (...keys: string[]) => {
    for (const k of keys) {
      const v = s[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return undefined;
  };
  const out: DbSpecsResult = {
    specs: {
      material: getStr('material') || 'PLA',
      dimensions: getStr('dimensions') || 'Varies by design',
      printTime: getStr('printTime', 'print_time') || 'Varies by size',
      infill: getStr('infill') || '20%',
      layerHeight: getStr('layerHeight', 'layer_height') || '0.2mm',
      supportRequired: typeof s.supportRequired === 'boolean'
        ? s.supportRequired
        : typeof s.support_required === 'boolean' ? s.support_required : true,
    },
  };
  const productionTime = getStr('productionTime', 'production_time');
  if (productionTime) out.productionTime = productionTime;
  const durability = getStr('durabilityRating', 'durability');
  if (durability) out.durabilityRating = durability as Product['durabilityRating'];
  const madeToOrder = s.madeToOrder ?? s.made_to_order;
  if (typeof madeToOrder === 'boolean') out.madeToOrder = madeToOrder;
  return out;
}

const DEFAULT_DB_SPECS: Product['specs'] = {
  material: 'PLA',
  dimensions: 'Varies by design',
  printTime: 'Varies by size',
  infill: '20%',
  layerHeight: '0.2mm',
  supportRequired: true,
};

function dbSpecifications(row: { specifications: any }): Product['specifications'] | undefined {
  if (!row.specifications || typeof row.specifications !== 'object' || Array.isArray(row.specifications)) {
    return undefined;
  }
  return row.specifications as Product['specifications'];
}

function buildProductFromDb(row: { id: string; name: string; slug: string; description: string | null; category: string; base_price: any; discounted_price: any; is_on_sale: boolean; is_new: boolean; is_bestseller: boolean; video_url: string | null; specifications: any; stock: number | null }, origin?: string): Product {
  const { price, originalPrice } = resolveDbPrice(row);
  const category = mapCategory(row.category);
  const badge = row.is_new ? 'New' : row.is_bestseller ? 'Bestseller' : undefined;
  const videoUrl = dbVideoUrl(row);
  const dbSpecs = specsFromDb(row);
  const specifications = dbSpecifications(row);
  const stock = dbStock(row);
  const image = imageProxyUrl(row.id, origin);
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price,
    ...(originalPrice != null ? { originalPrice } : {}),
    category,
    image,
    images: [image],
    ...(videoUrl ? { videoUrl } : {}),
    ...(specifications ? { specifications } : {}),
    ...(stock != null ? { stock } : { stock: 10 }),
    inStock: true,
    rating: 4.5,
    reviews: 0,
    ...(dbSpecs?.madeToOrder != null ? { madeToOrder: dbSpecs.madeToOrder } : { madeToOrder: true }),
    ...(dbSpecs?.productionTime != null ? { productionTime: dbSpecs.productionTime } : { productionTime: 'Ships within 3-5 days' }),
    ...(dbSpecs?.durabilityRating != null ? { durabilityRating: dbSpecs.durabilityRating } : { durabilityRating: 'moderate-use' }),
    badge,
    collection: `${category} Collection`,
    isNew: row.is_new,
    specs: dbSpecs?.specs || DEFAULT_DB_SPECS,
  };
}

export async function getCatalogProducts(origin?: string): Promise<Product[]> {
  const [overrides, dbProducts] = await Promise.all([
    prisma.productOverride.findMany(),
    // images holds base64 blobs (MBs per product). Omit it here so the catalog
    // read stays fast; images are served via /api/products/:id/image instead.
    prisma.product.findMany({ omit: { images: true } }).catch(() => []),
  ]);
  const overrideMap = new Map(overrides.map((o) => [o.productId, o]));

  if (!dbProducts.length) {
    return PRODUCTS.map((product) => applyOverride(product, overrideMap.get(product.id)))
      .filter((p) => !overrideMap.get(p.id)?.hidden);
  }

  const dbByName = new Map<string, (typeof dbProducts)[number]>();
  for (const row of dbProducts) {
    dbByName.set(normalizeName(row.name), row);
  }

  const merged: Product[] = [];
  const effectiveOverride = new Map<string, (typeof overrides)[number]>();
  const matchedDbIds = new Set<string>();

  for (const staticProduct of PRODUCTS) {
    const dbRow = dbByName.get(normalizeName(staticProduct.name));
    if (dbRow) {
      if (isHiddenStatus(dbRow.status)) continue;
      matchedDbIds.add(dbRow.id);
      const { price, originalPrice } = resolveDbPrice(dbRow);
      const videoUrl = dbVideoUrl(dbRow);
      const dbSpecs = specsFromDb(dbRow);
      const specifications = dbSpecifications(dbRow);
      const stock = dbStock(dbRow);
      const image = imageProxyUrl(dbRow.id, origin);
      merged.push({
        ...staticProduct,
        id: dbRow.id,
        price,
        ...(originalPrice != null ? { originalPrice } : {}),
        image,
        images: [image],
        ...(videoUrl ? { videoUrl } : {}),
        ...(specifications ? { specifications } : {}),
        ...(stock != null ? { stock } : {}),
        ...(dbSpecs?.specs ? { specs: dbSpecs.specs } : {}),
        ...(dbSpecs?.productionTime ? { productionTime: dbSpecs.productionTime } : {}),
        ...(dbSpecs?.durabilityRating ? { durabilityRating: dbSpecs.durabilityRating } : {}),
        ...(dbSpecs?.madeToOrder != null ? { madeToOrder: dbSpecs.madeToOrder } : {}),
        isNew: dbRow.is_new,
      });
      effectiveOverride.set(dbRow.id, overrideMap.get(staticProduct.id) || overrideMap.get(dbRow.id));
    } else {
      merged.push(staticProduct);
      effectiveOverride.set(staticProduct.id, overrideMap.get(staticProduct.id));
    }
  }

  for (const row of dbProducts) {
    if (matchedDbIds.has(row.id)) continue;
    if (isHiddenStatus(row.status)) continue;
    merged.push(buildProductFromDb(row, origin));
    effectiveOverride.set(row.id, overrideMap.get(row.id));
  }

  return merged
    .map((product) => applyOverride(product, effectiveOverride.get(product.id)))
    .filter((p) => !effectiveOverride.get(p.id)?.hidden);
}

export async function upsertProductOverride(productId: string, input: ProductOverrideInput) {
  return prisma.productOverride.upsert({
    where: { productId },
    create: { productId, ...input },
    update: { ...input },
  });
}

export async function getProductOverrides() {
  return prisma.productOverride.findMany({ orderBy: { productId: 'asc' } });
}

export async function getCouponDiscount(subtotal: number, couponCode: string): Promise<number> {
  try {
    const { getSiteConfig, couponDiscount } = await import('./site-config');
    const config = await getSiteConfig();
    const coupon = config.coupons?.[couponCode];
    if (!coupon) return 0;
    return Math.round(couponDiscount(coupon, subtotal) * 100) / 100;
  } catch {
    return 0;
  }
}