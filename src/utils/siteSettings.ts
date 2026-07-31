import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HERO_SLIDES } from '../shopContent';
import type { CouponEntry } from './commerce';

export type HeroSlide = (typeof HERO_SLIDES)[number];

export interface SiteSettings {
  promoBarText: string;
  trustItems: string[];
  maintenanceMode: boolean;
  codEnabled: boolean;
  customLabEnabled: boolean;
  newsletterEnabled: boolean;
  freeShippingThreshold: number;
  heroSlides: HeroSlide[];
  coupons?: Record<string, CouponEntry>;
}

const DEFAULT_SETTINGS: SiteSettings = {
  promoBarText: 'Welcome to 3DbySD · Free shipping on orders above ₹999',
  trustItems: [
    'Custom made just for you',
    'Secure payments · 100% safe & secure',
    'Fast delivery · Pan India shipping',
  ],
  maintenanceMode: false,
  codEnabled: true,
  customLabEnabled: true,
  newsletterEnabled: true,
  freeShippingThreshold: 5000,
  heroSlides: [...HERO_SLIDES],
  coupons: {
    SD_FIRST_10: { label: 'First order discount', percent: 10 },
    SD_LAB15: { label: 'Lab community discount', percent: 15 },
    NEWSLETTER15: { label: 'Newsletter signup discount', percent: 15 },
  },
};

interface SiteSettingsStore extends SiteSettings {
  update: (patch: Partial<SiteSettings>) => void;
  reset: () => void;
}

export const useSiteSettings = create<SiteSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set((state) => ({ ...state, ...patch })),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    { name: 'sd-site-settings' }
  )
);

export function getDefaultSiteSettings(): SiteSettings {
  return { ...DEFAULT_SETTINGS, heroSlides: [...HERO_SLIDES] };
}