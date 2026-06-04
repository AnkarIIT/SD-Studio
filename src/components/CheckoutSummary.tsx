import type { ReactNode } from 'react';
import { Address, CartItem } from '../types';
import { formatPrice } from '../utils/formatting';

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  address?: Address;
  children: ReactNode;
}

export default function CheckoutSummary({
  items,
  subtotal,
  discount,
  tax,
  shipping,
  total,
  address,
  children,
}: CheckoutSummaryProps) {
  return (
    <aside className="bg-zinc-50/80 dark:bg-zinc-900/80 border-l border-zinc-200/80 dark:border-zinc-800 p-6 md:p-8 flex flex-col lg:sticky lg:top-0 lg:max-h-[92vh]">
      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-4">
        {items.length} {items.length === 1 ? 'item' : 'items'}
      </p>

      <ul className="space-y-4 max-h-52 overflow-y-auto pr-1 flex-1 min-h-0">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                {item.name}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Qty {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {formatPrice(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 space-y-2 text-sm">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        {discount > 0 && <Row label="Discount" value={`−${formatPrice(discount)}`} accent />}
        <Row label="GST (18%)" value={formatPrice(tax)} />
        <Row label="Shipping" value={shipping === 0 ? 'Free' : formatPrice(shipping)} />
        <div className="flex justify-between items-baseline pt-3 border-t border-zinc-200 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">Total</span>
          <span className="text-2xl font-semibold text-[#111] dark:text-white tabular-nums">{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4">{children}</div>

      {address && (
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Deliver to</p>
          <p className="text-zinc-800 dark:text-zinc-200">{address.fullName}</p>
          <p>{address.street}</p>
          <p>
            {address.city}, {address.state} {address.pincode}
          </p>
        </div>
      )}
    </aside>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
      <span>{label}</span>
      <span className={`font-medium tabular-nums ${accent ? 'text-green-600 dark:text-green-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
        {value}
      </span>
    </div>
  );
}