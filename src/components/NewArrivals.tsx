import { useMemo } from 'react';
import { Product } from '../types';
import ShopProductCard from './ShopProductCard';

interface NewArrivalsProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onOpenDetail: (p: Product) => void;
}

export default function NewArrivals({ products, onAddToCart, onOpenDetail }: NewArrivalsProps) {
  const arrivals = useMemo(() => {
    const flagged = products.filter((p) => p.isNew);
    if (flagged.length >= 4) return flagged.slice(0, 8);
    return [...products]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 8)
      .map((p) => ({ ...p, isNew: true }));
  }, [products]);

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-zinc-950">
      <div className="do-container">
        <div className="do-section-header">
          <h2 className="do-section-title">New arrivals</h2>
          <a href="#catalog" className="do-link">
            View all
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {arrivals.map((product) => (
            <ShopProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      </div>
    </section>
  );
}