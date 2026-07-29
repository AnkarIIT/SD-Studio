import type { Product } from '../types';
import type { SiteSettings } from './siteSettings';
import { PRODUCTS } from '../constants';
import { getDefaultSiteSettings } from './siteSettings';
import { fetchJSON } from './fetchJSON';

const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

export async function fetchSiteConfigFromServer(): Promise<{
  config: SiteSettings | null;
  source: string;
}> {
  try {
    const data = await fetchJSON<{ success: boolean; config: SiteSettings | null; source: string }>(`${API_BASE}/api/site/config`);
    if (!data.config) {
      return { config: null, source: 'local' };
    }
    return { config: data.config, source: data.source ?? 'database' };
  } catch {
    return { config: null, source: 'local' };
  }
}

export async function fetchProductsFromServer(): Promise<{
  products: Product[];
  source: 'local' | 'server';
}> {
  try {
    const data = await fetchJSON<{ success: boolean; products: Product[] }>(`${API_BASE}/api/products`);
    if (!data.success || !Array.isArray(data.products)) {
      return { products: PRODUCTS, source: 'local' };
    }
    return { products: data.products, source: 'server' };
  } catch {
    return { products: PRODUCTS, source: 'local' };
  }
}

export function getLocalFallbackConfig(): SiteSettings {
  return getDefaultSiteSettings();
}