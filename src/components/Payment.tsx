import { type FormEvent, useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  CreditCard,
  IndianRupee,
  Landmark,
  Loader2,
  QrCode,
  ShieldCheck,
  Copy,
  Check,
  Smartphone,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Address, CartItem, Order } from '../types';
import { formatOrderId, formatPrice } from '../utils/formatting';
import { generateUpiUrl, generateQrCode, validateUpiReference, validateBankReference } from '../utils/payment';
import {
  sendOrderConfirmedNotification,
  sendPaymentSuccessNotification,
  formatPriceForNotification,
  formatDateForNotification,
} from '../utils/notifications';
import {
  saveOrderToServer,
  enqueuePaymentVerification,
} from '../utils/ordersApi';
import {
  fetchPaymentConfig,
  createRazorpayOrderOnServer,
  openRazorpayCheckout,
  verifyRazorpayOnServer,
  type PaymentConfig,
} from '../utils/razorpay';
import CheckoutSummary from './CheckoutSummary';
import { useSiteSettings } from '../utils/siteSettings';
import { BRAND_NAME, BRAND_UPI_ID } from '../brand';

type PaymentMethod = Order['paymentMethod'];

interface PaymentProps {
  order: Order;
  items: CartItem[];
  address: Address;
  onBack: () => void;
  onComplete: (order: Order) => void;
}

const primaryMethods: Array<{
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { id: 'cod', label: 'Cash on delivery', hint: 'Pay when it arrives', icon: IndianRupee },
  { id: 'bank_transfer', label: 'Bank transfer', hint: 'NEFT / IMPS / RTGS', icon: Landmark },
];

const merchant = {
  upiId: BRAND_UPI_ID,
  bankName: BRAND_NAME,
  accountName: `${BRAND_NAME} Studio`,
  accountNumber: '123456789012',
  ifsc: 'LBND0001234',
};

const onlyDigits = (v: string) => v.replace(/\D/g, '');

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success(`${label} copied`);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

