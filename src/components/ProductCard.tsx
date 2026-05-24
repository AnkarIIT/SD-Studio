import { motion } from 'motion/react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { type MouseEvent } from 'react';
import { Product } from '../types';
import { formatPrice, calculateDiscount } from '../utils/formatting';
import { useWishlistStore } from '../utils/store';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onOpenDetail: (p: Product) => void;
  key?: string | number;
}

export default function ProductCard({ product, onAddToCart, onOpenDetail }: ProductCardProps) {
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;
  const canPurchase = product.stock !== 0 && product.inStock !== false;

  const handleWishlistClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem(product.id);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white dark:bg-zinc-900 transition-all duration-500"
    >
      <div className="aspect-[4/5] mb-6 overflow-hidden bg-zinc-50 dark:bg-zinc-800 relative border border-zinc-100 dark:border-zinc-700 group-hover:border-primary/20 transition-colors">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Stylish Hover Actions */}
        <div className="absolute inset-x-0 bottom-0 p-6 flex justify-center gap-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-white/80 dark:from-zinc-900/80 to-transparent backdrop-blur-[2px]">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!canPurchase}
            className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-all shadow-xl hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed"
            title={canPurchase ? 'Add to Cart' : 'Out of stock'}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onOpenDetail(product)}
            className="w-12 h-12 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-600 shadow-xl transition-all hover:-translate-y-1"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={handleWishlistClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-xl transition-all hover:-translate-y-1 ${
              inWishlist
                ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-600'
            }`}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Category Label */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-zinc-900 dark:bg-zinc-800 text-white px-3 py-1">
            {product.category}
          </span>
          {product.madeToOrder !== false && (
            <span className="text-[8px] font-black uppercase tracking-[0.15em] bg-primary/80 text-white px-2 py-0.5 w-fit">
              ⚡ Made to Order
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-4 right-4">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary text-white px-3 py-1">
              -{discount}%
            </span>
          </div>
        )}

        {/* Stock Badge */}
        {product.stock !== undefined && (
          <div className="absolute bottom-4 right-4">
            <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded ${
              product.stock > 5
                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                : product.stock > 0
                ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400'
                : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
            }`}>
              {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center text-center px-2">
        <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">
          {product.specs?.material}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.rating!) ? '★' : '☆'}>
                </span>
              ))}
            </div>
            <span className="text-[9px] text-zinc-400 dark:text-zinc-500">({product.reviews})</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-black text-xl tracking-tighter text-zinc-900 dark:text-zinc-100 transition-colors">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
      
      {/* Visual Bar that appears on hover */}
      <div className="mt-4 w-0 group-hover:w-full h-0.5 bg-primary mx-auto transition-all duration-500" />
    </motion.div>
  );
}
