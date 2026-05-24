import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Heart } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { formatPrice, calculateDiscount } from '../utils/formatting';
import { useWishlistStore } from '../utils/store';
import ProductSpecs from './ProductSpecs';
import ModelViewer from './ModelViewer';
import ProductionTimeline from './ProductionTimeline';
import toast from 'react-hot-toast';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product & { quantity?: number }) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'model'>('specs');
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
          className="relative w-full max-w-6xl bg-white dark:bg-zinc-900 overflow-hidden flex flex-col lg:flex-row max-h-[90vh] transition-colors duration-300 rounded-lg"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full transition-all lg:text-zinc-900 lg:dark:text-zinc-100 lg:bg-zinc-100 lg:dark:bg-zinc-800 lg:border-zinc-200 lg:dark:border-zinc-700"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left: Image Section */}
          <div className="w-full lg:w-1/2 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden flex flex-col">
            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden group min-h-[400px]">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 font-bold rounded">
                  -{discount}% OFF
                </div>
              )}
              
              {/* Engineering Overlay */}
              <div className="absolute top-8 left-8 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-white bg-black px-2 py-0.5">MESH_GRID_ACTIVE</span>
                <span className="text-[10px] font-mono text-white bg-black px-2 py-0.5">SCALE_1:1</span>
              </div>
            </div>

            {/* Additional Images Carousel */}
            <div className="p-4 bg-gradient-to-t from-zinc-900/20 flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-16 h-16 border border-white/40 backdrop-blur-sm bg-white/10 hover:bg-white/30 cursor-pointer transition-all overflow-hidden rounded">
                  <img src={product.image} className="w-full h-full object-cover opacity-60 hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info Section */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="mb-6 overflow-hidden">
              <motion.span 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-[11px] font-black uppercase tracking-[0.4em] text-primary block mb-2"
              >
                // Lab Series: {product.category}
              </motion.span>
              <motion.h2 
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-serif font-black uppercase tracking-tighter italic leading-[0.9] text-zinc-900 dark:text-zinc-100"
              >
                {product.name}
              </motion.h2>
            </div>

            {/* Price and Description */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-3">
                <div className="text-3xl font-serif font-black tracking-tighter text-zinc-900 dark:text-zinc-100 italic">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && (
                  <div className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock and Rating */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
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
                  {product.stock! > 0 ? `${product.stock} available` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Production Timeline */}
            {product.madeToOrder !== false && (
              <div className="mb-6">
                <ProductionTimeline 
                  productionTime={product.productionTime}
                  madeToOrder={product.madeToOrder}
                  status="pending"
                />
              </div>
            )}

            {/* Tabs for Specs and Model */}
            <div className="mb-6 flex gap-2 border-b border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'specs'
                    ? 'text-primary border-b-2 border-primary -mb-[2px]'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('model')}
                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'model'
                    ? 'text-primary border-b-2 border-primary -mb-[2px]'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                3D Model
              </button>
            </div>

            {/* Tab Content */}
            <div className="mb-6 min-h-[200px]">
              {activeTab === 'specs' && <ProductSpecs product={product} />}
              {activeTab === 'model' && <ModelViewer productName={product.name} modelUrl={product.modelUrl} />}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Qty:</span>
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                >
                  −
                </button>
                <span className="px-4 py-2 font-bold text-zinc-900 dark:text-zinc-100 border-x border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 min-w-[50px] text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock ?? quantity + 1, quantity + 1))}
                  className="px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-auto">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-3 bg-primary text-white font-black uppercase tracking-widest text-xs hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded"
              >
                Add To Cart <Check className="w-4 h-4" />
              </button>
              <button 
                onClick={handleWishlist}
                className={`w-full py-3 font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 rounded ${
                  inWishlist
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40'
                    : 'border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 hover:border-primary dark:hover:border-primary'
                }`}
              >
                <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
                {inWishlist ? 'Saved' : 'Save'}
              </button>
            </div>

            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 text-center uppercase tracking-widest font-bold mt-4">
              Limited Run #00{product.id}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