export default function Payment({ order, items, address, onBack, onComplete }: PaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [payConfig, setPayConfig] = useState<PaymentConfig | null>(null);
  const [showCardDemo, setShowCardDemo] = useState(false);
  const [upiReference, setUpiReference] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [card, setCard] = useState({ name: address.fullName, number: '', expiry: '', cvv: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const codEnabled = useSiteSettings((s) => s.codEnabled);
  const visibleMethods = primaryMethods.filter((m) => m.id !== 'cod' || codEnabled);

  const maskedCard = useMemo(() => {
    const digits = onlyDigits(card.number).slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }, [card.number]);

  useEffect(() => {
    saveOrderToServer({ ...order, status: 'pending' }).catch(() => undefined);
    fetchPaymentConfig().then(setPayConfig);
  }, [order.id]);

  useEffect(() => {
    if (method !== 'upi') return;
    setQrLoading(true);
    const url = generateUpiUrl(
      merchant.upiId,
      BRAND_NAME,
      Math.round(order.total * 100),
      `Order-${formatOrderId(order.id)}`
    );
    generateQrCode(url)
      .then(setQrCode)
      .catch(() => toast.error('Could not load QR code'))
      .finally(() => setQrLoading(false));
  }, [method, order.total, order.id]);

  const validatePayment = () => {
    if (method === 'razorpay') return '';
    if (method === 'upi' && !validateUpiReference(upiReference))
      return 'Enter your UPI transaction ID (6–20 characters).';
    if (method === 'bank_transfer' && !validateBankReference(bankReference))
      return 'Enter your bank UTR (9–20 characters).';
    if (method === 'card') {
      if (card.name.trim().length < 2) return 'Enter name on card.';
      if (onlyDigits(card.number).length !== 16) return 'Enter a valid 16-digit card number.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) return 'Expiry must be MM/YY.';
      if (onlyDigits(card.cvv).length < 3) return 'Enter a valid CVV.';
    }
    return '';
  };

  const payWithRazorpay = async () => {
    setIsProcessing(true);
    try {
      const config = payConfig ?? (await fetchPaymentConfig());
      const keyId = config.keyId ?? import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!keyId) {
        toast.error('Razorpay not configured');
        return;
      }

      const created = await createRazorpayOrderOnServer(order.id, order.total);
      if (!created.success || !created.razorpayOrderId) {
        toast.error(created.error ?? 'Could not start Razorpay');
        return;
      }

      const response = await openRazorpayCheckout({
        keyId,
        orderId: order.id,
        razorpayOrderId: created.razorpayOrderId,
        amountPaise: created.amount ?? Math.round(order.total * 100),
        customerName: address.fullName,
        customerEmail: address.email,
        customerPhone: address.phone,
        demo: created.demo ?? config.demoMode,
      });

      if (!response) return;

      const verified = await verifyRazorpayOnServer({
        orderId: order.id,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });

      if (!verified.success) {
        toast.error(verified.error ?? 'Payment verification failed');
        return;
      }

      toast.success('Razorpay payment confirmed');
      onComplete({
        ...order,
        status: 'paid',
        paymentMethod: 'razorpay',
        paymentId: response.razorpay_payment_id,
        updatedAt: new Date().toISOString(),
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Payment cancelled';
      if (msg !== 'Payment cancelled') toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const completePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (method === 'razorpay') {
      await payWithRazorpay();
      return;
    }

    const err = validatePayment();
    if (err) {
      toast.error(err);
      return;
    }

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));

    const paymentId =
      method === 'cod'
        ? `COD-${order.id}`
        : method === 'upi'
          ? upiReference.trim().toUpperCase()
          : method === 'bank_transfer'
            ? bankReference.trim().toUpperCase()
            : `CARD-DEMO-${order.id.slice(0, 8).toUpperCase()}`;

    const orderId = formatOrderId(order.id);
    const notifyPayload = {
      email: address.email,
      phone: address.phone,
      customerName: address.fullName,
      orderId,
    };

    const notifyResult =
      method === 'cod'
        ? await sendOrderConfirmedNotification({
            ...notifyPayload,
            estimatedProduction: '2–5 business days',
          })
        : await sendPaymentSuccessNotification({
            ...notifyPayload,
            amount: formatPriceForNotification(order.total),
            paymentMethod:
              method === 'upi' ? 'UPI' : method === 'card' ? 'Card (demo)' : 'Bank transfer',
            orderDate: formatDateForNotification(new Date()),
          });

    if (notifyResult.success) {
      toast.success(notifyResult.results?.join(' · ') ?? 'Order confirmed');
    } else {
      toast(
        'Order saved — confirmation email could not be sent. Check notification server or demo mode.',
        { icon: '⚠️', duration: 5000 }
      );
    }

    const needsVerification = method === 'upi' || method === 'bank_transfer';
    const queueResult = await enqueuePaymentVerification({
      orderId: order.id,
      method,
      reference: paymentId,
      amount: order.total,
    });

    if (needsVerification && queueResult.autoVerified) {
      toast.success('Payment verified automatically (dev mode)');
    } else if (needsVerification) {
      toast.success('Payment submitted — awaiting verification', { duration: 5000 });
    }

    const finalStatus =
      needsVerification && !queueResult.autoVerified ? 'pending_payment' : 'paid';

    onComplete({
      ...order,
      status: finalStatus,
      paymentMethod: method,
      paymentId,
      updatedAt: new Date().toISOString(),
    });
  };

  const ctaLabel =
    isProcessing
      ? 'Please wait…'
      : method === 'razorpay'
        ? 'Pay with Razorpay'
        : method === 'cod'
          ? 'Place order'
          : method === 'card'
            ? 'Complete demo payment'
            : 'I have paid — confirm order';

  return (
    <form onSubmit={completePayment} className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,360px)]">
      <div className="p-6 md:p-10 space-y-8 max-w-2xl">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to delivery
        </button>

        <div>
          <p className="text-sm text-zinc-500 mb-1">Order {formatOrderId(order.id)}</p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">How would you like to pay?</h3>
          <p className="text-sm text-zinc-500 mt-2">
            Pay <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(order.total)}</span> — no payment gateway fees.
          </p>
        </div>

        {/* Payment method list */}
        <div className="space-y-2" role="radiogroup" aria-label="Payment method">
          {payConfig?.razorpayEnabled !== false && (
            <button
              type="button"
              onClick={() => {
                setMethod('razorpay');
                setShowCardDemo(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                method === 'razorpay'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${method === 'razorpay' ? 'text-primary' : 'text-zinc-400'}`} />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  Razorpay {payConfig?.demoMode ? '(demo)' : ''}
                </span>
                <span className="block text-xs text-zinc-500">Cards, UPI, wallets — secure checkout</span>
              </span>
            </button>
          )}

          {visibleMethods.map((opt) => {
            const Icon = opt.icon;
            const active = method === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setMethod(opt.id);
                  setShowCardDemo(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  active
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    active ? 'border-primary' : 'border-zinc-300 dark:border-zinc-600'
                  }`}
                >
                  {active && <span className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </span>
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-primary' : 'text-zinc-400'}`} />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{opt.label}</span>
                  <span className="block text-xs text-zinc-500">{opt.hint}</span>
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const next = !showCardDemo;
              setShowCardDemo(next);
              setMethod(next ? 'card' : 'upi');
            }}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <span className="inline-flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Card payment (demo only)
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCardDemo ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Method details — one panel */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 md:p-6">
          {method === 'upi' && (
            <div className="space-y-6">
              <ol className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-decimal list-inside">
                <li>Scan the QR or pay to <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">{merchant.upiId}</span></li>
                <li>Pay exactly <span className="font-semibold text-primary">{formatPrice(order.total)}</span></li>
                <li>Paste the UPI reference below</li>
              </ol>

              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="flex-shrink-0">
                  {qrLoading ? (
                    <div className="w-36 h-36 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : qrCode ? (
                    <img
                      src={qrCode}
                      alt="UPI QR"
                      className="w-36 h-36 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white p-2"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-lg bg-zinc-100 flex items-center justify-center">
                      <QrCode className="w-8 h-8 text-zinc-300" />
                    </div>
                  )}
                </div>
                <div className="text-sm space-y-2 flex-1">
                  <p>
                    UPI ID: <span className="font-mono font-semibold">{merchant.upiId}</span>{' '}
                    <CopyButton value={merchant.upiId} label="UPI ID" />
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">UPI transaction reference</span>
                <input
                  value={upiReference}
                  onChange={(e) => setUpiReference(e.target.value.toUpperCase())}
                  placeholder="e.g. 123456789012"
                  className="mt-2 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </label>
            </div>
          )}

          {method === 'bank_transfer' && (
            <div className="space-y-5">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Transfer <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatPrice(order.total)}</span> then enter your UTR.
              </p>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  ['Account name', merchant.accountName],
                  ['Account no.', merchant.accountNumber],
                  ['Bank', merchant.bankName],
                  ['IFSC', merchant.ifsc],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2.5">
                    <dt className="text-xs text-zinc-500">{k}</dt>
                    <dd className="font-mono font-medium text-zinc-900 dark:text-zinc-100 mt-0.5 flex items-center gap-2 flex-wrap">
                      {v}
                      <CopyButton value={v} label={k} />
                    </dd>
                  </div>
                ))}
              </dl>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">UTR / reference number</span>
                <input
                  value={bankReference}
                  onChange={(e) => setBankReference(e.target.value.toUpperCase())}
                  placeholder="Bank reference after transfer"
                  className="mt-2 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
              </label>
            </div>
          )}

          {method === 'razorpay' && (
            <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
              <p>
                Pay <span className="font-semibold text-primary">{formatPrice(order.total)}</span> via Razorpay.
                {payConfig?.demoMode && ' Demo mode — no real charge.'}
              </p>
              <p className="text-xs text-zinc-500">Click the button below to open the secure payment window.</p>
            </div>
          )}

          {method === 'cod' && (
            <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3">
              <p>
                You will pay <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatPrice(order.total)}</span> in cash when your order is delivered (within 5–7 business days).
              </p>
              <ul className="space-y-1.5 text-zinc-500">
                <li>· Order is confirmed immediately</li>
                <li>· We will email you production & shipping updates</li>
              </ul>
            </div>
          )}

          {method === 'card' && showCardDemo && (
            <div className="space-y-4">
              <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-lg px-3 py-2">
                Demo only — card data is not stored or charged.
              </p>
              <input
                value={card.name}
                onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                placeholder="Name on card"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-sm outline-none focus:border-primary"
              />
              <input
                value={maskedCard}
                onChange={(e) => setCard((c) => ({ ...c, number: onlyDigits(e.target.value).slice(0, 16) }))}
                placeholder="Card number"
                inputMode="numeric"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-sm font-mono outline-none focus:border-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={card.expiry}
                  onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value.slice(0, 5) }))}
                  placeholder="MM/YY"
                  className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-sm font-mono outline-none focus:border-primary"
                />
                <input
                  value={card.cvv}
                  onChange={(e) => setCard((c) => ({ ...c, cvv: onlyDigits(e.target.value).slice(0, 4) }))}
                  placeholder="CVV"
                  inputMode="numeric"
                  className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-4 py-3 text-sm font-mono outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-zinc-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" /> Secure checkout · Made-to-order 3D prints
        </p>
      </div>

      <CheckoutSummary
        items={items}
        subtotal={order.subtotal}
        discount={order.discount}
        tax={order.tax}
        shipping={order.shipping}
        total={order.total}
        address={address}
      >
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {ctaLabel}
        </button>
      </CheckoutSummary>
    </form>
  );
}