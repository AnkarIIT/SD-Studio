import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { type MouseEvent } from 'react';
import { Product } from '../types';
import { useWishlistStore } from '../utils/store';
import ShopProductCard from './ShopProductCard';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onOpenDetail: (p: Product) => void;
  key?: string | number;
}

export default function ProductCard({ product, onAddToCart, onOpenDetail }: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) removeItem(product.id);
    else addItem(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="relative group"
    >
      <button
        type="button"
        onClick={handleWishlistClick}
        className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center transition-colors ${
          inWishlist
            ? 'bg-[#111] dark:bg-white text-white dark:text-[#111]'
            : 'bg-white/90 dark:bg-zinc-900/90 text-[#111] dark:text-zinc-200 opacity-0 group-hover:opacity-100 hover:bg-[#111] hover:text-white dark:hover:bg-white dark:hover:text-[#111]'
        }`}
        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
      </button>
      <ShopProductCard
        product={product}
        onAddToCart={onAddToCart}
        onOpenDetail={onOpenDetail}
      />
    </motion.div>
  );
}