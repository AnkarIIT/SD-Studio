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

// Cashfree SDK Type
declare const Cashfree: any;

interface CheckoutProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onComplete: (order: Order) => void;
}

const emptyAddress: Address = {
  fullName: '', email: '', phone: '',
  street: '', city: '', state: '', pincode: '', country: 'India',
};

const createOrderId = () =>
  `LB-ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const steps = [
  { id: 'cart', label: 'Cart', icon: ShoppingBag },
  { id: 'shipping', label: 'Shipping', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
];

const fields: Array<[keyof Address, string, string]> = [
  ['fullName', 'Full Name', 'text'],
  ['email', 'Email Address', 'email'],
  ['phone', 'Phone Number', 'tel'],
  ['city', 'City', 'text'],
  ['state', 'State', 'text'],
  ['pincode', 'Pincode', 'tel'],
];

export default function Checkout({ isOpen, items, onClose, onComplete }: CheckoutProps) {
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const addOrder = useOrderStore(state => state.addOrder);
  const clearCart = useCartStore(state => state.clearCart);
  const freeShippingThreshold = useSiteSettings((s) => s.freeShippingThreshold);
  const coupons = useSiteSettings((s) => s.coupons);

  const totals = useMemo(
    () => getOrderTotals(items, appliedCoupon, { freeShippingThreshold, coupons }),
    [items, appliedCoupon, freeShippingThreshold, coupons]
  );

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress(cur => ({ ...cur, [field]: value }));
    setErrors(cur => { const n = { ...cur }; delete n[field]; return n; });
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { setAppliedCoupon(''); return; }
    if (!isValidCoupon(code, coupons)) { toast.error('Invalid coupon code'); return; }
    setAppliedCoupon(code);
    toast.success('Coupon applied! 🎉');
  };

  const initiatePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    const validation = validateForm(addressSchema, address);
    if (!validation.success) {
      setErrors(validation.errors);
      toast.error('Please check your shipping details');
      return;
    }

    setIsProcessing(true);
    const orderId = createOrderId();

    try {
      // 1. Create order on backend to get paymentSessionId
      const response = await fetch('/api/payments/cashfree/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: totals.total,
          customerName: address.fullName,
          customerEmail: address.email,
          customerPhone: address.phone,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      // 2. Open Cashfree Checkout
      const cashfree = Cashfree({ mode: "sandbox" }); // Use "production" for real payments

      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_modal", // Opens in a modal
      }).then(async (result: any) => {
        if (result.error) {
          toast.error(result.error.message || 'Payment failed');
          setIsProcessing(false);
          return;
        }

        if (result.redirect) {
          console.log("Redirected to bank page");
          return;
        }

        // 3. Verify payment on backend
        const verifyRes = await fetch('/api/payments/cashfree/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            orderPayload: {
              id: orderId,
              items,
              ...totals,
              couponCode: appliedCoupon || undefined,
              shippingAddress: address,
            }
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          const finalOrder = verifyData.order;
          addOrder(finalOrder);
          clearCart();
          toast.success('Payment successful! Order confirmed.');
          onComplete(finalOrder);
        } else {
          toast.error(verifyData.error || 'Payment verification failed');
        }
        setIsProcessing(false);
      });

    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
            onClick={!isProcessing ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 md:px-10 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-8">
                <div>
                  <p className="do-eyebrow">{BRAND_NAME}</p>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Checkout</h2>
                </div>

                <div className="hidden md:flex items-center gap-1">
                  {steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-1">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                        step.id === 'shipping' ? 'bg-[#111] dark:bg-white text-white dark:text-[#111]' :
                        step.id === 'cart' ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' :
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                      }`}>
                        {step.id === 'cart' ? <CheckCircle2 className="w-3 h-3" /> : <step.icon className="w-3 h-3" />}
                        {step.label}
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-6 h-px ${step.id === 'cart' ? 'bg-green-400 dark:bg-green-700' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {!isProcessing && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 dark:text-zinc-500"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <form onSubmit={initiatePayment} className="grid grid-cols-1 lg:grid-cols-[1fr_360px]">
              {/* Shipping form */}
              <div className="p-6 md:p-10 space-y-8">
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Step 1 of 2</p>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Delivery details</h3>
                  <p className="text-sm text-zinc-500 mt-1">Where should we ship your prints?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {fields.map(([field, label, type]) => (
                    <label key={field} className="block">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5 block">
                        {label}
                      </span>
                      <input
                        value={address[field]}
                        onChange={e => updateAddress(field, e.target.value)}
                        placeholder={label}
                        type={type}
                        disabled={isProcessing}
                        className={`w-full border rounded-xl p-3.5 text-sm font-semibold outline-none focus:border-primary bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600 ${
                          errors[field] ? 'border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/20' : 'border-zinc-200 dark:border-zinc-700'
                        }`}
                      />
                      {errors[field] && (
                        <span className="text-[10px] text-red-500 dark:text-red-400 font-bold mt-1 block">{errors[field]}</span>
                      )}
                    </label>
                  ))}

                  <label className="block md:col-span-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1.5 block">
                      Street Address
                    </span>
                    <textarea
                      value={address.street}
                      onChange={e => updateAddress('street', e.target.value)}
                      placeholder="House No., Street, Area, Landmark"
                      rows={2}
                      disabled={isProcessing}
                      className={`w-full border rounded-xl p-3.5 text-sm font-semibold outline-none focus:border-primary resize-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-600 ${
                        errors.street ? 'border-red-400 dark:border-red-700 bg-red-50 dark:bg-red-950/20' : 'border-zinc-200 dark:border-zinc-700'
                      }`}
                    />
                    {errors.street && (
                      <span className="text-[10px] text-red-500 dark:text-red-400 font-bold mt-1 block">{errors.street}</span>
                    )}
                  </label>
                </div>
              </div>

              <CheckoutSummary
                items={items}
                subtotal={totals.subtotal}
                discount={totals.discount}
                tax={totals.tax}
                shipping={totals.shipping}
                total={totals.total}
              >
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon code"
                    disabled={isProcessing}
                    className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={isProcessing}
                    className="px-4 text-sm font-medium text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 dark:text-green-400 -mt-2">
                    Coupon {appliedCoupon} applied
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="do-btn-primary w-full py-3.5 flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Secure payment
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}

                  {/* Micro-animation: Shine effect on hover */}
                  {!isProcessing && (
                    <motion.div
                      className="absolute inset-0 w-1/2 h-full bg-white/20 -skew-x-12 -translate-x-full"
                      whileHover={{ x: '250%' }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  )}
                </button>
                <p className="text-xs text-zinc-400 text-center">Powered by Cashfree Payments</p>
              </CheckoutSummary>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
