import { type FormEvent, useMemo, useState, useEffect } from 'react';
import { ArrowLeft, Building2, CheckCircle2, CreditCard, IndianRupee, Landmark, Loader2, QrCode, ShieldCheck, Copy, Check, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { Address, CartItem, Order } from '../types';
import { formatOrderId, formatPrice } from '../utils/formatting';
import { generateUpiUrl, generateQrCode, validateUpiReference, validateBankReference } from '../utils/payment';
import { sendPaymentSuccessNotification, formatPhoneForSms, isValidEmail, isValidPhone } from '../utils/notifications';

type PaymentMethod = Order['paymentMethod'];

interface PaymentProps {
  order: Order;
  items: CartItem[];
  address: Address;
  onBack: () => void;
  onComplete: (order: Order) => void;
}

const paymentOptions: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
}> = [
  { id: 'upi', label: 'UPI Payment', description: 'Customer pays to your UPI ID and enters the reference.' },
  { id: 'card', label: 'Card Demo', description: 'Collect card-style details for demo checkout only.' },
  { id: 'bank_transfer', label: 'Bank Transfer', description: 'Share bank details and verify using transaction reference.' },
  { id: 'cod', label: 'Cash on Delivery', description: 'Confirm now and collect payment at delivery.' },
];

const merchant = {
  upiId: '3dbysd@upi',
  bankName: '3D by SD Commerce Bank',
  accountName: '3D by SD Studio',
  accountNumber: '123456789012',
  ifsc: 'SD3D0001234',
};

const onlyDigits = (value: string) => value.replace(/\D/g, '');

