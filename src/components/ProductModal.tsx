import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Box, Ruler, Clock, Heart } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { formatPrice, calculateDiscount } from '../utils/formatting';
import { useWishlistStore } from '../utils/store';
import toast from 'react-hot-toast';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product & { quantity?: number }) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { isInWishlist, addItem, removeItem } = useWishlistStore();
  
  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;

  const handleAddToCart = () => {
    if (product.stock === 0 || product.inStock === false) {
      toast.error('This product is out of stock');
      return;
    }

    onAddToCart({ ...product, quantity });
    toast.success(`Added ${quantity} item(s) to cart`);
    setQuantity(1);
    onClose();
  };

  const handleWishlist = () => {
    if (inWishlist) {
      removeItem(product.id);
      toast.success('Removed from wishlist');
    } else {
      addItem(product.id);
      toast.success('Added to wishlist');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 overflow-hidden flex flex-col md:flex-row max-h-[90vh] transition-colors duration-300"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all md:text-zinc-900 md:dark:text-zinc-100 md:bg-zinc-100 md:dark:bg-zinc-800 md:border-zinc-200 md:dark:border-zinc-700"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left: Image Section */}
          <div className="w-full md:w-1/2 bg-zinc-100 dark:bg-zinc-800 relative group overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 font-bold">
                -{discount}% OFF
              </div>
            )}
            <div className="absolute bottom-8 left-8 flex gap-2">
               {[...Array(3)].map((_, i) => (
                 <div key={i} className="w-12 h-12 border border-white/40 backdrop-blur-sm bg-white/10 hover:bg-white/30 cursor-pointer transition-all overflow-hidden">
                    <img src={product.image} className="w-full h-full object-cover opacity-60 hover:opacity-100" />
                 </div>
               ))}
            </div>
            
            {/* Engineering Overlay */}
            <div className="absolute top-8 left-8 flex flex-col gap-1">
               <span className="text-[10px] font-mono text-white bg-black px-2 py-0.5">MESH_GRID_ACTIVE</span>
               <span className="text-[10px] font-mono text-white bg-black px-2 py-0.5">SCALE_1:1</span>
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto">
            <div className="mb-8 overflow-hidden">
              <motion.span 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[11px] font-black uppercase tracking-[0.4em] text-primary block mb-4"
              >
                // Lab Series: {product.category}
              </motion.span>
              <motion.h2 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-serif font-black uppercase tracking-tighter italic leading-[0.85] text-zinc-900 dark:text-zinc-100 mb-6"
              >
                {product.name}
              </motion.h2>
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="h-1 bg-primary origin-left mb-8"
              />
            </div>

            <div className="flex justify-between items-start gap-4 mb-8">
              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                {product.description}
              </p>
              <div className="text-right">
                <div className="text-4xl font-serif font-black tracking-tighter text-zinc-900 dark:text-zinc-100 italic">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="text-sm text-zinc-400 dark:text-zinc-500 line-through mt-1">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </div>
            </div>

            {/* Technical Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-5 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-start gap-3 rounded transition-colors">
                <Box className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="block text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest mb-1">Material</span>
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{product.specs?.material}</span>
                </div>
              </div>
              <div className="p-5 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-start gap-3 rounded transition-colors">
                <Ruler className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="block text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest mb-1">Dimensions</span>
                  <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{product.specs?.dimensions}</span>
                </div>
              </div>
            </div>

            {/* Stock and Rating */}
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                {product.rating && (
                  <div>
                    <div className="flex text-yellow-400 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(product.rating!) ? '★' : '☆'}>
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest">({product.reviews} reviews)</span>
                  </div>
                )}
              </div>
              <div>
                <span className={`text-xs font-black uppercase tracking-widest ${
                  product.stock! > 5 ? 'text-green-600' : product.stock! > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {product.stock! > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Quantity:</span>
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                >
                  -
                </button>
                <span className="px-6 py-2 font-bold text-zinc-900 dark:text-zinc-100 border-x border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock ?? quantity + 1, quantity + 1))}
                  className="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-grow py-4 bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hvr-sweep-to-right rounded"
              >
                Add To Shopping Bag <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={handleWishlist}
                className={`px-6 py-4 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 rounded ${
                  inWishlist
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40'
                    : 'border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:border-primary dark:hover:border-primary'
                }`}
              >
                <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
                Wishlist
              </button>
            </div>

            <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 text-center uppercase tracking-widest font-bold">
              Limited Edition Production Run #00{product.id} of 500
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
