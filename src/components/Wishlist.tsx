import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trash2, ShoppingCart, X } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { useWishlistStore } from '../utils/store';
import { formatPrice } from '../utils/formatting';
import toast from 'react-hot-toast';

interface WishlistProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: any) => void;
}

export default function Wishlist({ isOpen, onClose, onAddToCart }: WishlistProps) {
  const { items: wishlistIds, removeItem } = useWishlistStore();
  
  const wishlistProducts = PRODUCTS.filter(p => wishlistIds.includes(p.id));

  const handleRemove = (productId: string) => {
    removeItem(productId);
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (product: any) => {
    onAddToCart({ ...product, quantity: 1 });
    toast.success('Added to cart');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 z-[70] shadow-2xl flex flex-col transition-colors duration-300"
      >
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold uppercase tracking-tighter italic text-zinc-900 dark:text-zinc-100">My Wishlist</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Heart className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-2">Your wishlist is empty</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-6">Add items to save for later</p>
            <button 
              onClick={onClose}
              className="text-primary font-bold uppercase tracking-widest text-xs hover:underline"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlistProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded hover:border-primary dark:hover:border-primary transition-colors bg-zinc-50/50 dark:bg-zinc-800/30"
              >
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 overflow-hidden rounded">
                  <img 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm uppercase leading-tight text-zinc-900 dark:text-zinc-100">{product.name}</h4>
                    <p className="text-primary font-bold text-sm">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-bold text-white bg-primary rounded hover:opacity-90 py-1"
                      title="Add to cart"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Cart
                    </button>
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="px-3 py-1 text-zinc-400 dark:text-zinc-600 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
