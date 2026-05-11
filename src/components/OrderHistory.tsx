import { motion } from 'motion/react';
import { ClipboardList, Package, X } from 'lucide-react';
import { useOrderStore } from '../utils/store';
import { formatDateTime, formatOrderId, formatPrice } from '../utils/formatting';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderHistory({ isOpen, onClose }: OrderHistoryProps) {
  const orders = useOrderStore(state => state.orders);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />}

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 h-full w-full max-w-xl bg-white dark:bg-zinc-900 z-[70] shadow-2xl flex flex-col transition-colors duration-300"
      >
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold uppercase tracking-tighter italic text-zinc-900 dark:text-zinc-100">Orders</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400" title="Close orders">
            <X className="w-6 h-6" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Package className="w-14 h-14 text-zinc-200 dark:text-zinc-800 mb-5" />
            <p className="font-bold text-zinc-700 dark:text-zinc-300">No orders yet</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">Completed checkouts will appear here.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {orders.map(order => (
              <article key={order.id} className="border border-zinc-200 dark:border-zinc-800 p-5 hover:border-primary dark:hover:border-primary transition-colors bg-zinc-50/30 dark:bg-zinc-800/20 rounded">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-black uppercase tracking-widest text-xs text-zinc-900 dark:text-zinc-100">{formatOrderId(order.id)}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-1">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{item.name} x {item.quantity}</span>
                      <span className="text-zinc-900 dark:text-zinc-100">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold">+ {order.items.length - 3} more item(s)</p>
                  )}
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-end justify-between">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    <p className="font-bold text-zinc-700 dark:text-zinc-300">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  </div>
                  <p className="text-2xl font-serif font-black italic text-primary">{formatPrice(order.total)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
