const API_BASE = import.meta.env.VITE_NOTIFICATION_API_URL || '';

export type PaymentConfig = {
  razorpayEnabled: boolean;
  keyId?: string;
  demoMode: boolean;
  autoVerify: boolean;
};

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as Window & { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function fetchPaymentConfig(): Promise<PaymentConfig> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/config`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return {
      razorpayEnabled: Boolean(data.razorpayEnabled || data.keyId),
      keyId: data.keyId,
      demoMode: Boolean(data.demoMode),
      autoVerify: Boolean(data.autoVerify),
    };
  } catch {
    return { razorpayEnabled: false, demoMode: true, autoVerify: true };
  }
}

export async function createRazorpayOrderOnServer(
  orderId: string,
  amount: number
): Promise<{
  success: boolean;
  razorpayOrderId?: string;
  amount?: number;
  keyId?: string;
  demo?: boolean;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/payments/razorpay/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return {
      success: true,
      razorpayOrderId: data.razorpayOrderId,
      amount: data.amount,
      keyId: data.keyId,
      demo: data.demo,
    };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export async function verifyRazorpayOnServer(payload: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/api/payments/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };
    return { success: true, order: data.order };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : 'Verification failed' };
  }
}

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function openRazorpayCheckout(options: {
  keyId: string;
  orderId: string;
  razorpayOrderId: string;
  amountPaise: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  demo?: boolean;
}): Promise<RazorpayHandlerResponse | null> {
  const loaded = await loadRazorpayScript();
  if (!loaded) return null;

  const Razorpay = (
    window as unknown as { Razorpay: new (o: object) => { open: () => void } }
  ).Razorpay;

  return new Promise((resolve, reject) => {
    const instance = new Razorpay({
      key: options.keyId,
      amount: options.amountPaise,
      currency: 'INR',
      name: '3D by SD',
      description: `Order ${options.orderId.slice(0, 8)}`,
      order_id: options.razorpayOrderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: { color: '#dc2626' },
      handler: (response: RazorpayHandlerResponse) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });

    if (options.demo) {
      resolve({
        razorpay_order_id: options.razorpayOrderId,
        razorpay_payment_id: `pay_demo_${Date.now()}`,
        razorpay_signature: `demo_sig_${Date.now()}`,
      });
      return;
    }

    instance.open();
  });
}