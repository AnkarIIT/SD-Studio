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
  promoBarText: 'Free shipping above ₹5,000 · UPI · Card demo · COD · Pan-India',
  trustItems: [
    'Free shipping on orders above ₹5,000',
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
    {
      id: 'free-ship',
      image: '/categories/collectibles.jpg',
      imageAlt: 'Collectible 3D print',
      title: 'Free shipping over ₹5,000',
      subtitle: 'UPI · Card demo · Bank transfer · COD',
      cta: 'View catalog',
      href: '#catalog',
    },
  ],
  coupons: {
    LB_FIRST_10: { label: 'First order discount', percent: 10 },
    LAB15: { label: 'Lab community discount', percent: 15 },
    NEWSLETTER15: { label: 'Newsletter signup discount', percent: 15 },
  },
};

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