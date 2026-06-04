import { motion } from 'motion/react';
import { ArrowRight, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, calculateDiscount } from '../utils/formatting';

interface FeaturedStripProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onOpenDetail: (p: Product) => void;
}

export default function FeaturedStrip({ products, onAddToCart, onOpenDetail }: FeaturedStripProps) {
  const featured = [...products]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 4);

  return (
    <section className="py-12 bg-white dark:bg-zinc-950 border-y border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">
              Best Sellers
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Popular right now
            </h2>
          </div>
          <a
            href="#catalog"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors"
          >
            View full catalog
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
          {featured.map((product, i) => {
            const discount = product.originalPrice
              ? calculateDiscount(product.originalPrice, product.price)
              : 0;
            const canPurchase = product.stock !== 0 && product.inStock !== false;

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="snap-start flex-shrink-0 w-[min(100%,280px)] sm:w-[260px] bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <button
                  type="button"
                  onClick={() => onOpenDetail(product)}
                  className="w-full text-left"
                >
                  <div className="aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                      {product.category}
                    </p>
                    <h3 className="font-black text-sm uppercase tracking-wide text-zinc-900 dark:text-zinc-100 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.rating && (
                      <div className="flex items-center gap-1 text-[10px] text-yellow-500 mb-2">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="font-bold text-zinc-600 dark:text-zinc-400">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                    )}
                    <p className="text-lg font-serif font-black italic text-primary">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </button>
                <div className="px-4 pb-4 -mt-1">
                  <button
                    type="button"
                    disabled={!canPurchase}
                    onClick={() => onAddToCart(product)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors disabled:opacity-40"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to bag
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}