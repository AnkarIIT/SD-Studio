import { useState, useMemo } from 'react';
import { Product } from '../types';
import { BEST_SELLER_TABS } from '../shopContent';
import ProductCard from './ProductCard';

interface BestSellersProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onOpenDetail: (p: Product) => void;
}

export default function BestSellers({ products, onAddToCart, onOpenDetail }: BestSellersProps) {
  const [tab, setTab] = useState<string>('all');

  const filtered = useMemo(() => {
    if (tab === 'new') {
      const flagged = products.filter((p) => p.isNew);
      if (flagged.length >= 4) return flagged.slice(0, 12);
      return [...products]
        .sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate || Number(b.id) - Number(a.id);
        })
        .slice(0, 12);
    }
    const sorted = [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (tab === 'all') return sorted.slice(0, 12);
    return sorted.filter((p) => p.category === tab).slice(0, 12);
  }, [products, tab]);

  return (
    <section className="py-12 md:py-16 do-section-alt">
      <div className="do-container">
        <div className="do-section-header">
          <h2 className="do-section-title">Featured</h2>
          <a href="#catalog" className="do-link">
            View all
          </a>
        </div>

        <div className="flex gap-8 md:gap-12 border-b border-[#e8e8e8] dark:border-zinc-800 mb-8 md:mb-10 overflow-x-auto scrollbar-hide">
          {BEST_SELLER_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-[#111] dark:border-white text-[#111] dark:text-white'
                  : 'border-transparent text-[#6b6b6b] dark:text-zinc-500 hover:text-[#111] dark:hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
          {filtered.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[min(100%,190px)] sm:w-[220px] md:w-[240px] snap-start">
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onOpenDetail={onOpenDetail}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}