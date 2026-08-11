import type { Product } from '../types';
import type { SiteSettings } from './siteSettings';
import { PRODUCTS } from '../constants';
import { getDefaultSiteSettings } from './siteSettings';
import { fetchJSON } from './fetchJSON';

const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

// Short-lived in-memory cache so the whole catalog is fetched at most once per
// page session (Storefront -> ProductPage navigation reuses the result instead
// of hitting the API again). Cache-Control on the server already edge-caches
// these endpoints, so a short TTL here adds no observable staleness.
const CACHE_TTL_MS = 30_000;

let productsCache: {
  promise: Promise<{ products: Product[]; source: 'local' | 'server' }>;
  at: number;
} | null = null;

export async function fetchProductsFromServer(force = false): Promise<{
  products: Product[];
  source: 'local' | 'server';
}> {
  if (!force && productsCache && Date.now() - productsCache.at < CACHE_TTL_MS) {
    return productsCache.promise;
  }
  const promise = (async () => {
    try {
      const data = await fetchJSON<{ success: boolean; products: Product[] }>(
        `${API_BASE}/api/products`,
      );
      if (!data.success || !Array.isArray(data.products)) {
        return { products: PRODUCTS, source: 'local' as const };
      }
      return { products: data.products, source: 'server' as const };
    } catch {
      return { products: PRODUCTS, source: 'local' as const };
    }
  })();
  productsCache = { promise, at: Date.now() };
  return promise;
}

export async function fetchSiteConfigFromServer(force = false): Promise<{
  config: SiteSettings | null;
  source: string;
}> {
  if (!force && configCache && Date.now() - configCache.at < CACHE_TTL_MS) {
    return configCache.promise;
  }
  const promise = (async () => {
    try {
      const data = await fetchJSON<{ success: boolean; config: SiteSettings | null; source: string }>(
        `${API_BASE}/api/site/config`,
      );
      if (!data.config) {
        return { config: null, source: 'local' };
      }
      return { config: data.config, source: data.source ?? 'database' };
    } catch {
      return { config: null, source: 'local' };
    }
  })();
  configCache = { promise, at: Date.now() };
  return promise;
}

let configCache: {
  promise: Promise<{ config: SiteSettings | null; source: string }>;
  at: number;
} | null = null;

export function getLocalFallbackConfig(): SiteSettings {
  return getDefaultSiteSettings();
}
