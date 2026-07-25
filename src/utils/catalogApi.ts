import type { Product } from '../types';
import type { SiteSettings } from './siteSettings';
import { PRODUCTS } from '../constants';
import { getDefaultSiteSettings } from './siteSettings';

const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

export async function fetchSiteConfigFromServer(): Promise<{
  config: SiteSettings | null;
  source: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/site/config`);
    const data = await res.json();
    if (!res.ok || !data.config) {
      return { config: null, source: 'local' };
    }
    return { config: data.config as SiteSettings, source: data.source ?? 'database' };
  } catch {
    return { config: null, source: 'local' };
  }
}

export async function fetchProductsFromServer(): Promise<{
  products: Product[];
  source: 'local' | 'server';
}> {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    const data = await res.json();
    if (!res.ok || !data.success || !Array.isArray(data.products)) {
      return { products: PRODUCTS, source: 'local' };
    }
    return { products: data.products as Product[], source: 'server' };
  } catch {
    return { products: PRODUCTS, source: 'local' };
  }
}

export function getLocalFallbackConfig(): SiteSettings {
  return getDefaultSiteSettings();
}