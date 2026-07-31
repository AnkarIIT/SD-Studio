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

const IMG = (seed: string, w = 800) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${w}`;

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
  if (disc == null) return { price: base, originalPrice: null as number | null };
  return {
    price: Math.min(base, disc),
    originalPrice: Math.max(base, disc),
  };
}

function buildProductFromDb(row: { id: string; name: string; slug: string; description: string | null; category: string; base_price: any; discounted_price: any; is_on_sale: boolean; is_new: boolean; is_bestseller: boolean }): Product {
  const { price, originalPrice } = resolveDbPrice(row);
  const category = mapCategory(row.category);
  const badge = row.is_new ? 'New' : row.is_bestseller ? 'Bestseller' : undefined;
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price,
    ...(originalPrice != null ? { originalPrice } : {}),
    category,
    image: IMG(row.slug || row.name),
    stock: 10,
    inStock: true,
    rating: 4.5,
    reviews: 0,
    madeToOrder: true,
    productionTime: 'Ships within 3-5 days',
    durabilityRating: 'moderate-use',
    badge,
    collection: `${category} Collection`,
    isNew: row.is_new,
    specs: {
      material: 'PLA',
      dimensions: 'Varies by design',
      printTime: 'Varies by size',
      infill: '20%',
      layerHeight: '0.2mm',
      supportRequired: true,
    },
  };
}

export async function getCatalogProducts(): Promise<Product[]> {
  const [overrides, dbProducts] = await Promise.all([
    prisma.productOverride.findMany(),
    prisma.product.findMany().catch(() => []),
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
      matchedDbIds.add(dbRow.id);
      const { price, originalPrice } = resolveDbPrice(dbRow);
      merged.push({
        ...staticProduct,
        id: dbRow.id,
        price,
        ...(originalPrice != null ? { originalPrice } : {}),
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
    merged.push(buildProductFromDb(row));
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