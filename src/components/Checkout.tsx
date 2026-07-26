import { type FormEvent, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, ShoppingBag, MapPin, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Address, CartItem, Order } from '../types';
import { getOrderTotals, isValidCoupon } from '../utils/commerce';
import { addressSchema, validateForm } from '../utils/validation';
import { useCartStore, useOrderStore } from '../utils/store';
import { useSiteSettings } from '../utils/siteSettings';
import CheckoutSummary from './CheckoutSummary';
import { BRAND_NAME } from '../brand';

declare const Cashfree: any;

export default function Checkout({ isOpen, items, onClose, onComplete }: { isOpen: boolean; items: CartItem[]; onClose: () => void; onComplete: (o: Order) => void }) {
  const [address, setAddress] = useState<Address>({ fullName: '', email: '', phone: '', street: '', city: '', state: '', pincode: '', country: 'India' });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { addOrder } = useOrderStore();
  const { clearCart } = useCartStore();
  const siteSettings = useSiteSettings();

  const totals = useMemo(() => getOrderTotals(items, appliedCoupon, siteSettings), [items, appliedCoupon, siteSettings]);

  const initiatePayment = async (e: FormEvent) => {
    e.preventDefault();
    const val = validateForm(addressSchema, address);
    if (!val.success) { setErrors(val.errors); return; }

    setIsProcessing(true);
    const orderId = `SD-ORD-${Date.now().toString(36).toUpperCase()}`;

    try {
      // 1. Create order (Using absolute URL for Vercel stability)
      const res = await fetch('/api/payments/cashfree/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount: totals.total, customerName: address.fullName, customerEmail: address.email, customerPhone: address.phone })
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server returned invalid response. Please redeploy Vercel changes.');
      }

      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create order');

      // 2. Open Cashfree
      const cashfree = Cashfree({ mode: "production" });
      cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_modal" })
        .then(async (result: any) => {
          if (result.error) { toast.error(result.error.message); setIsProcessing(false); return; }

          // 3. Verify
          const vRes = await fetch('/api/payments/cashfree/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, orderPayload: { id: orderId, items, ...totals, shippingAddress: address, couponCode: appliedCoupon } })
          });

          const vData = await vRes.json();
          if (vData.success) {
            addOrder(vData.order);
            clearCart();
            toast.success('Payment Received!');
            onComplete(vData.order);
          } else {
            throw new Error(vData.error);
          }
          setIsProcessing(false);
        });
    } catch (err: any) {
      toast.error(err.message || 'Payment Failed');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm" onClick={!isProcessing ? onClose : undefined} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 py-5 flex items-center justify-between rounded-t-2xl">
               <h2 className="text-xl font-bold">{BRAND_NAME} Checkout</h2>
               {!isProcessing && <button onClick={onClose}><X className="w-5 h-5 text-zinc-400" /></button>}
            </div>

            <form onSubmit={initiatePayment} className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
              <div className="p-6 md:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {['fullName', 'email', 'phone', 'city', 'state', 'pincode'].map((f) => (
                    <label key={f} className="block">
                      <span className="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block">{f.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        value={(address as any)[f]}
                        onChange={e => {setAddress({...address, [f]: e.target.value}); setErrors({...errors, [f]: ''})}}
                        disabled={isProcessing}
                        className={`w-full border rounded-xl p-3 text-sm outline-none bg-transparent ${errors[f] ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-700'}`}
                      />
                      {errors[f] && <span className="text-[10px] text-red-500">{errors[f]}</span>}
                    </label>
                  ))}
                  <label className="block md:col-span-2">
                    <span className="text-[10px] font-black uppercase text-zinc-400 mb-1.5 block">Street Address</span>
                    <textarea
                      value={address.street}
                      onChange={e => setAddress({...address, street: e.target.value})}
                      disabled={isProcessing}
                      rows={2}
                      className="w-full border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm outline-none bg-transparent"
                    />
                  </label>
                </div>
              </div>

              <CheckoutSummary items={items} {...totals}>
                <div className="flex gap-2">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon" className="flex-1 border rounded-lg px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700" />
                  <button type="button" onClick={() => { (siteSettings as any).coupons?.[couponCode.toUpperCase()] ? (setAppliedCoupon(couponCode.toUpperCase()), toast.success('Applied!')) : toast.error('Invalid') }} className="px-4 border rounded-lg text-sm">Apply</button>
                </div>
                <button type="submit" disabled={isProcessing} className="do-btn-primary w-full py-4 flex items-center justify-center gap-2">
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'Pay Securely'} <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-zinc-400">Production Ready · Secure Payment</p>
              </CheckoutSummary>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
