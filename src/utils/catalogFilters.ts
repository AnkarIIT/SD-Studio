import { Product } from '../types';

/** Collection titles from shopContent — must match product.collection or special rules */
export function productMatchesCollection(product: Product, collectionTitle: string): boolean {
  if (!collectionTitle) return true;
  if (collectionTitle === 'Gift Picks') {
    return (product.rating ?? 0) >= 4.6;
  }
  return product.collection === collectionTitle;
}