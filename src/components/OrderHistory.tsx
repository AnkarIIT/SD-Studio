import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ClipboardList, Loader2, Package, X } from 'lucide-react';
import { useOrderStore } from '../utils/store';
import { formatDateTime, formatOrderId, formatPrice } from '../utils/formatting';
import { fetchOrdersFromServer } from '../utils/ordersApi';
import {
  getVerifiedEmail,
} from '../utils/customerAuth';
import type { Order } from '../types';
import OrderTimeline from './OrderTimeline';

interface OrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

function mergeOrders(local: Order[], remote: Order[]): Order[] {
  const map = new Map<string, Order>();
  for (const o of remote) map.set(o.id, o);
  for (const o of local) {
    if (!map.has(o.id)) map.set(o.id, o);
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function OrderHistory({ isOpen, onClose }: OrderHistoryProps) {
  const localOrders = useOrderStore((state) => state.orders);
  const [remoteOrders, setRemoteOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const verifiedEmail = getVerifiedEmail();

  useEffect(() => {
    if (!isOpen) return;

    if (!verifiedEmail) {
      setRemoteOrders([]);
      setSyncNote(null);
      return;
    }

    setLoading(true);
    fetchOrdersFromServer(verifiedEmail)
      .then((res) => {
        if (res.success) {
          setRemoteOrders(res.orders);
          setSyncNote(res.orders.length > 0 ? 'Synced from server' : null);
        } else {
          setRemoteOrders([]);
          setSyncNote('Showing orders on this device only');
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, localOrders.length, verifiedEmail]);

  const orders = useMemo(
    () => mergeOrders(localOrders, remoteOrders),
    [localOrders, remoteOrders]
  );

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
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Your orders</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400" title="Close orders">
            <X className="w-6 h-6" />
          </button>
        </div>

        {verifiedEmail && (
          <div className="px-6 py-2 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
            <span>Signed in as {verifiedEmail}</span>
          </div>
        )}

        {loading && (
          <div className="px-8 py-3 flex items-center gap-2 text-xs text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading orders…
          </div>
        )}
        {syncNote && !loading && (
          <p className="px-8 py-2 text-[10px] text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">{syncNote}</p>
        )}

        {orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Package className="w-14 h-14 text-zinc-200 dark:text-zinc-800 mb-5" />
            <p className="font-bold text-zinc-700 dark:text-zinc-300">No orders yet</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">Complete a checkout to see orders here.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {orders.map((order) => (
              <article key={order.id} className="border border-zinc-200 dark:border-zinc-800 p-5 hover:border-primary dark:hover:border-primary transition-colors bg-zinc-50/30 dark:bg-zinc-800/20 rounded-lg">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{formatOrderId(order.id)}</p>
                    <p className="text-xs text-zinc-400 mt-1">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-semibold uppercase rounded">
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-zinc-400">+ {order.items.length - 3} more item(s)</p>
                  )}
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-end justify-between">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    <p className="font-medium text-zinc-700 dark:text-zinc-300">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  </div>
                  <p className="text-xl font-bold text-primary">{formatPrice(order.total)}</p>
                </div>

                <OrderTimeline orderId={order.id} />
              </article>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
