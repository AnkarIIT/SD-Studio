import crypto from 'crypto';

const demoOrderIds = new Set<string>();

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim()
  );
}

export function getRazorpayKeyId(): string | undefined {
  return process.env.RAZORPAY_KEY_ID?.trim();
}

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
};

export async function createRazorpayOrder(
  amountInr: number,
  receipt: string
): Promise<{ order: RazorpayOrderResponse; demo: boolean }> {
  const amountPaise = Math.round(amountInr * 100);

  if (!isRazorpayConfigured()) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }
    const demoOrderId = `order_demo_${Date.now()}`;
    if (receipt) demoOrderIds.add(demoOrderId);
    return {
      demo: true,
      order: {
        id: demoOrderId,
        amount: amountPaise,
        currency: 'INR',
        receipt,
        status: 'created',
      },
    };
  }

  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: { sd_order_id: receipt },
    }),
  });

  const data = (await res.json()) as RazorpayOrderResponse & { error?: { description?: string } };
  if (!res.ok) {
    throw new Error(data.error?.description ?? 'Razorpay order creation failed');
  }

  return { order: data, demo: false };
}

export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) return false;
    return demoOrderIds.has(razorpayOrderId);
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expected === signature;
}