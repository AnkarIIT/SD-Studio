import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';
import { formatPrice } from '../utils/formatting';
import { getOrderTotals } from '../utils/commerce';
import toast from 'react-hot-toast';

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({ items, isOpen, onClose, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  const { subtotal, tax, shipping, total } = getOrderTotals(items);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    onCheckout();
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 z-[70] shadow-2xl flex flex-col transition-colors duration-300"
      >
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            animate={isOpen ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Your bag</h2>
          </motion.div>
          <button 
            onClick={onClose}
            aria-label="Close cart"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6"
              >
                <ShoppingCart className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
              </motion.div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-2">Your bag is empty.</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-6">Add items to get started!</p>
              <motion.button
                whileHover={{ x: 5 }}
                onClick={onClose}
                className="mt-6 text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-widest text-xs border-b-2 border-zinc-900 dark:border-zinc-100 pb-1 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Continue Shopping
              </motion.button>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                  >
                    <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex-shrink-0 overflow-hidden group">
                      <motion.img
                        src={item.image}
                        alt={item.name}
                        whileHover={{ scale: 1.1 }}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm uppercase tracking-tight leading-tight text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => {
                              onRemove(item.id);
                              toast.success('Item removed');
                            }}
                            className="text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="Remove item"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase font-mono">
                          {item.specs?.material}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-900 dark:text-zinc-100"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-sm text-[#111] dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Shipping</span>
                <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(shipping)}</span>
              </div>
              {shipping === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] text-green-600 dark:text-green-400 font-bold"
                >
                  Free shipping applied
                </motion.div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-end">
              <span className="text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-widest text-xs">Total</span>
              <motion.span
                key={total}
                initial={{ scale: 1.1, color: "#925FE2" }}
                animate={{ scale: 1, color: "inherit" }}
                className="text-2xl font-semibold text-[#111] dark:text-white"
              >
                {formatPrice(total)}
              </motion.span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="do-btn-primary w-full py-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />

              <motion.div
                className="absolute inset-0 w-1/3 h-full bg-white/20 -skew-x-12 -translate-x-full"
                whileHover={{ x: '400%' }}
                transition={{ duration: 0.7 }}
              />
            </motion.button>

            <p className="text-center text-[9px] text-zinc-400 font-mono font-bold tracking-widest">
              SECURE CHECKOUT | 100% SSL ENCRYPTED
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
}
