import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HERO_SLIDES } from '../shopContent';

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
  coupons?: Record<string, { label: string; percent: number }>;
}

const DEFAULT_SETTINGS: SiteSettings = {
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
  heroSlides: [...HERO_SLIDES],
  coupons: {
    LB_FIRST_10: { label: 'First order discount', percent: 10 },
    LAB15: { label: 'Lab community discount', percent: 15 },
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
    { name: 'lb-site-settings' }
  )
);

export function getDefaultSiteSettings(): SiteSettings {
  return { ...DEFAULT_SETTINGS, heroSlides: [...HERO_SLIDES] };
}