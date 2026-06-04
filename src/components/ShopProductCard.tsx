import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, calculateDiscount } from '../utils/formatting';

interface ShopProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onOpenDetail?: (p: Product) => void;
  compact?: boolean;
}

export default function ShopProductCard({
  product,
  onAddToCart,
  onOpenDetail,
  compact = false,
}: ShopProductCardProps) {
  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;
  const canPurchase = product.stock !== 0 && product.inStock !== false;
  const promoBadge = product.badge ?? (discount >= 15 ? `${discount}% off` : undefined);
  const productUrl = `/product/${product.id}`;

  const openDetail = () => {
    if (onOpenDetail) onOpenDetail(product);
  };

  return (
    <article
      className={`product-card-do flex flex-col ${
        compact ? 'w-[min(100%,190px)] sm:w-[220px] md:w-[240px] flex-shrink-0 snap-start' : 'w-full'
      }`}
    >
      <div className="text-left w-full group/card">
        <div className="relative aspect-square overflow-hidden bg-[#f5f5f5] dark:bg-zinc-800">
          <Link to={productUrl} className="block w-full h-full" onClick={openDetail}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
              referrerPolicy="no-referrer"
            />
          </Link>
          {product.isNew && (
            <span className="absolute top-2 left-2 text-[9px] font-semibold uppercase tracking-wider bg-white text-[#111] px-2 py-1 pointer-events-none">
              New
            </span>
          )}
          {promoBadge && (
            <span className="absolute top-2 right-2 text-[9px] font-semibold uppercase tracking-wider bg-[#111] text-white px-2 py-1 pointer-events-none">
              {promoBadge}
            </span>
          )}
          {!canPurchase && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-zinc-900/70 text-xs font-semibold uppercase tracking-wider pointer-events-none">
              Sold out
            </span>
          )}
          {canPurchase && (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              className="absolute bottom-0 left-0 right-0 py-3 bg-[#111] dark:bg-white dark:text-[#111] text-white text-[10px] font-semibold uppercase tracking-[0.15em] translate-y-0 md:translate-y-full md:group-hover/card:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1.5 z-10"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to bag
            </button>
          )}
        </div>
        <div className="pt-3 pb-1">
          <Link
            to={productUrl}
            onClick={openDetail}
            className="text-sm font-medium text-[#111] dark:text-zinc-100 line-clamp-2 leading-snug hover:opacity-70 block"
          >
            {product.name}
          </Link>
          <div className="flex flex-wrap items-baseline gap-2 mt-1.5">
            <span className="text-sm font-semibold text-[#111] dark:text-white tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#6b6b6b] line-through tabular-nums">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}