import { motion } from 'motion/react';
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
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 z-[70] shadow-2xl flex flex-col transition-colors duration-300"
      >
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold uppercase tracking-tighter italic text-zinc-900 dark:text-zinc-100">Shopping Bag</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-2">Your bag is empty.</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm mb-6">Add items to get started!</p>
              <button 
                onClick={onClose}
                className="mt-6 text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-widest text-xs border-b-2 border-zinc-900 dark:border-zinc-100 pb-1 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <motion.div 
                  key={item.id} 
                  className="flex gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 flex-shrink-0 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
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
                      <span className="font-bold text-sm text-primary">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
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
                <span>Tax (GST 18%)</span>
                <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Shipping</span>
                <span className="text-zinc-900 dark:text-zinc-100">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {shipping === 0 && (
                <div className="text-[10px] text-green-600 dark:text-green-400 font-bold">Free shipping applied</div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-end">
              <span className="text-zinc-600 dark:text-zinc-400 font-black uppercase tracking-widest text-xs">Total</span>
              <span className="text-3xl font-serif font-black tracking-tighter italic text-primary">
                {formatPrice(total)}
              </span>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed group hvr-sweep-to-right rounded"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>

            <p className="text-center text-[9px] text-zinc-400 font-mono font-bold tracking-widest">
              SECURE CHECKOUT | 100% SSL ENCRYPTED
            </p>
          </div>
        )}
      </motion.div>
    </>
  );
}
