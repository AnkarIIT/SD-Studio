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

export async function getCatalogProducts(): Promise<Product[]> {
  const overrides = await prisma.productOverride.findMany();
  const map = new Map(overrides.map((o) => [o.productId, o]));

  return PRODUCTS.map((product) => applyOverride(product, map.get(product.id)))
    .filter((p) => !map.get(p.id)?.hidden);
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
    const { getSiteConfig } = await import('./site-config');
    const config = await getSiteConfig();
    const coupon = config.coupons?.[couponCode];
    if (!coupon) return 0;
    return Math.round(subtotal * coupon.percent / 100 * 100) / 100;
  } catch {
    return 0;
  }
}