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

export async function saveSiteConfigToServer(config: SiteSettings, adminKey: string) {
  const res = await fetch(`${API_BASE}/api/admin/site-config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
    },
    body: JSON.stringify(config),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Failed to save site config');
  return data.config as SiteSettings;
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

export async function updateProductOnServer(
  productId: string,
  patch: {
    price?: number;
    originalPrice?: number;
    stock?: number;
    inStock?: boolean;
    hidden?: boolean;
    badge?: string;
  },
  adminKey: string
) {
  const res = await fetch(`${API_BASE}/api/admin/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
    },
    body: JSON.stringify(patch),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Product update failed');
  return data.products as Product[];
}

export function getLocalFallbackConfig(): SiteSettings {
  return getDefaultSiteSettings();
}