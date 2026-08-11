import { useEffect, useState } from 'react';
import type { Product } from '../types';
import { fetchProductsFromServer } from '../utils/catalogApi';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'local' | 'server'>('local');

  useEffect(() => {
    fetchProductsFromServer()
      .then(({ products: list, source: src }) => {
        setProducts(list);
        setSource(src);
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    return fetchProductsFromServer(true)
      .then(({ products: list, source: src }) => {
        setProducts(list);
        setSource(src);
      })
      .finally(() => setLoading(false));
  };

  return { products, loading, source, refresh };
}