export default function Payment({ order, items, address, onBack, onComplete }: PaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const [upiReference, setUpiReference] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [qrCode, setQrCode] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [card, setCard] = useState({
    name: address.fullName,
    number: '',
    expiry: '',
    cvv: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate UPI QR code on mount and when order total changes
  useEffect(() => {
    const generateQr = async () => {
      try {
        setQrLoading(true);
        const upiUrl = generateUpiUrl(
          merchant.upiId,
          '3D by SD Store',
          Math.round(order.total * 100), // Convert to paise
          `Order-${formatOrderId(order.id)}`
        );
        const qrDataUrl = await generateQrCode(upiUrl);
        setQrCode(qrDataUrl);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
        toast.error('Failed to generate QR code. Please refresh.');
      } finally {
        setQrLoading(false);
      }
    };

    if (method === 'upi') {
      generateQr();
    }
  }, [method, order.total, order.id]);

  const maskedCard = useMemo(() => {
    const digits = onlyDigits(card.number).slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }, [card.number]);

  const validatePayment = () => {
    if (method === 'upi') {
      if (!validateUpiReference(upiReference)) {
        return 'Enter a valid UPI transaction reference (6-20 characters, alphanumeric).';
      }
    }

    if (method === 'bank_transfer') {
      if (!validateBankReference(bankReference)) {
        return 'Enter a valid bank UTR reference (9-20 characters, alphanumeric).';
      }
    }

    if (method === 'card') {
      if (card.name.trim().length < 2) return 'Enter the name on card.';
      if (onlyDigits(card.number).length !== 16) return 'Enter a 16 digit card number.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) return 'Use MM/YY for expiry.';
      if (onlyDigits(card.cvv).length < 3) return 'Enter a valid CVV.';
    }

    return '';
  };

  const completePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const error = validatePayment();
    if (error) {
      toast.error(error);
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 700));

    const paymentId =
      method === 'cod'
        ? `COD-${order.id}`
        : method === 'upi'
          ? upiReference.trim().toUpperCase()
          : method === 'bank_transfer'
            ? bankReference.trim().toUpperCase()
            : `CARD-DEMO-${order.id.slice(0, 8).toUpperCase()}`;

    const completedOrder = {
      ...order,
      status: method === 'cod' ? 'confirmed' : 'paid',
      paymentMethod: method,
      paymentId,
      updatedAt: new Date().toISOString(),
    };

    // Send payment success notification
    if (isValidEmail(address.email)) {
      try {
        const notificationResult = await sendPaymentSuccessNotification({
          email: address.email,
          phone: isValidPhone(address.phone) ? address.phone : undefined,
          customerName: address.fullName,
          orderId: formatOrderId(order.id),
          amount: formatPrice(order.total),
          paymentMethod: method === 'upi' ? 'UPI' : method === 'card' ? 'Card' : method === 'bank_transfer' ? 'Bank Transfer' : 'COD',
          orderDate: new Date().toLocaleDateString('en-IN'),
        });

        if (notificationResult.success) {
          if (notificationResult.emailSent) {
            toast.success('✅ Confirmation email sent');
          }
          if (notificationResult.smsSent) {
            toast.success('✅ Confirmation SMS sent');
          }
        } else {
          console.warn('Notification failed:', notificationResult.error);
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
        // Don't fail the order completion if notification fails
      }
    }

    onComplete({
      ...completedOrder,
      status: 'paid' as const
    });
  };

  return (
    <form onSubmit={completePayment} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0">
      <div className="p-6 md:p-10 space-y-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to shipping
        </button>

        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">
            Order {formatOrderId(order.id)}
          </p>
          <h3 className="text-4xl md:text-5xl font-serif font-black italic tracking-tighter mb-3 text-zinc-900 dark:text-zinc-100">
            Payment
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl">
            Choose a no-gateway payment method. This keeps the store usable without payment provider fees while still creating complete orders and payment references.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setMethod(option.id)}
              className={`p-5 border text-left transition-all ${
                method === option.id 
                  ? 'border-primary bg-red-50 dark:bg-red-950/20' 
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                {option.id === 'upi' && <QrCode className="w-6 h-6 text-primary" />}
                {option.id === 'card' && <CreditCard className="w-6 h-6 text-primary" />}
                {option.id === 'bank_transfer' && <Landmark className="w-6 h-6 text-primary" />}
                {option.id === 'cod' && <IndianRupee className="w-6 h-6 text-primary" />}
                {method === option.id && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
              </div>
              <span className="block font-black uppercase tracking-widest text-xs text-zinc-900 dark:text-zinc-100">{option.label}</span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-2">{option.description}</span>
            </button>
          ))}
        </section>

        {method === 'upi' && (
          <section className="border border-zinc-200 dark:border-zinc-800 p-6 bg-gradient-to-br from-blue-50/50 to-zinc-50/50 dark:from-blue-950/20 dark:to-zinc-900/50 space-y-6 transition-colors">
            <div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <QrCode className="w-4 h-4 text-primary" />
                Step 1: Scan UPI QR Code
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Open any UPI app (Google Pay, Paytm, PhonePe, WhatsApp Pay) and scan this QR code to complete payment.
              </p>
              
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* QR Code Display */}
                <div className="flex flex-col items-center gap-3">
                  {qrLoading ? (
                    <div className="w-56 h-56 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center rounded-lg">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : qrCode ? (
                    <div className="relative">
                      <img 
                        src={qrCode} 
                        alt="UPI QR Code" 
                        className="w-56 h-56 bg-white border-2 border-primary p-2 rounded-lg shadow-lg"
                      />
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded text-xs font-bold whitespace-nowrap">
                        Ready to Scan
                      </div>
                    </div>
                  ) : (
                    <div className="w-56 h-56 bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center rounded-lg">
                      <span className="text-zinc-400 text-sm">QR Code Failed</span>
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold text-center max-w-56 mt-8 uppercase tracking-widest leading-relaxed">
                    Alternatively, send {formatPrice(order.total)} to: <br/>
                    <strong className="text-zinc-900 dark:text-zinc-100">{merchant.upiId}</strong>
                  </p>
                </div>

                {/* UPI Details */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                      UPI ID
                    </p>
                    <p className="text-2xl font-serif font-black italic text-primary mb-3">
                      {merchant.upiId}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(merchant.upiId);
                        setCopiedField('upi');
                        setTimeout(() => setCopiedField(null), 2000);
                        toast.success('Copied to clipboard');
                      }}
                      className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                      {copiedField === 'upi' ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
                      Amount
                    </p>
                    <p className="text-2xl font-serif font-black italic text-primary">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-zinc-300 dark:border-zinc-800" />

            <div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                Step 2: Enter Transaction Reference
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                After payment is complete, check your UPI app for the transaction reference (shown in payment confirmation). Paste it below.
              </p>
              <input
                value={upiReference}
                onChange={(e) => setUpiReference(e.target.value.toUpperCase())}
                placeholder="E.g., ABC123DEF456 or 123456789012"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 text-sm font-bold outline-none focus:border-primary text-zinc-900 dark:text-zinc-100 rounded-lg transition-all"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2 font-mono">
                Transaction Reference is a unique ID shown in your UPI app after payment confirms.
              </p>
            </div>
          </section>
        )}

        {method === 'card' && (
          <section className="border border-zinc-200 dark:border-zinc-800 p-6 bg-gradient-to-br from-orange-50/50 to-zinc-50/50 dark:from-orange-950/20 dark:to-zinc-900/50 transition-colors">
            <div className="mb-6 p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-800 rounded-lg">
              <p className="text-sm font-bold text-orange-900 dark:text-orange-400">
                ⓘ Demo Mode: This is a demonstration only. Card information is not processed or stored.
              </p>
            </div>
            
            <h4 className="font-black uppercase tracking-widest text-xs mb-5 text-zinc-900 dark:text-zinc-100">Demo Card Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={card.name}
                onChange={(e) => setCard(current => ({ ...current, name: e.target.value }))}
                placeholder="Name on card"
                className="md:col-span-2 border border-zinc-200 dark:border-zinc-800 p-4 text-sm font-bold outline-none focus:border-primary bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg transition-all"
              />
              <input
                value={maskedCard}
                onChange={(e) => setCard(current => ({ ...current, number: onlyDigits(e.target.value).slice(0, 16) }))}
                placeholder="Card number (16 digits)"
                inputMode="numeric"
                className="md:col-span-2 border border-zinc-200 dark:border-zinc-800 p-4 text-sm font-bold outline-none focus:border-primary bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg font-mono transition-all"
              />
              <input
                value={card.expiry}
                onChange={(e) => setCard(current => ({ ...current, expiry: e.target.value.slice(0, 5) }))}
                placeholder="MM/YY"
                maxLength={5}
                className="border border-zinc-200 dark:border-zinc-800 p-4 text-sm font-bold outline-none focus:border-primary bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg font-mono transition-all"
              />
              <input
                value={card.cvv}
                onChange={(e) => setCard(current => ({ ...current, cvv: onlyDigits(e.target.value).slice(0, 4) }))}
                placeholder="CVV"
                inputMode="numeric"
                maxLength={4}
                className="border border-zinc-200 dark:border-zinc-800 p-4 text-sm font-bold outline-none focus:border-primary bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-lg font-mono transition-all"
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 font-bold">
              💳 Demo card data is not sent anywhere or stored with your order.
            </p>
          </section>
        )}

        {method === 'cod' && (
          <section className="border border-green-200 dark:border-green-900/50 p-6 bg-gradient-to-br from-green-50/50 to-zinc-50/50 dark:from-green-950/20 dark:to-zinc-900/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-600 dark:bg-green-700 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-black uppercase tracking-widest text-xs mb-3 text-green-900 dark:text-green-400">
                  Cash on Delivery
                </h4>
                <p className="text-sm text-green-900 dark:text-green-400/80 mb-4 leading-relaxed">
                  Pay {formatPrice(order.total)} when your order is delivered. Our delivery partner will collect the payment at your doorstep.
                </p>
                <div className="bg-white dark:bg-zinc-900 p-4 border border-green-200 dark:border-green-900/50 rounded-lg space-y-2 transition-colors">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">What to expect:</p>
                  <ul className="text-xs text-zinc-700 dark:text-zinc-400 space-y-1">
                    <li>✓ Order will be confirmed immediately</li>
                    <li>✓ Delivery within 5-7 business days</li>
                    <li>✓ Payment collected at delivery</li>
                    <li>✓ 100% refund if you decline</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {method === 'bank_transfer' && (
          <section className="border border-zinc-200 dark:border-zinc-800 p-6 bg-gradient-to-br from-blue-50/50 to-zinc-50/50 dark:from-blue-950/20 dark:to-zinc-900/50 space-y-6 transition-colors">
            <div>
              <h4 className="font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <Building2 className="w-4 h-4 text-primary" />
                Bank Transfer Instructions
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Transfer {formatPrice(order.total)} to the bank account below. Your order will be confirmed once the payment is received.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 border-2 border-primary rounded-lg space-y-4 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Account Holder</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{merchant.accountName}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(merchant.accountName);
                      setCopiedField('name');
                      setTimeout(() => setCopiedField(null), 2000);
                      toast.success('Copied');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-primary mt-2"
                  >
                    {copiedField === 'name' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Amount</p>
                  <p className="text-lg font-bold text-primary">{formatPrice(order.total)}</p>
                </div>
              </div>

              <hr className="border-zinc-200 dark:border-zinc-800" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Bank Name</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{merchant.bankName}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(merchant.bankName);
                      setCopiedField('bank');
                      setTimeout(() => setCopiedField(null), 2000);
                      toast.success('Copied');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-primary mt-2"
                  >
                    {copiedField === 'bank' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">IFSC Code</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">{merchant.ifsc}</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(merchant.ifsc);
                      setCopiedField('ifsc');
                      setTimeout(() => setCopiedField(null), 2000);
                      toast.success('Copied');
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-primary mt-2"
                  >
                    {copiedField === 'ifsc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              <hr className="border-zinc-200 dark:border-zinc-800" />

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Account Number</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">{merchant.accountNumber}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(merchant.accountNumber);
                    setCopiedField('account');
                    setTimeout(() => setCopiedField(null), 2000);
                    toast.success('Copied');
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-primary mt-2"
                >
                  {copiedField === 'account' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg transition-colors">
              <p className="text-sm text-yellow-900 dark:text-yellow-400 font-bold mb-2">⚠️ Reference Number Required</p>
              <p className="text-xs text-yellow-800 dark:text-yellow-500 mb-4">
                After transferring, you'll receive a UTR (Unique Transaction Reference) from your bank. Paste it below to complete the order.
              </p>
              <input
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value.toUpperCase())}
                placeholder="E.g., UTR1234567890 or Bank Reference"
                className="w-full bg-white dark:bg-zinc-900 border border-yellow-300 dark:border-yellow-900 p-4 text-sm font-bold outline-none focus:border-yellow-500 text-zinc-900 dark:text-zinc-100 rounded transition-all"
              />
            </div>
          </section>
        )}
      </div>

      <aside className="bg-zinc-50 dark:bg-zinc-900/50 border-l border-zinc-100 dark:border-zinc-800 p-6 md:p-8 space-y-6 transition-colors">
        <h3 className="font-black uppercase tracking-[0.2em] text-xs text-zinc-900 dark:text-zinc-100">Payable Summary</h3>
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

        <div className="space-y-3 text-sm border-t border-zinc-200 dark:border-zinc-800 pt-5">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>Subtotal</span><span className="text-zinc-900 dark:text-zinc-100">{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>Discount</span><span className="text-green-600 dark:text-green-400">-{formatPrice(order.discount)}</span></div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>GST</span><span className="text-zinc-900 dark:text-zinc-100">{formatPrice(order.tax)}</span></div>
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400"><span>Shipping</span><span className="text-zinc-900 dark:text-zinc-100">{order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}</span></div>
          <div className="flex justify-between items-end border-t border-zinc-200 dark:border-zinc-800 pt-4">
            <span className="font-black uppercase tracking-widest text-xs text-zinc-900 dark:text-zinc-100">Total</span>
            <span className="text-3xl font-serif font-black italic text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-primary-dark disabled:opacity-60 transition-colors rounded"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {method === 'cod' ? 'Confirm COD Order' : 'Confirm Payment'}
        </button>

        <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <p className="font-bold text-zinc-700 dark:text-zinc-300 mb-1">Shipping to</p>
          <p>{address.fullName}</p>
          <p>{address.street}</p>
          <p>{address.city}, {address.state} {address.pincode}</p>
        </div>
      </aside>
    </form>
  );
}
