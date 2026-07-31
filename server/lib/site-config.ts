import prisma from './database';

export type SiteConfigData = {
  promoBarText: string;
  trustItems: string[];
  maintenanceMode: boolean;
  codEnabled: boolean;
  customLabEnabled: boolean;
  newsletterEnabled: boolean;
  freeShippingThreshold: number;
  heroSlides: Array<{
    id: string;
    image: string;
    imageAlt?: string;
    title: string;
    subtitle: string;
    cta: string;
    href: string;
  }>;
  coupons?: Record<string, { label: string; percent: number }>;
};

export const DEFAULT_SITE_CONFIG: SiteConfigData = {
  promoBarText: 'Welcome to 3DbySD · Made to order in India',
  trustItems: [
    '7-day returns on defective prints',
    'Made to order · Ships in 1–7 days',
  ],
  maintenanceMode: false,
  codEnabled: true,
  customLabEnabled: true,
  newsletterEnabled: true,
  freeShippingThreshold: 5000,
  heroSlides: [
    {
      id: 'shop-prints',
      image: '/banners/shop-prints.jpg',
      imageAlt: '3D printer creating a decorative vase',
      title: 'Shop 3D printed objects',
      subtitle: 'Lamps, desk gear & collectibles — made to order in India',
      cta: 'Shop now',
      href: '#catalog',
    },
    {
      id: 'custom-lab',
      image: '/banners/custom-lab.jpg',
      imageAlt: 'Engineer operating a 3D printer',
      title: 'Upload your own design',
      subtitle: 'Custom Lab · FDM & resin · Ships in 1–7 days',
      cta: 'Custom Lab',
      href: '#custom-lab',
    },
  ],
  coupons: {
    SD_FIRST_10: { label: 'First order discount', percent: 10 },
    SD_LAB15: { label: 'Lab community discount', percent: 15 },
    NEWSLETTER15: { label: 'Newsletter signup discount', percent: 15 },
  },
};

export type StoredCoupon = {
  id?: string;
  code?: string;
  label?: string;
  type?: 'Percentage' | 'Fixed Amount';
  value?: number;
  percent?: number;
  minOrderValue?: number;
  expiryDate?: string;
  usageLimit?: number;
  timesUsed?: number;
  status?: string;
};

// Returns a human-readable reason the coupon cannot be used, or null if it can.
export function couponIssue(coupon: StoredCoupon | undefined, subtotal: number): string | null {
  if (!coupon) return 'Invalid coupon code';
  const status = coupon.status;
  if (status && status !== 'Active') return 'This coupon is no longer active';
  if (coupon.expiryDate) {
    const expiry = new Date(`${coupon.expiryDate}T23:59:59`);
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) {
      return 'This coupon has expired';
    }
  }
  const min = Number(coupon.minOrderValue) || 0;
  if (min > 0 && subtotal < min) {
    return `Minimum order of \u20B9${min} required`;
  }
  const limit = Number(coupon.usageLimit) || 0;
  const used = Number(coupon.timesUsed) || 0;
  if (limit > 0 && used >= limit) {
    return 'This coupon has reached its usage limit';
  }
  return null;
}

export function couponDiscount(coupon: StoredCoupon | undefined, subtotal: number): number {
  if (!coupon || couponIssue(coupon, subtotal)) return 0;
  if (coupon.type === 'Fixed Amount') {
    return Math.min(Number(coupon.value) || 0, subtotal);
  }
  const pct = Number(coupon.percent != null ? coupon.percent : coupon.value) || 0;
  return Math.round(subtotal * pct) / 100;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  try {
    const row = await prisma.siteConfig.findUnique({ where: { id: 'global' } });
    if (!row) return;
    const data = JSON.parse(row.data);
    const coupon = data?.coupons?.[code];
    if (!coupon) return;
    coupon.timesUsed = (Number(coupon.timesUsed) || 0) + 1;
    await prisma.siteConfig.update({
      where: { id: 'global' },
      data: { data: JSON.stringify(data) },
    });
  } catch {
    // best effort — never block an order on usage tracking
  }
}

export async function getSiteConfig(): Promise<SiteConfigData> {
  const row = await prisma.siteConfig.findUnique({ where: { id: 'global' } });
  if (!row) return { ...DEFAULT_SITE_CONFIG };
  try {
    return { ...DEFAULT_SITE_CONFIG, ...JSON.parse(row.data) };
  } catch {
    return { ...DEFAULT_SITE_CONFIG };
  }
}

export async function saveSiteConfig(data: SiteConfigData): Promise<SiteConfigData> {
  const merged = { ...DEFAULT_SITE_CONFIG, ...data };
  await prisma.siteConfig.upsert({
    where: { id: 'global' },
    create: { id: 'global', data: JSON.stringify(merged) },
    update: { data: JSON.stringify(merged) },
  });
  return merged;
}