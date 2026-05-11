import { type FormEvent, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Address, CartItem, Order } from '../types';
import { formatPrice } from '../utils/formatting';
import { getOrderTotals, isValidCoupon } from '../utils/commerce';
import { addressSchema, validateForm } from '../utils/validation';
import { useCartStore, useOrderStore } from '../utils/store';
import Payment from './Payment';

interface CheckoutProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onComplete: (order: Order) => void;
}

const emptyAddress: Address = {
  fullName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

const createOrderId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export default function Checkout({ isOpen, items, onClose, onComplete }: CheckoutProps) {
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const addOrder = useOrderStore(state => state.addOrder);
  const clearCart = useCartStore(state => state.clearCart);

  const totals = useMemo(() => getOrderTotals(items, appliedCoupon), [items, appliedCoupon]);

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress(current => ({ ...current, [field]: value }));
    setErrors(current => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const applyCoupon = () => {
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) {
      setAppliedCoupon('');
      return;
    }

    if (!isValidCoupon(normalized)) {
      toast.error('Invalid coupon code');
      return;
    }

    setAppliedCoupon(normalized);
    toast.success('Coupon applied');
  };

  const finishOrder = (order: Order) => {
    addOrder(order);
    clearCart();
    setAddress(emptyAddress);
    setAppliedCoupon('');
    setCouponCode('');
    setPendingOrder(null);
    onComplete(order);
  };

  const submitOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const validation = validateForm(addressSchema, address);
    if (!validation.success) {
      setErrors(validation.errors);
      toast.error('Please check your shipping details');
      return;
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: createOrderId(),
      items,
      ...totals,
      status: 'pending',
      paymentMethod: 'upi',
      couponCode: appliedCoupon || undefined,
      shippingAddress: address,
      createdAt: now,
      updatedAt: now,
    };

    setPendingOrder(order);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-white dark:bg-zinc-900 shadow-2xl transition-colors duration-300"
          >
            <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 md:px-10 py-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Secure Checkout</p>
                <h2 className="text-3xl font-serif font-black italic tracking-tighter text-zinc-900 dark:text-zinc-100">
                  {pendingOrder ? 'Payment' : 'Shipping'}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400" title="Close checkout">
                <X className="w-6 h-6" />
              </button>
            </div>

            {pendingOrder ? (
              <Payment
                order={pendingOrder}
                items={items}
                address={address}
                onBack={() => setPendingOrder(null)}
                onComplete={finishOrder}
              />
            ) : (
            <form onSubmit={submitOrder} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0">
              <div className="p-6 md:p-10 space-y-10">
                <section>
                  <h3 className="font-black uppercase tracking-[0.2em] text-xs mb-5 text-zinc-900 dark:text-zinc-100">Shipping Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      ['fullName', 'Full name'],
                      ['email', 'Email'],
                      ['phone', 'Phone'],
                      ['city', 'City'],
                      ['state', 'State'],
                      ['pincode', 'Pincode'],
                    ].map(([field, label]) => (
                      <label key={field} className="block">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{label}</span>
                        <input
                          value={address[field as keyof Address]}
                          onChange={(e) => updateAddress(field as keyof Address, e.target.value)}
                          placeholder={label}
                          type={field === 'email' ? 'email' : field === 'phone' || field === 'pincode' ? 'tel' : 'text'}
                          className={`mt-2 w-full border p-4 text-sm font-bold outline-none focus:border-primary bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-all ${
                            errors[field] ? 'border-red-400 dark:border-red-900' : 'border-zinc-200 dark:border-zinc-800'
                          }`}
                        />
                        {errors[field] && <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">{errors[field]}</span>}
                      </label>
                    ))}
                    <label className="block md:col-span-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Street address</span>
                      <textarea
                        value={address.street}
                        onChange={(e) => updateAddress('street', e.target.value)}
                        placeholder="Street address"
                        rows={3}
                        className={`mt-2 w-full border p-4 text-sm font-bold outline-none focus:border-primary resize-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-all ${
                          errors.street ? 'border-red-400 dark:border-red-900' : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                      />
                      {errors.street && <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">{errors.street}</span>}
                    </label>
                  </div>
                </section>
              </div>

              <aside className="bg-zinc-50 dark:bg-zinc-900/50 border-l border-zinc-100 dark:border-zinc-800 p-6 md:p-8 space-y-6 transition-colors">
                <h3 className="font-black uppercase tracking-[0.2em] text-xs text-zinc-900 dark:text-zinc-100">Order Summary</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800" />
                      <div className="flex-1">
                        <p className="font-black uppercase text-xs leading-tight text-zinc-900 dark:text-zinc-100">{item.name}</p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mt-1">Qty {item.quantity}</p>
                      </div>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs font-bold uppercase outline-none focus:border-primary text-zinc-900 dark:text-zinc-100 transition-all"
                  />
                  <button type="button" onClick={applyCoupon} className="px-4 bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors">
                    Apply
                  </button>
                </div>

                <div className="space-y-3 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-5">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>Subtotal</span><span className="text-zinc-900 dark:text-zinc-100">{formatPrice(totals.subtotal)}</span></div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>Discount</span><span className="text-green-600 dark:text-green-400">-{formatPrice(totals.discount)}</span></div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>GST</span><span className="text-zinc-900 dark:text-zinc-100">{formatPrice(totals.tax)}</span></div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>Shipping</span><span className="text-zinc-900 dark:text-zinc-100">{totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}</span></div>
                  <div className="flex justify-between items-end border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <span className="font-black uppercase tracking-widest text-xs text-zinc-900 dark:text-zinc-100">Total</span>
                    <span className="text-3xl font-serif font-black italic text-primary">{formatPrice(totals.total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-primary-dark disabled:opacity-60 transition-colors"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-3 text-zinc-500 text-xs leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-green-600 mt-1.5 flex-shrink-0" />
                  <span>No paid gateway required. The next step supports UPI reference, bank transfer, card demo, and cash on delivery.</span>
                </div>
              </aside>
            </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
