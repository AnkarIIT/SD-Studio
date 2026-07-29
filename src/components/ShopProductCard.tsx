import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
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
    <motion.article
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`floppy-card flex flex-col h-full ${
        compact ? 'w-[min(100%,190px)] sm:w-[220px] md:w-[240px] flex-shrink-0 snap-start' : 'w-full'
      }`}
    >
      <div className="floppy-card-top group/card">
        <div className="floppy-card-tab" />
        <Link to={productUrl} className="block overflow-hidden rounded-[1.5rem]" onClick={openDetail}>
          <div className="floppy-card-window relative">
            <motion.img
              src={product.image}
              alt={product.name}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6, ease: "circOut" }}
              className="absolute inset-0 h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </Link>
      </div>

      {/* Content Area - grows to fill space */}
      <div className="px-4 py-4 flex-grow flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-3 min-h-[22px]">
          {product.isNew ? (
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="floppy-card-label"
            >
              NEW
            </motion.span>
          ) : promoBadge ? (
            <motion.span
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="floppy-card-label"
            >
              {promoBadge}
            </motion.span>
          ) : (
            <div /> /* Spacer to maintain height if no badge */
          )}
        </div>

        <Link
          to={productUrl}
          onClick={openDetail}
          className="block text-sm font-semibold uppercase tracking-[0.16em] text-[#f4e9ff] hover:text-[#ffb4fa] transition-colors leading-snug line-clamp-2 min-h-[2.8rem]"
        >
          {product.name}
        </Link>

        {/* Push price to the bottom of the content area */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-3">
          <p className="floppy-card-price">{formatPrice(product.price)}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-[#dcc7ff] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      <div className="floppy-card-footer">
        <motion.button
          type="button"
          disabled={!canPurchase}
          onClick={() => onAddToCart(product)}
          whileTap={{ scale: 0.96 }}
          className="floppy-card-button w-full active:bg-[#b995ff]"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add
        </motion.button>
      </div>
    </motion.article>
  );
}
