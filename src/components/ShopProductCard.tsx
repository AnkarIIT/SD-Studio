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
      className={`floppy-card flex flex-col ${
        compact ? 'w-[min(100%,190px)] sm:w-[220px] md:w-[240px] flex-shrink-0 snap-start' : 'w-full'
      }`}
    >
      <div className="floppy-card-top group/card">
        <div className="floppy-card-tab" />
        <Link to={productUrl} className="block overflow-hidden rounded-[1.5rem]" onClick={openDetail}>
          <div className="floppy-card-window relative">
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.03]"
              referrerPolicy="no-referrer"
            />
          </div>
        </Link>
      </div>
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          {product.isNew && (
            <span className="floppy-card-label">NEW</span>
          )}
          {promoBadge && (
            <span className="floppy-card-label">{promoBadge}</span>
          )}
        </div>

        <Link
          to={productUrl}
          onClick={openDetail}
          className="block text-sm font-semibold uppercase tracking-[0.16em] text-[#f4e9ff] hover:text-[#ffb4fa] transition-colors leading-snug line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="floppy-card-price">{formatPrice(product.price)}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-[#dcc7ff] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
      <div className="floppy-card-footer">
        <button
          type="button"
          disabled={!canPurchase}
          onClick={() => onAddToCart(product)}
          className="floppy-card-button w-full"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </article>
  );
}